const supabase = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * GET /api/homepage/sections (public)
 * Get all homepage sections.
 */
async function getSections(req, res) {
  try {
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Get homepage sections error:', error);
      return errorResponse(res, 'Failed to fetch homepage sections.');
    }

    // Also fetch featured products, new arrivals, and sale products
    const [featuredRes, newArrivalsRes, saleRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, product_images(*), categories(name_ar, name_fr)')
        .eq('featured', true)
        .eq('available', true)
        .order('created_at', { ascending: false })
        .limit(12),
      supabase
        .from('products')
        .select('*, product_images(*), categories(name_ar, name_fr)')
        .eq('new_arrival', true)
        .eq('available', true)
        .order('created_at', { ascending: false })
        .limit(12),
      supabase
        .from('products')
        .select('*, product_images(*), categories(name_ar, name_fr)')
        .eq('sale', true)
        .eq('available', true)
        .order('created_at', { ascending: false })
        .limit(12),
    ]);

    // Fetch categories for homepage display
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .order('name_fr', { ascending: true });

    return successResponse(res, {
      sections: data || [],
      featured_products: featuredRes.data || [],
      new_arrivals: newArrivalsRes.data || [],
      sale_products: saleRes.data || [],
      categories: categories || [],
    });
  } catch (err) {
    console.error('Get homepage sections error:', err);
    return errorResponse(res, 'Server error fetching homepage sections.');
  }
}

/**
 * PUT /api/homepage/hero (admin)
 * Update hero section.
 */
async function updateHero(req, res) {
  try {
    const {
      title_ar,
      title_fr,
      subtitle_ar,
      subtitle_fr,
      image,
      button_text_ar,
      button_text_fr,
      link,
      active,
    } = req.body;

    const heroData = {
      section_type: 'hero',
      title_ar: title_ar || null,
      title_fr: title_fr || null,
      subtitle_ar: subtitle_ar || null,
      subtitle_fr: subtitle_fr || null,
      image: image || null,
      link: link || null,
      config: {
        button_text_ar: button_text_ar || null,
        button_text_fr: button_text_fr || null,
      },
      active: active !== undefined ? active : true,
      updated_at: new Date().toISOString(),
    };

    // Check if hero section exists
    const { data: existing } = await supabase
      .from('homepage_sections')
      .select('id')
      .eq('section_type', 'hero')
      .single();

    let data, error;

    if (existing && existing.id) {
      ({ data, error } = await supabase
        .from('homepage_sections')
        .update(heroData)
        .eq('id', existing.id)
        .select()
        .single());
    } else {
      heroData.sort_order = 0;
      ({ data, error } = await supabase
        .from('homepage_sections')
        .insert(heroData)
        .select()
        .single());
    }

    if (error) {
      console.error('Update hero error:', error);
      return errorResponse(res, 'Failed to update hero section.');
    }

    return successResponse(res, { section: data });
  } catch (err) {
    console.error('Update hero error:', err);
    return errorResponse(res, 'Server error updating hero section.');
  }
}

/**
 * PUT /api/homepage/banner (admin)
 * Update banner section.
 */
async function updateBanner(req, res) {
  try {
    const {
      title_ar,
      title_fr,
      subtitle_ar,
      subtitle_fr,
      image,
      button_text_ar,
      button_text_fr,
      link,
      active,
    } = req.body;

    const bannerData = {
      section_type: 'banner',
      title_ar: title_ar || null,
      title_fr: title_fr || null,
      subtitle_ar: subtitle_ar || null,
      subtitle_fr: subtitle_fr || null,
      image: image || null,
      link: link || null,
      config: {
        button_text_ar: button_text_ar || null,
        button_text_fr: button_text_fr || null,
      },
      active: active !== undefined ? active : true,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from('homepage_sections')
      .select('id')
      .eq('section_type', 'banner')
      .single();

    let data, error;

    if (existing && existing.id) {
      ({ data, error } = await supabase
        .from('homepage_sections')
        .update(bannerData)
        .eq('id', existing.id)
        .select()
        .single());
    } else {
      bannerData.sort_order = 1;
      ({ data, error } = await supabase
        .from('homepage_sections')
        .insert(bannerData)
        .select()
        .single());
    }

    if (error) {
      console.error('Update banner error:', error);
      return errorResponse(res, 'Failed to update banner section.');
    }

    return successResponse(res, { section: data });
  } catch (err) {
    console.error('Update banner error:', err);
    return errorResponse(res, 'Server error updating banner section.');
  }
}

/**
 * PUT /api/homepage/sections/:id (admin)
 * Update any homepage section by ID.
 */
async function updateSection(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    updates.updated_at = new Date().toISOString();

    // Remove any non-schema fields that might be sent
    delete updates.button_text_ar;
    delete updates.button_text_fr;
    delete updates.button_link;
    delete updates.content;

    const { data, error } = await supabase
      .from('homepage_sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update section error:', error);
      return errorResponse(res, 'Failed to update section.');
    }

    if (!data) {
      return errorResponse(res, 'Section not found.', 404);
    }

    return successResponse(res, { section: data });
  } catch (err) {
    console.error('Update section error:', err);
    return errorResponse(res, 'Server error updating section.');
  }
}

/**
 * POST /api/homepage/sections (admin)
 * Create a new homepage section.
 */
async function createSection(req, res) {
  try {
    const {
      section_type,
      title_ar,
      title_fr,
      subtitle_ar,
      subtitle_fr,
      image,
      link,
      config,
      sort_order,
      active,
    } = req.body;

    const sectionData = {
      section_type: section_type || 'custom',
      title_ar: title_ar || null,
      title_fr: title_fr || null,
      subtitle_ar: subtitle_ar || null,
      subtitle_fr: subtitle_fr || null,
      image: image || null,
      link: link || null,
      config: config || null,
      sort_order: sort_order || 99,
      active: active !== undefined ? active : true,
    };

    const { data, error } = await supabase
      .from('homepage_sections')
      .insert(sectionData)
      .select()
      .single();

    if (error) {
      console.error('Create section error:', error);
      return errorResponse(res, 'Failed to create section.');
    }

    return successResponse(res, { section: data }, 201);
  } catch (err) {
    console.error('Create section error:', err);
    return errorResponse(res, 'Server error creating section.');
  }
}

/**
 * DELETE /api/homepage/sections/:id (admin)
 * Delete a homepage section.
 */
async function deleteSection(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('homepage_sections')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete section error:', error);
      return errorResponse(res, 'Failed to delete section.');
    }

    return successResponse(res, { message: 'Section deleted successfully.' });
  } catch (err) {
    console.error('Delete section error:', err);
    return errorResponse(res, 'Server error deleting section.');
  }
}

module.exports = {
  getSections,
  updateHero,
  updateBanner,
  updateSection,
  createSection,
  deleteSection,
};
