import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import type { Coupon } from '../../types';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CouponForm {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  min_order: string;
  max_uses: string;
  active: boolean;
  expires_at: string;
}

const emptyForm: CouponForm = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order: '0',
  max_uses: '',
  active: true,
  expires_at: '',
};

const CouponsList: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const res = await api.getCoupons();
      setCoupons(res.coupons || res || []);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditId(coupon.id);
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order: coupon.min_order.toString(),
      max_uses: coupon.max_uses?.toString() || '',
      active: coupon.active,
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.code || !form.discount_value) {
      toast.error('Code and discount value are required');
      return;
    }

    setSaving(true);
    try {
      const data = {
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_order: parseFloat(form.min_order) || 0,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        active: form.active,
        expires_at: form.expires_at || null,
      };

      if (editId) {
        await api.updateCoupon(editId, data);
        toast.success('Coupon updated');
      } else {
        await api.createCoupon(data);
        toast.success('Coupon created');
      }

      closeModal();
      loadCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success('Coupon deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete coupon');
    }
    setDeleteId(null);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Coupons</h1>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium text-sm transition-colors"
          style={{ backgroundColor: '#FE8B7C' }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = '#F47768')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = '#FE8B7C')}
        >
          <FiPlus size={18} />
          Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Min Order</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Max Uses</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Used</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Expires</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No coupons yet
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{coupon.discount_type}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}%`
                        : formatPrice(coupon.discount_value)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatPrice(coupon.min_order)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {coupon.max_uses ?? 'Unlimited'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{coupon.used_count}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          coupon.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(coupon.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon form modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editId ? 'Edit Coupon' : 'New Coupon'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg">
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm font-mono uppercase"
                  placeholder="SUMMER20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, discount_type: e.target.value as any }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (MRU)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={form.discount_value}
                    onChange={(e) => setForm((prev) => ({ ...prev, discount_value: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (MRU)</label>
                  <input
                    type="number"
                    value={form.min_order}
                    onChange={(e) => setForm((prev) => ({ ...prev, min_order: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                  <input
                    type="number"
                    value={form.max_uses}
                    onChange={(e) => setForm((prev) => ({ ...prev, max_uses: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
                    min="0"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm((prev) => ({ ...prev, expires_at: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
                style={{ backgroundColor: '#FE8B7C' }}
              >
                <FiSave size={16} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Coupon</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete this coupon?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsList;
