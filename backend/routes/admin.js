const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticateAdmin } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics.
 */
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    // Run all queries in parallel
    const [
      ordersRes,
      pendingRes,
      productsRes,
      revenueRes,
      recentOrdersRes,
    ] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('total').in('status', ['confirmed', 'shipped', 'delivered']),
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const totalOrders = ordersRes.count || 0;
    const pendingOrders = pendingRes.count || 0;
    const totalProducts = productsRes.count || 0;
    const totalRevenue = (revenueRes.data || []).reduce((sum, o) => sum + (o.total || 0), 0);

    // Orders by status
    const statusCounts = {};
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    const statusQueries = await Promise.all(
      statuses.map((status) =>
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', status)
      )
    );
    statuses.forEach((status, i) => {
      statusCounts[status] = statusQueries[i].count || 0;
    });

    return successResponse(res, {
      stats: {
        total_orders: totalOrders,
        pending_orders: pendingOrders,
        total_products: totalProducts,
        total_revenue: totalRevenue,
        orders_by_status: statusCounts,
      },
      recent_orders: recentOrdersRes.data || [],
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return errorResponse(res, 'Server error fetching dashboard data.');
  }
});

module.exports = router;
