import { FiPhone, FiMapPin, FiTruck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../i18n';

const WHATSAPP_NUMBER = '22247305955';
const PHONE_DISPLAY = '+222 47 30 59 55';

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0A0A0A] mb-4">{t.contactTitle}</h1>
          <p className="text-lg text-[#555555] leading-relaxed">{t.contactSubtitle}</p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
          {/* WhatsApp Card */}
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300 hover:border-green-200">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-50 flex items-center justify-center">
              <FaWhatsapp className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-bold text-lg text-[#0A0A0A] mb-2">{t.whatsapp}</h3>
            <p className="text-[#555555] mb-5 font-mono" dir="ltr">{PHONE_DISPLAY}</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
            >
              <FaWhatsapp className="w-5 h-5" />
              {t.chatOnWhatsapp}
            </a>
          </div>

          {/* Phone Card */}
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300 hover:border-[#FE8B7C]/30">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#FFF1EE] flex items-center justify-center">
              <FiPhone className="w-8 h-8 text-[#FE8B7C]" />
            </div>
            <h3 className="font-bold text-lg text-[#0A0A0A] mb-2">{t.phoneNumber}</h3>
            <p className="text-[#555555] mb-5 font-mono" dir="ltr">{PHONE_DISPLAY}</p>
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              className="inline-flex items-center gap-2 bg-[#FE8B7C] hover:bg-[#F47768] text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#FE8B7C]/30"
            >
              <FiPhone className="w-5 h-5" />
              {t.phoneNumber}
            </a>
          </div>
        </div>

        {/* Store Info */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#FFF1EE] rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Store Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="w-5 h-5 text-[#FE8B7C]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0A0A0A] mb-2">{t.storeName}</h3>
                  <p className="text-sm text-[#555555] leading-relaxed">
                    {t.contactSubtitle}
                  </p>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <FiTruck className="w-5 h-5 text-[#FE8B7C]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0A0A0A] mb-2">{t.deliveryInfo}</h3>
                  <p className="text-sm text-[#555555] leading-relaxed">
                    {t.deliveryInfo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
