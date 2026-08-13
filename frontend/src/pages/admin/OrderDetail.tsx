import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import type { Order, OrderStatus } from '../../types';
import { FiArrowLeft, FiPhone, FiMapPin, FiUser, FiFileText, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const getStatusColor = (status: string) => {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    shipped: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
    delivered: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  };
  return map[status] || { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
};

const OrderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) loadOrder(id);
  }, [id]);

  const loadOrder = async (orderId: string) => {
    try {
      const res = await api.getOrder(orderId);
      setOrder(res.order || res);
    } catch {
      toast.error('Failed to load order');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order || !id) return;
    setUpdatingStatus(true);
    try {
      await api.updateOrderStatus(id, newStatus);
      setOrder((prev) => (prev ? { ...prev, status: newStatus as OrderStatus } : prev));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#FE8B7C' }} />
      </div>
    );
  }

  if (!order) return null;

  const statusColor = getStatusColor(order.status);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Order {order.order_number}</h1>
            <div className="flex items-center gap-2 mt-1">
              <FiCalendar size={14} className="text-gray-400" />
              <span className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusColor.bg} ${statusColor.text}`}>
          <span className={`w-2 h-2 rounded-full ${statusColor.dot}`} />
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Color</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(order.items || []).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.product_image && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-800">{item.product_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.color || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.size || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatPrice(item.price)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col items-end gap-1">
                <div className="flex justify-between w-48">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium text-gray-800">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between w-48">
                    <span className="text-sm text-gray-600">Discount:</span>
                    <span className="text-sm font-medium text-red-600">-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between w-48 pt-2 border-t border-gray-300 mt-1">
                  <span className="text-sm font-semibold text-gray-800">Total:</span>
                  <span className="text-sm font-bold text-gray-800">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Update Status</h2>
            <select
              value={order.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              disabled={updatingStatus}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm disabled:opacity-50"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            {updatingStatus && (
              <p className="text-xs text-gray-500 mt-2">Updating...</p>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FiUser size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-800">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiPhone size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-800">{order.customer_phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiMapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Province</p>
                  <p className="text-sm font-medium text-gray-800">{order.province}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiMapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-800">{order.address}</p>
                </div>
              </div>
              {order.notes && (
                <div className="flex items-start gap-3">
                  <FiFileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Notes</p>
                    <p className="text-sm text-gray-700">{order.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment</h2>
            <p className="text-sm text-gray-600">
              Method: <span className="font-medium text-gray-800">{order.payment_method}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
