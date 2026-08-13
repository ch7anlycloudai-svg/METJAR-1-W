import { Link, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiHome, FiShoppingBag } from 'react-icons/fi';
import { useLanguage } from '../i18n';

export default function OrderSuccessPage() {
  const { t } = useLanguage();
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || '';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md mx-auto">
        {/* Success Animation */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="absolute inset-0 bg-[#FFF1EE] rounded-full animate-ping opacity-40" />
          <div className="relative w-28 h-28 bg-gradient-to-br from-[#FE8B7C] to-[#F47768] rounded-full flex items-center justify-center shadow-xl shadow-[#FE8B7C]/30">
            <FiCheckCircle className="w-14 h-14 text-white" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[#0A0A0A] mb-4">
          {t.orderSuccess}
        </h1>

        {orderNumber && (
          <div className="bg-[#FFF1EE] rounded-2xl p-6 mb-6">
            <p className="text-sm text-[#555555] mb-2">{t.orderNumber}</p>
            <p className="text-2xl md:text-3xl font-bold text-[#FE8B7C] tracking-wider font-mono">
              {orderNumber}
            </p>
          </div>
        )}

        <p className="text-[#555555] mb-10 leading-relaxed">
          {t.orderMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-[#FE8B7C] hover:bg-[#F47768] text-white px-8 py-3.5 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#FE8B7C]/30"
          >
            <FiHome className="w-5 h-5" />
            {t.backToHome}
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 border-2 border-[#FE8B7C] text-[#FE8B7C] hover:bg-[#FFF1EE] px-8 py-3.5 rounded-full font-semibold transition-all duration-300"
          >
            <FiShoppingBag className="w-5 h-5" />
            {t.continueShopping}
          </Link>
        </div>
      </div>
    </div>
  );
}
