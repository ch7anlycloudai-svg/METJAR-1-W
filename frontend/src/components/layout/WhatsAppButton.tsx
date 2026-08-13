import { FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../../i18n';

export default function WhatsAppButton() {
  const { lang, t } = useLanguage();
  const isRTL = lang === 'ar';

  return (
    <a
      href="https://wa.me/22247305955"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 z-50 group ${isRTL ? 'start-6' : 'end-6'}`}
      aria-label={t.chatOnWhatsapp}
    >
      {/* Tooltip */}
      <span
        className={`absolute bottom-full mb-2 px-3 py-1.5 bg-[#0A0A0A] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
          isRTL ? 'start-0' : 'end-0'
        }`}
      >
        {t.chatOnWhatsapp}
        <span
          className={`absolute top-full border-4 border-transparent border-t-[#0A0A0A] ${
            isRTL ? 'start-4' : 'end-4'
          }`}
        />
      </span>

      {/* Button */}
      <div className="relative">
        {/* Pulse Ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />

        {/* Icon Button */}
        <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 hover:bg-[#20BD5A] hover:scale-110 transition-all duration-300 cursor-pointer">
          <FaWhatsapp size={28} />
        </div>
      </div>
    </a>
  );
}
