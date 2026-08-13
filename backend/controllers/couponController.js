const supabase = require('../config/supabase');
const { paginate, successResponse, errorResponse } = require('../utils/helpers');

/**
 * GET /api/coupons (admin)
 * List all coupons.
 */
async function getCoupons(req, res) {
  try {
    const { active, search, page, limit } = req.query;
    const { from, to, page: currentPage, limit: perPage } = paginate(page, limit);

    let query = supabase
      .from('coupons')
      .select('*', { count: 'exact' });

    if (active === 'true') {
      query = query.eq('active', true);
    } else if (active === 'false') {
      query = query.eq('active', false);
    }

    if (search) {
      query = query.ilike('code', `%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Get coupons error:', error);
      return errorResponse(res, 'Failed to fetch coupons.');
    }

    return successResponse(res, {
      coupons: data,
      pagination: {
        page: currentPage,
        limit: perPage,
        total: count,
        totalPages: Math.ceil(count / perPage),
      },
    });
  } catch (err) {
    console.error('Get coupons error:', err);
    return errorResponse(res, 'Server error fetching coupons.');
  }
}

/**
 * GET /api/coupons/:id (admin)
 * Get single coupon.
 */
async function getCoupon(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return errorResponse(res, 'Coupon not found.', 404);
    }

    return successResponse(res, { coupon: data });
  } catch (err) {
    console.error('Get coupon error:', err);
    return errorResponse(res, 'Server error fetching coupon.');
  }
}

/**
 * POST /api/coupons (admin)
 * Create a new coupon.
 */
async function createCoupon(req, res) {
  try {
    const {
      code,
      discount_type,
      discount_value,
      min_order,
      max_uses,
      active,
      expires_at,
    } = req.body;

    const couponData = {
      code: code.toUpperCase(),
      discount_type,
      discount_value: parseFloat(discount_value),
      min_order: min_order ? parseFloat(min_order) : 0,
      max_uses: max_uses ? parseInt(max_uses, 10) : null,
      used_count: 0,
      active: active !== undefined ? active : true,
      expires_at: expires_at || null,
    };

    const { data, error } = await supabase
      .from('coupons')
      .insert(couponData)
      .select()
      .single();

    if (error) {
      console.error('Create coupon error:', error);
      if (error.code === '23505') {
        return errorResponse(res, 'A coupon with this code already exists.', 409);
      }
      return errorResponse(res, 'Failed to create coupon.');
    }

    return successResponse(res, { coupon: data }, 201);
  } catch (err) {
    console.error('Create coupon error:', err);
    return errorResponse(res, 'Server error creating coupon.');
  }
}

/**
 * PUT /api/coupons/:id (admin)
 * Update a coupon.
 */
async function updateCoupon(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.code) {
      updates.code = updates.code.toUpperCase();
    }
    if (updates.discount_value !== undefined) {
      updates.discount_value = parseFloat(updates.discount_value);
    }
    if (updates.min_order !== undefined) {
      updates.min_order = parseFloat(updates.min_order);
    }
    if (updates.max_uses !== undefined) {
      updates.max_uses = updates.max_uses ? parseInt(updates.max_uses, 10) : null;
    }

    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update coupon error:', error);
      if (error.code === '23505') {
        return errorResponse(res, 'A coupon with this code already exists.', 409);
      }
      return errorResponse(res, 'Failed to update coupon.');
    }

    if (!data) {
      return errorResponse(res, 'Coupon not found.', 404);
    }

    return successResponse(res, { coupon: data });
  } catch (err) {
    console.error('Update coupon error:', err);
    return errorResponse(res, 'Server error updating coupon.');
  }
}

/**
 * DELETE /api/coupons/:id (admin)
 * Delete a coupon.
 */
async function deleteCoupon(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete coupon error:', error);
      return errorResponse(res, 'Failed to delete coupon.');
    }

    return successResponse(res, { message: 'Coupon deleted successfully.' });
  } catch (err) {
    console.error('Delete coupon error:', err);
    return errorResponse(res, 'Server error deleting coupon.');
  }
}

/**
 * POST /api/coupons/validate (public)
 * Validate a coupon code.
 */
async function validateCoupon(req, res) {
  try {
    const { code, order_total } = req.body;

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single();

    if (error || !coupon) {
      return errorResponse(res, 'Invalid coupon code.', 404);
    }

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return errorResponse(res, 'This coupon has expired.', 400);
    }

    // Check max uses
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return errorResponse(res, 'This coupon has reached its maximum usage limit.', 400);
    }

    // Check minimum order
    if (order_total && coupon.min_order && parseFloat(order_total) < coupon.min_order) {
      return errorResponse(
        res,
        `Minimum order amount for this coupon is ${coupon.min_order} DA.`,
        400
      );
    }

    // Calculate discount
    let discount = 0;
    if (order_total) {
      const total = parseFloat(order_total);
      if (coupon.discount_type === 'percentage') {
        discount = (total * coupon.discount_value) / 100;
      } else {
        discount = coupon.discount_value;
      }
      discount = Math.min(discount, total);
    }

    return successResponse(res, {
      valid: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order: coupon.min_order,
      },
      discount,
    });
  } catch (err) {
    console.error('Validate coupon error:', err);
    return errorResponse(res, 'Server error validating coupon.');
  }
}

module.exports = {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
