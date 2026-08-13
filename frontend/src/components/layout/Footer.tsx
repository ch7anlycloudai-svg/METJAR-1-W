import { Link } from 'react-router-dom';
import { FiPhone, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import { useLanguage } from '../../i18n';

export default function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-[#0A0A0A] text-white">
      {/* Delivery Banner */}
      <div className="bg-[#FE8B7C]">
        <div className="max-w-7xl mx-auto px-4 py-3 text-center">
          <p className="text-white text-sm font-medium flex items-center justify-center gap-2">
            <FiMapPin size={16} />
            {t.deliveryInfo}
          </p>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img
                src="/logo.png"
                alt="WWenatou"
                className="h-10 w-auto object-contain brightness-0 invert"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent && !parent.querySelector('span')) {
                    const span = document.createElement('span');
                    span.className = 'text-2xl font-bold text-[#FE8B7C]';
                    span.textContent = 'WWenatou';
                    parent.appendChild(span);
                  }
                }}
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {lang === 'ar'
                ? 'متجرك المفضل للأزياء النسائية العصرية في موريتانيا. نقدم لك أحدث صيحات الموضة بأسعار مناسبة مع خدمة توصيل لجميع الولايات.'
                : 'Votre boutique en ligne pr\u00e9f\u00e9r\u00e9e pour la mode f\u00e9minine en Mauritanie. Nous vous offrons les derni\u00e8res tendances \u00e0 des prix abordables avec livraison dans toutes les wilayas.'}
            </p>
            {/* Social Media */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:bg-[#FE8B7C] hover:text-white transition-all duration-300"
                aria-label="Facebook"
              >
                <FaFacebook size={16} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:bg-[#FE8B7C] hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <FaInstagram size={16} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:bg-[#FE8B7C] hover:text-white transition-all duration-300"
                aria-label="TikTok"
              >
                <FaTiktok size={14} />
              </a>
              <a
                href="https://wa.me/22247305955"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:bg-[#25D366] hover:text-white transition-all duration-300"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-5 relative">
              {t.quickLinks}
              <span className="absolute bottom-0 start-0 -mb-2 w-8 h-0.5 bg-[#FE8B7C] rounded-full" />
            </h3>
            <ul className="space-y-3 mt-4">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-[#FE8B7C] transition-colors text-sm inline-block"
                >
                  {t.home}
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-400 hover:text-[#FE8B7C] transition-colors text-sm inline-block"
                >
                  {t.products}
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-400 hover:text-[#FE8B7C] transition-colors text-sm inline-block"
                >
                  {t.categories}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-[#FE8B7C] transition-colors text-sm inline-block"
                >
                  {t.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-base mb-5 relative">
              {t.customerService}
              <span className="absolute bottom-0 start-0 -mb-2 w-8 h-0.5 bg-[#FE8B7C] rounded-full" />
            </h3>
            <ul className="space-y-3 mt-4">
              <li>
                <span className="text-gray-400 text-sm inline-block">
                  {t.aboutUs}
                </span>
              </li>
              <li>
                <span className="text-gray-400 text-sm inline-block">
                  {t.privacyPolicy}
                </span>
              </li>
              <li>
                <span className="text-gray-400 text-sm inline-block">
                  {t.termsConditions}
                </span>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="text-gray-400 hover:text-[#FE8B7C] transition-colors text-sm inline-block"
                >
                  {t.wishlist}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-base mb-5 relative">
              {t.contact}
              <span className="absolute bottom-0 start-0 -mb-2 w-8 h-0.5 bg-[#FE8B7C] rounded-full" />
            </h3>
            <ul className="space-y-4 mt-4">
              <li>
                <a
                  href="https://wa.me/22247305955"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-400 hover:text-[#25D366] transition-colors group"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-[#25D366]/10 transition-colors shrink-0">
                    <FaWhatsapp size={16} />
                  </span>
                  <span className="text-sm">+222 47 30 59 55</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+22247305955"
                  className="flex items-center gap-3 text-gray-400 hover:text-[#FE8B7C] transition-colors group"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-[#FE8B7C]/10 transition-colors shrink-0">
                    <FiPhone size={15} />
                  </span>
                  <span className="text-sm">+222 47 30 59 55</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3 text-gray-400">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 shrink-0">
                    <FiMapPin size={15} />
                  </span>
                  <span className="text-sm">
                    {lang === 'ar' ? 'نواكشوط، موريتانيا' : 'Nouakchott, Mauritanie'}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <p className="text-center text-gray-500 text-sm">
            &copy; 2026 WWenatou Shopping. {t.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
