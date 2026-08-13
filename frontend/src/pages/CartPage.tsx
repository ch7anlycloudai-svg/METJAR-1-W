import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiTrash2, FiPlus, FiMinus, FiTag } from 'react-icons/fi';
import { useLanguage } from '../i18n';
import { useCart } from '../store/cartStore';
import { api } from '../services/api';
import { getLocalizedName, formatPrice } from '../utils/helpers';
import type { Coupon } from '../types';

export default function CartPage() {
  const { lang, t } = useLanguage();
  const { items, removeItem, updateQuantity, getTotal } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getTotal();

  const calculateDiscount = (): number => {
    if (!coupon) return 0;
    if (coupon.discount_type === 'percentage') {
      return Math.round((subtotal * coupon.discount_value) / 100);
    }
    return coupon.discount_value;
  };

  const discount = calculateDiscount();
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.validateCoupon(couponCode.trim(), subtotal);
      setCoupon(res?.data || res?.coupon || res);
    } catch {
      setCouponError(t.invalidCoupon);
      setCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#FFF1EE] flex items-center justify-center">
            <FiShoppingBag className="w-10 h-10 text-[#FE8B7C]" />
          </div>
          <h2 className="text-2xl font-bold text-[#0A0A0A] mb-3">{t.emptyCart}</h2>
          <p className="text-[#555555] mb-8">{t.heroSubtitle}</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-[#FE8B7C] hover:bg-[#F47768] text-white px-8 py-3.5 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#FE8B7C]/30"
          >
            <FiShoppingBag className="w-5 h-5" />
            {t.continueShopping}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-[#0A0A0A] mb-8">{t.myCart}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const name = getLocalizedName(item.product, lang);
              const image = item.product.images?.[0]?.url || '/placeholder.png';
              const itemTotal = item.product.price * item.quantity;

              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-white border border-[#EDEDED] rounded-2xl hover:shadow-sm transition-shadow"
                >
                  {/* Image */}
                  <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-[#FFF1EE]">
                      <img src={image} alt={name} className="w-full h-full object-cover" />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product.id}`}
                      className="font-semibold text-[#0A0A0A] hover:text-[#FE8B7C] transition-colors line-clamp-2 text-sm md:text-base"
                    >
                      {name}
                    </Link>

                    <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-[#555555]">
                      {item.colorName && (
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-[#EDEDED]"
                            style={{ backgroundColor: item.color || '#ccc' }}
                          />
                          {item.colorName}
                        </span>
                      )}
                      {item.size && (
                        <span className="bg-[#FFF1EE] px-2 py-0.5 rounded">
                          {t.size}: {item.size}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#EDEDED] rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-9 h-9 flex items-center justify-center text-[#555555] hover:bg-[#FFF1EE] disabled:opacity-40 transition-colors"
                        >
                          <FiMinus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium text-[#0A0A0A]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center text-[#555555] hover:bg-[#FFF1EE] transition-colors"
                        >
                          <FiPlus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-bold text-[#FE8B7C] text-sm md:text-base">
                        {formatPrice(itemTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 self-start p-2 text-[#555555] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title={t.remove}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-[#EDEDED] rounded-2xl p-6 space-y-5">
              <h3 className="font-bold text-lg text-[#0A0A0A]">{t.orderSummary}</h3>

              {/* Coupon */}
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FiTag className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
                    <input
                      type="text"
                      placeholder={t.couponCode}
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError('');
                      }}
                      className="w-full ps-10 pe-3 py-2.5 border border-[#EDEDED] rounded-xl text-sm focus:outline-none focus:border-[#FE8B7C] transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-medium hover:bg-[#333] disabled:opacity-50 transition-colors"
                  >
                    {couponLoading ? '...' : t.applyCoupon}
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-xs mt-1.5">{couponError}</p>}
                {coupon && (
                  <p className="text-green-600 text-xs mt-1.5 font-medium">{t.couponApplied}</p>
                )}
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

              <p className="text-xs text-[#555555] leading-relaxed">{t.deliveryInfo}</p>

              <Link
                to="/checkout"
                state={{ coupon }}
                className="block w-full text-center bg-[#FE8B7C] hover:bg-[#F47768] text-white py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#FE8B7C]/30"
              >
                {t.checkout}
              </Link>

              <Link
                to="/products"
                className="block w-full text-center text-[#FE8B7C] hover:text-[#F47768] text-sm font-medium transition-colors"
              >
                {t.continueShopping}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
