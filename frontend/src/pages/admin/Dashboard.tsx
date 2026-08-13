import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import type { Order, Product } from '../../types';
import { FiBox, FiShoppingCart, FiClock, FiDollarSign, FiPlus, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.getProducts(),
        api.getOrders(),
      ]);

      const products: Product[] = productsRes.products || productsRes || [];
      const orders: Order[] = ordersRes.orders || ordersRes || [];

      const pendingOrders = orders.filter((o) => o.status === 'pending').length;
      const totalRevenue = orders
        .filter((o) => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue,
      });

      setRecentOrders(orders.slice(0, 10));
    } catch (err: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: FiBox, color: '#FE8B7C' },
    { label: 'Total Orders', value: stats.totalOrders, icon: FiShoppingCart, color: '#4F46E5' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: FiClock, color: '#F59E0B' },
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: FiDollarSign, color: '#10B981' },
  ];

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#FE8B7C' }} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${card.color}20` }}
              >
                <card.icon size={24} style={{ color: card.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          to="/admin/products/new"
          className="flex items-center gap-3 bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FE8B7C' }}>
            <FiPlus className="text-white" size={20} />
          </div>
          <span className="font-medium text-gray-700">Add New Product</span>
        </Link>
        <Link
          to="/admin/orders"
          className="flex items-center gap-3 bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500">
            <FiEye className="text-white" size={20} />
          </div>
          <span className="font-medium text-gray-700">View All Orders</span>
        </Link>
        <Link
          to="/admin/categories"
          className="flex items-center gap-3 bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500">
            <FiPlus className="text-white" size={20} />
          </div>
          <span className="font-medium text-gray-700">Manage Categories</span>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-sm font-medium hover:underline"
            style={{ color: '#FE8B7C' }}
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.customer_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#FE8B7C' }}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
