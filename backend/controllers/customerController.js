const supabase = require('../config/supabase');
const { paginate, successResponse, errorResponse } = require('../utils/helpers');

/**
 * GET /api/customers (admin)
 * List customers who have placed orders.
 * Aggregated from orders table by phone number.
 */
async function getCustomers(req, res) {
  try {
    const { search, page, limit } = req.query;
    const { from, to, page: currentPage, limit: perPage } = paginate(page, limit);

    let query = supabase
      .from('orders')
      .select('customer_name, customer_phone, customer_province, customer_address', { count: 'exact' });

    if (search) {
      query = query.or(
        `customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`
      );
    }

    query = query.order('created_at', { ascending: false });

    const { data: allOrders, error: allError } = await query;

    if (allError) {
      console.error('Get customers error:', allError);
      return errorResponse(res, 'Failed to fetch customers.');
    }

    // Aggregate unique customers by phone number
    const customerMap = new Map();
    for (const order of allOrders) {
      if (!customerMap.has(order.customer_phone)) {
        customerMap.set(order.customer_phone, {
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_province: order.customer_province,
          customer_address: order.customer_address,
          order_count: 1,
        });
      } else {
        customerMap.get(order.customer_phone).order_count += 1;
      }
    }

    const allCustomers = Array.from(customerMap.values());
    const total = allCustomers.length;
    const customers = allCustomers.slice(from, to + 1);

    return successResponse(res, {
      customers,
      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (err) {
    console.error('Get customers error:', err);
    return errorResponse(res, 'Server error fetching customers.');
  }
}

/**
 * GET /api/customers/:id (admin)
 * Get customer details with all their orders.
 * :id here is the customer phone number (URL-encoded).
 */
async function getCustomer(req, res) {
  try {
    const { id } = req.params;
    const phone = decodeURIComponent(id);

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name_ar, name_fr, product_images(url)))')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get customer error:', error);
      return errorResponse(res, 'Failed to fetch customer details.');
    }

    if (!orders || orders.length === 0) {
      return errorResponse(res, 'Customer not found.', 404);
    }

    const customer = {
      customer_name: orders[0].customer_name,
      customer_phone: orders[0].customer_phone,
      customer_province: orders[0].customer_province,
      customer_address: orders[0].customer_address,
      total_orders: orders.length,
      total_spent: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      orders,
    };

    return successResponse(res, { customer });
  } catch (err) {
    console.error('Get customer error:', err);
    return errorResponse(res, 'Server error fetching customer.');
  }
}

module.exports = {
  getCustomers,
  getCustomer,
};
