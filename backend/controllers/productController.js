const { v4: uuidv4 } = require('uuid');
const path = require('path');
const supabase = require('../config/supabase');
const { paginate, successResponse, errorResponse, slugify } = require('../utils/helpers');

/**
 * Helper: extract storage path from a Supabase public URL.
 * E.g. "https://xxx.supabase.co/storage/v1/object/public/products/abc/def.jpg"
 * returns "abc/def.jpg"
 */
function extractStoragePath(url) {
  if (!url) return null;
  const marker = '/storage/v1/object/public/products/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.substring(idx + marker.length);
}

/**
 * GET /api/products
 * List all products with filters, search, sort, and pagination.
 */
async function getProducts(req, res) {
  try {
    const {
      category,
      color,
      size,
      min_price,
      max_price,
      search,
      sort,
      featured,
      new_arrival,
      sale,
      available,
      page,
      limit,
    } = req.query;

    const { from, to, page: currentPage, limit: perPage } = paginate(page, limit);

    // If filtering by color or size, first find matching product IDs
    let productIdsByColor = null;
    let productIdsBySize = null;

    if (color) {
      const { data: colorRows } = await supabase
        .from('product_colors')
        .select('product_id')
        .eq('hex_code', color);
      productIdsByColor = colorRows ? colorRows.map((r) => r.product_id) : [];
    }

    if (size) {
      const { data: sizeRows } = await supabase
        .from('product_sizes')
        .select('product_id')
        .eq('size', size);
      productIdsBySize = sizeRows ? sizeRows.map((r) => r.product_id) : [];
    }

    // If both filters are set, intersect
    let filteredIds = null;
    if (productIdsByColor !== null && productIdsBySize !== null) {
      const sizeSet = new Set(productIdsBySize);
      filteredIds = productIdsByColor.filter((id) => sizeSet.has(id));
    } else if (productIdsByColor !== null) {
      filteredIds = productIdsByColor;
    } else if (productIdsBySize !== null) {
      filteredIds = productIdsBySize;
    }

    // If color/size filters yielded no products, return empty
    if (filteredIds !== null && filteredIds.length === 0) {
      return successResponse(res, {
        products: [],
        pagination: {
          page: currentPage,
          limit: perPage,
          total: 0,
          totalPages: 0,
        },
      });
    }

    let query = supabase
      .from('products')
      .select('*, product_images(*), product_colors(*), product_sizes(*), categories(name_ar, name_fr, slug)', { count: 'exact' });

    // Filters
    if (category) {
      query = query.eq('category_id', category);
    }

    if (filteredIds !== null) {
      query = query.in('id', filteredIds);
    }

    if (min_price) {
      query = query.gte('price', parseFloat(min_price));
    }

    if (max_price) {
      query = query.lte('price', parseFloat(max_price));
    }

    if (search) {
      query = query.or(`name_ar.ilike.%${search}%,name_fr.ilike.%${search}%`);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (new_arrival === 'true') {
      query = query.eq('new_arrival', true);
    }

    if (sale === 'true') {
      query = query.eq('sale', true);
    }

    if (available === 'true') {
      query = query.eq('available', true);
    } else if (available === 'false') {
      query = query.eq('available', false);
    }

    // Sort
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'name_asc':
        query = query.order('name_fr', { ascending: true });
        break;
      case 'name_desc':
        query = query.order('name_fr', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Get products error:', error);
      return errorResponse(res, 'Failed to fetch products.');
    }

    return successResponse(res, {
      products: data,
      pagination: {
        page: currentPage,
        limit: perPage,
        total: count,
        totalPages: Math.ceil(count / perPage),
      },
    });
  } catch (err) {
    console.error('Get products error:', err);
    return errorResponse(res, 'Server error fetching products.');
  }
}

/**
 * GET /api/products/:id
 * Get single product with images, colors, and sizes.
 */
async function getProduct(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_colors(*), product_sizes(*), categories(name_ar, name_fr, slug)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return errorResponse(res, 'Product not found.', 404);
    }

    return successResponse(res, { product: data });
  } catch (err) {
    console.error('Get product error:', err);
    return errorResponse(res, 'Server error fetching product.');
  }
}

/**
 * POST /api/products (admin)
 * Create a new product.
 */
async function createProduct(req, res) {
  try {
    const {
      name_ar,
      name_fr,
      description_ar,
      description_fr,
      price,
      old_price,
      category_id,
      colors,
      sizes,
      available,
      featured,
      new_arrival,
      sale,
    } = req.body;

    const slug = slugify(name_fr);

    const productData = {
      name_ar,
      name_fr,
      slug,
      description_ar: description_ar || null,
      description_fr: description_fr || null,
      price: parseFloat(price),
      old_price: old_price ? parseFloat(old_price) : null,
      category_id: category_id || null,
      available: available !== undefined ? available : true,
      featured: featured || false,
      new_arrival: new_arrival || false,
      sale: sale || false,
    };

    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('Create product error:', error);
      return errorResponse(res, 'Failed to create product.');
    }

    // Insert colors into product_colors table
    if (colors && Array.isArray(colors) && colors.length > 0) {
      const colorRows = colors.map((c) => ({
        product_id: data.id,
        name_ar: c.name_ar,
        name_fr: c.name_fr,
        hex_code: c.hex_code,
      }));
      const { error: colorsError } = await supabase
        .from('product_colors')
        .insert(colorRows);
      if (colorsError) {
        console.error('Insert product colors error:', colorsError);
      }
    }

    // Insert sizes into product_sizes table
    if (sizes && Array.isArray(sizes) && sizes.length > 0) {
      const sizeRows = sizes.map((size) => ({
        product_id: data.id,
        size,
      }));
      const { error: sizesError } = await supabase
        .from('product_sizes')
        .insert(sizeRows);
      if (sizesError) {
        console.error('Insert product sizes error:', sizesError);
      }
    }

    // Fetch the complete product with colors and sizes
    const { data: fullProduct } = await supabase
      .from('products')
      .select('*, product_images(*), product_colors(*), product_sizes(*), categories(name_ar, name_fr, slug)')
      .eq('id', data.id)
      .single();

    return successResponse(res, { product: fullProduct || data }, 201);
  } catch (err) {
    console.error('Create product error:', err);
    return errorResponse(res, 'Server error creating product.');
  }
}

/**
 * PUT /api/products/:id (admin)
 * Update a product.
 */
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Extract colors and sizes before updating product row
    const colors = updates.colors;
    const sizes = updates.sizes;
    delete updates.colors;
    delete updates.sizes;

    // Regenerate slug if name_fr is being updated
    if (updates.name_fr) {
      updates.slug = slugify(updates.name_fr);
    }

    if (updates.price !== undefined) {
      updates.price = parseFloat(updates.price);
    }

    if (updates.old_price !== undefined) {
      updates.old_price = updates.old_price ? parseFloat(updates.old_price) : null;
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update product error:', error);
      return errorResponse(res, 'Failed to update product.');
    }

    if (!data) {
      return errorResponse(res, 'Product not found.', 404);
    }

    // Update colors if provided
    if (colors !== undefined && Array.isArray(colors)) {
      // Delete existing colors
      await supabase.from('product_colors').delete().eq('product_id', id);
      // Insert new colors
      if (colors.length > 0) {
        const colorRows = colors.map((c) => ({
          product_id: id,
          name_ar: c.name_ar,
          name_fr: c.name_fr,
          hex_code: c.hex_code,
        }));
        const { error: colorsError } = await supabase
          .from('product_colors')
          .insert(colorRows);
        if (colorsError) {
          console.error('Update product colors error:', colorsError);
        }
      }
    }

    // Update sizes if provided
    if (sizes !== undefined && Array.isArray(sizes)) {
      // Delete existing sizes
      await supabase.from('product_sizes').delete().eq('product_id', id);
      // Insert new sizes
      if (sizes.length > 0) {
        const sizeRows = sizes.map((size) => ({
          product_id: id,
          size,
        }));
        const { error: sizesError } = await supabase
          .from('product_sizes')
          .insert(sizeRows);
        if (sizesError) {
          console.error('Update product sizes error:', sizesError);
        }
      }
    }

    // Fetch the complete product with colors, sizes, and images
    const { data: fullProduct } = await supabase
      .from('products')
      .select('*, product_images(*), product_colors(*), product_sizes(*), categories(name_ar, name_fr, slug)')
      .eq('id', id)
      .single();

    return successResponse(res, { product: fullProduct || data });
  } catch (err) {
    console.error('Update product error:', err);
    return errorResponse(res, 'Server error updating product.');
  }
}

/**
 * DELETE /api/products/:id (admin)
 * Delete a product and its images.
 * Colors and sizes cascade automatically via FK ON DELETE CASCADE.
 */
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    // Get product images to delete from storage
    const { data: images } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', id);

    // Delete images from Supabase Storage
    if (images && images.length > 0) {
      const paths = images
        .map((img) => extractStoragePath(img.url))
        .filter(Boolean);
      if (paths.length > 0) {
        await supabase.storage.from('products').remove(paths);
      }
    }

    // Delete product (images, colors, sizes cascade via FK)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete product error:', error);
      return errorResponse(res, 'Failed to delete product.');
    }

    return successResponse(res, { message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('Delete product error:', err);
    return errorResponse(res, 'Server error deleting product.');
  }
}

/**
 * POST /api/products/:id/images (admin)
 * Upload images for a product to Supabase Storage.
 */
async function uploadProductImages(req, res) {
  try {
    const { id } = req.params;

    // Verify product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (productError || !product) {
      return errorResponse(res, 'Product not found.', 404);
    }

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'No images provided.', 400);
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const fileExt = path.extname(file.originalname).toLowerCase();
      const fileName = `${id}/${uuidv4()}${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      const imageRecord = {
        product_id: id,
        url: urlData.publicUrl,
        alt: file.originalname,
        sort_order: uploadedImages.length,
      };

      const { data: savedImage, error: saveError } = await supabase
        .from('product_images')
        .insert(imageRecord)
        .select()
        .single();

      if (!saveError && savedImage) {
        uploadedImages.push(savedImage);
      }
    }

    return successResponse(res, { images: uploadedImages }, 201);
  } catch (err) {
    console.error('Upload images error:', err);
    return errorResponse(res, 'Server error uploading images.');
  }
}

/**
 * DELETE /api/products/images/:imageId (admin)
 * Delete a single product image.
 */
async function deleteProductImage(req, res) {
  try {
    const { imageId } = req.params;

    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (fetchError || !image) {
      return errorResponse(res, 'Image not found.', 404);
    }

    // Delete from storage by extracting path from URL
    const storagePath = extractStoragePath(image.url);
    if (storagePath) {
      await supabase.storage.from('products').remove([storagePath]);
    }

    // Delete record
    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (deleteError) {
      console.error('Delete image error:', deleteError);
      return errorResponse(res, 'Failed to delete image.');
    }

    return successResponse(res, { message: 'Image deleted successfully.' });
  } catch (err) {
    console.error('Delete image error:', err);
    return errorResponse(res, 'Server error deleting image.');
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
};
