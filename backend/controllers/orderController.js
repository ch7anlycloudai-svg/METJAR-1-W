const supabase = require('../config/supabase');
const { generateOrderNumber } = require('../utils/orderNumber');
const { paginate, successResponse, errorResponse } = require('../utils/helpers');

/**
 * POST /api/orders
 * Create a new order (guest checkout, no auth needed).
 * Payment method: Cash on Delivery only.
 */
async function createOrder(req, res) {
  try {
    const {
      customer_name,
      customer_phone,
      province,
      address,
      notes,
      items,
      coupon_code,
    } = req.body;

    // Calculate subtotal from items
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // Verify product exists and is available
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name_ar, name_fr, price, old_price, available, sale, product_images(url)')
        .eq('id', item.product_id)
        .single();

      if (productError || !product) {
        return errorResponse(res, `Product not found: ${item.product_id}`, 400);
      }

      if (!product.available) {
        return errorResponse(res, `Product "${product.name_fr}" is not available.`, 400);
      }

      const unitPrice = product.sale && product.old_price ? product.price : product.price;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name_ar,
        product_image: product.product_images?.[0]?.url || null,
        quantity: item.quantity,
        price: unitPrice,
        color: item.color || null,
        size: item.size || null,
      });
    }

    // Apply coupon if provided
    let discount = 0;
    let appliedCouponId = null;

    if (coupon_code) {
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.toUpperCase())
        .eq('active', true)
        .single();

      if (!couponError && coupon) {
        const now = new Date();
        const isExpired = coupon.expires_at && new Date(coupon.expires_at) < now;
        const isMaxedOut = coupon.max_uses && coupon.used_count >= coupon.max_uses;
        const meetsMinOrder = !coupon.min_order || subtotal >= coupon.min_order;

        if (!isExpired && !isMaxedOut && meetsMinOrder) {
          if (coupon.discount_type === 'percentage') {
            discount = (subtotal * coupon.discount_value) / 100;
          } else {
            discount = coupon.discount_value;
          }
          discount = Math.min(discount, subtotal);
          appliedCouponId = coupon.id;
        }
      }
    }

    const total = subtotal - discount;

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order record
    const orderData = {
      order_number: orderNumber,
      customer_name,
      customer_phone,
      province,
      address,
      notes: notes || null,
      subtotal,
      discount,
      total,
      coupon_id: appliedCouponId,
      status: 'pending',
      payment_method: 'cash_on_delivery',
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Create order error:', orderError);
      return errorResponse(res, 'Failed to create order.');
    }

    // Create order items
    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error('Create order items error:', itemsError);
      // Rollback order
      await supabase.from('orders').delete().eq('id', order.id);
      return errorResponse(res, 'Failed to create order items.');
    }

    // Increment coupon used_count
    if (appliedCouponId) {
      await supabase.rpc('increment_coupon_usage', { coupon_uuid: appliedCouponId });
    }

    return successResponse(res, {
      order: {
        ...order,
        items: orderItems,
      },
    }, 201);
  } catch (err) {
    console.error('Create order error:', err);
    return errorResponse(res, 'Server error creating order.');
  }
}

/**
 * GET /api/orders (admin)
 * List all orders with filters and pagination.
 */
async function getOrders(req, res) {
  try {
    const { status, search, sort, page, limit } = req.query;
    const { from, to, page: currentPage, limit: perPage } = paginate(page, limit);

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(
        `customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%,order_number.ilike.%${search}%`
      );
    }

    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'total_asc':
        query = query.order('total', { ascending: true });
        break;
      case 'total_desc':
        query = query.order('total', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Get orders error:', error);
      return errorResponse(res, 'Failed to fetch orders.');
    }

    return successResponse(res, {
      orders: data,
      pagination: {
        page: currentPage,
        limit: perPage,
        total: count,
        totalPages: Math.ceil(count / perPage),
      },
    });
  } catch (err) {
    console.error('Get orders error:', err);
    return errorResponse(res, 'Server error fetching orders.');
  }
}

/**
 * GET /api/orders/:id (admin)
 * Get order details with items.
 */
async function getOrder(req, res) {
  try {
    const { id } = req.params;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return errorResponse(res, 'Order not found.', 404);
    }

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, products(name_ar, name_fr, product_images(url))')
      .eq('order_id', id);

    if (itemsError) {
      console.error('Get order items error:', itemsError);
    }

    return successResponse(res, {
      order: {
        ...order,
        items: items || [],
      },
    });
  } catch (err) {
    console.error('Get order error:', err);
    return errorResponse(res, 'Server error fetching order.');
  }
}

/**
 * PUT /api/orders/:id/status (admin)
 * Update order status.
 */
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update order status error:', error);
      return errorResponse(res, 'Failed to update order status.');
    }

    if (!data) {
      return errorResponse(res, 'Order not found.', 404);
    }

    return successResponse(res, { order: data });
  } catch (err) {
    console.error('Update order status error:', err);
    return errorResponse(res, 'Server error updating order status.');
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
};
