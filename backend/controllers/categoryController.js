const supabase = require('../config/supabase');
const { successResponse, errorResponse, slugify } = require('../utils/helpers');

/**
 * GET /api/categories
 * List all categories.
 */
async function getCategories(req, res) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name_fr', { ascending: true });

    if (error) {
      console.error('Get categories error:', error);
      return errorResponse(res, 'Failed to fetch categories.');
    }

    return successResponse(res, { categories: data });
  } catch (err) {
    console.error('Get categories error:', err);
    return errorResponse(res, 'Server error fetching categories.');
  }
}

/**
 * GET /api/categories/:id
 * Get single category.
 */
async function getCategory(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return errorResponse(res, 'Category not found.', 404);
    }

    return successResponse(res, { category: data });
  } catch (err) {
    console.error('Get category error:', err);
    return errorResponse(res, 'Server error fetching category.');
  }
}

/**
 * POST /api/categories (admin)
 * Create a new category.
 */
async function createCategory(req, res) {
  try {
    const { name_ar, name_fr, image } = req.body;
    const slug = req.body.slug || slugify(name_fr);

    const categoryData = {
      name_ar,
      name_fr,
      slug,
      image: image || null,
    };

    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) {
      console.error('Create category error:', error);
      if (error.code === '23505') {
        return errorResponse(res, 'A category with this slug already exists.', 409);
      }
      return errorResponse(res, 'Failed to create category.');
    }

    return successResponse(res, { category: data }, 201);
  } catch (err) {
    console.error('Create category error:', err);
    return errorResponse(res, 'Server error creating category.');
  }
}

/**
 * PUT /api/categories/:id (admin)
 * Update a category.
 */
async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.name_fr && !updates.slug) {
      updates.slug = slugify(updates.name_fr);
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update category error:', error);
      if (error.code === '23505') {
        return errorResponse(res, 'A category with this slug already exists.', 409);
      }
      return errorResponse(res, 'Failed to update category.');
    }

    if (!data) {
      return errorResponse(res, 'Category not found.', 404);
    }

    return successResponse(res, { category: data });
  } catch (err) {
    console.error('Update category error:', err);
    return errorResponse(res, 'Server error updating category.');
  }
}

/**
 * DELETE /api/categories/:id (admin)
 * Delete a category.
 */
async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete category error:', error);
      return errorResponse(res, 'Failed to delete category.');
    }

    return successResponse(res, { message: 'Category deleted successfully.' });
  } catch (err) {
    console.error('Delete category error:', err);
    return errorResponse(res, 'Server error deleting category.');
  }
}

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
