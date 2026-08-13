import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiTruck, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useLanguage } from '../i18n';
import { useCart } from '../store/cartStore';
import { api } from '../services/api';
import { getLocalizedName, formatPrice } from '../utils/helpers';
import type { Coupon } from '../types';

interface FormErrors {
  full_name?: string;
  phone?: string;
  province?: string;
  address?: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, t } = useLanguage();
  const { items, getTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    province: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const coupon: Coupon | null = location.state?.coupon || null;
  const subtotal = getTotal();

  const discount = coupon
    ? coupon.discount_type === 'percentage'
      ? Math.round((subtotal * coupon.discount_value) / 100)
      : coupon.discount_value
    : 0;

  const total = Math.max(0, subtotal - discount);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = t.required;
    if (!formData.phone.trim()) {
      newErrors.phone = t.required;
    } else if (!/^[+]?[\d\s-]{8,}$/.test(formData.phone.trim())) {
      newErrors.phone = t.invalidPhone;
    }
    if (!formData.province) newErrors.province = t.required;
    if (!formData.address.trim()) newErrors.address = t.required;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const orderData = {
        customer_name: formData.full_name.trim(),
        customer_phone: formData.phone.trim(),
        province: formData.province,
        address: formData.address.trim(),
        notes: formData.notes.trim() || undefined,
        items: items.map((item) => ({
          product_id: item.product.id,
          product_name: getLocalizedName(item.product, lang),
          product_image: item.product.images?.[0]?.url || null,
          color: item.color,
          size: item.size,
          price: item.product.price,
          quantity: item.quantity,
        })),
        subtotal,
        discount,
        total,
        coupon_id: coupon?.id || null,
        payment_method: 'cash_on_delivery',
      };

      const res = await api.createOrder(orderData);
      const orderNumber = res?.data?.order_number || res?.order?.order_number || res?.order_number || '';
      clearCart();
      navigate('/order-success', { state: { orderNumber } });
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const provinceEntries = Object.entries(t.provinces) as [string, string][];

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-[#0A0A0A] mb-8">{t.checkoutTitle}</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-[#EDEDED] rounded-2xl p-6">
                <h2 className="font-bold text-lg text-[#0A0A0A] mb-6">{t.customerInfo}</h2>

                <div className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
                      {t.fullName} <span className="text-[#FE8B7C]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
                        errors.full_name ? 'border-red-400 bg-red-50/50' : 'border-[#EDEDED] focus:border-[#FE8B7C]'
                      }`}
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
                      {t.phone} <span className="text-[#FE8B7C]">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      dir="ltr"
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
                        errors.phone ? 'border-red-400 bg-red-50/50' : 'border-[#EDEDED] focus:border-[#FE8B7C]'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Province */}
                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
                      {t.province} <span className="text-[#FE8B7C]">*</span>
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => handleChange('province', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors appearance-none bg-white ${
                        errors.province ? 'border-red-400 bg-red-50/50' : 'border-[#EDEDED] focus:border-[#FE8B7C]'
                      }`}
                    >
                      <option value="">{t.province}</option>
                      {provinceEntries.map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {errors.province && (
                      <p className="text-red-500 text-xs mt-1">{errors.province}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
                      {t.address} <span className="text-[#FE8B7C]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
                        errors.address ? 'border-red-400 bg-red-50/50' : 'border-[#EDEDED] focus:border-[#FE8B7C]'
                      }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
                      {t.notes}
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder={t.notesPlaceholder}
                      rows={3}
                      className="w-full px-4 py-3 border border-[#EDEDED] rounded-xl text-sm focus:outline-none focus:border-[#FE8B7C] transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-[#EDEDED] rounded-2xl p-6">
                <h2 className="font-bold text-lg text-[#0A0A0A] mb-4">{t.paymentMethod}</h2>
                <div className="flex items-center gap-3 p-4 border-2 border-[#FE8B7C] bg-[#FFF1EE] rounded-xl">
                  <FiCreditCard className="w-5 h-5 text-[#FE8B7C]" />
                  <span className="font-medium text-[#0A0A0A]">{t.cashOnDelivery}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="flex items-start gap-3 p-4 bg-[#FFF1EE] rounded-xl">
                <FiTruck className="w-5 h-5 text-[#FE8B7C] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#555555]">{t.deliveryInfo}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white border border-[#EDEDED] rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-lg text-[#0A0A0A]">{t.orderSummary}</h3>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {items.map((item) => {
                    const itemName = getLocalizedName(item.product, lang);
                    const image = item.product.images?.[0]?.url || '/placeholder.png';
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#FFF1EE] flex-shrink-0">
                          <img src={image} alt={itemName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#0A0A0A] truncate">{itemName}</p>
                          <div className="flex gap-2 text-xs text-[#555555] mt-0.5">
                            {item.colorName && <span>{item.colorName}</span>}
                            {item.size && <span>{item.size}</span>}
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-[#555555]">x{item.quantity}</span>
                            <span className="text-sm font-semibold text-[#0A0A0A]">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 border-t border-[#EDEDED] pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#555555]">{t.subtotal}</span>
                    <span className="text-[#0A0A0A] font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">{t.discount}</span>
                      <span className="text-green-600 font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold border-t border-[#EDEDED] pt-3">
                    <span className="text-[#0A0A0A]">{t.total}</span>
                    <span className="text-[#FE8B7C]">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#FE8B7C] hover:bg-[#F47768] disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#FE8B7C]/30"
                >
                  {submitting ? t.loading : t.placeOrder}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
