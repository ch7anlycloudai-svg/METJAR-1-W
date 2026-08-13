import { useState, useEffect } from 'react';
import { FiX, FiShoppingCart } from 'react-icons/fi';
import { useLanguage } from '../../i18n';
import { useCart } from '../../store/cartStore';
import { getLocalizedName, getLocalizedText, formatPrice, calculateDiscount } from '../../utils/helpers';
import type { Product } from '../../types';

interface QuickViewProps {
  product: Product;
  onClose: () => void;
}

export default function QuickView({ product, onClose }: QuickViewProps) {
  const { lang, t } = useLanguage();
  const addToCart = useCart((s) => s.addItem);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedColorName, setSelectedColorName] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);

  const images = product.images || [];
  const mainImage = images.length > 0 ? images[0].url : '/placeholder.png';
  const discount = product.old_price ? calculateDiscount(product.price, product.old_price) : 0;

  useEffect(() => {
    requestAnimationFrame(() => setAnimateIn(true));
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(onClose, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedColorName, selectedSize);
    handleClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition-all duration-300 ${
        animateIn ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden transition-all duration-300 ${
          animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 end-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-[#555555] hover:text-[#0A0A0A] hover:bg-white shadow-md transition-all"
        >
          <FiX size={18} />
        </button>

        <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
          {/* Image Section */}
          <div className="md:w-1/2 relative bg-[#FAFAFA]">
            <div className="aspect-square relative overflow-hidden">
              <img
                src={images[currentImage]?.url || mainImage}
                alt={getLocalizedName(product, lang)}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-3 start-3 bg-[#FE8B7C] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {discount}% {t.off}
                </span>
              )}
            </div>
            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      currentImage === i
                        ? 'border-[#FE8B7C] opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="md:w-1/2 p-5 md:p-6 flex flex-col">
            {/* Category */}
            {product.category && (
              <span className="text-[#FE8B7C] text-xs font-medium uppercase tracking-wide mb-2">
                {getLocalizedName(product.category, lang)}
              </span>
            )}

            {/* Name */}
            <h2 className="text-xl md:text-2xl font-bold text-[#0A0A0A] mb-3 leading-tight">
              {getLocalizedName(product, lang)}
            </h2>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-[#FE8B7C]">
                {formatPrice(product.price)}
              </span>
              {product.old_price && (
                <span className="text-base text-[#999] line-through">
                  {formatPrice(product.old_price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-[#555555] text-sm leading-relaxed mb-5">
              {getLocalizedText(product, 'description', lang)}
            </p>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-medium text-[#0A0A0A] mb-2.5">
                  {t.selectColor}
                  {selectedColorName && (
                    <span className="text-[#555555] font-normal ms-2">- {selectedColorName}</span>
                  )}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => {
                        setSelectedColor(color.hex_code);
                        setSelectedColorName(getLocalizedName(color, lang));
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedColor === color.hex_code
                          ? 'border-[#FE8B7C] ring-2 ring-[#FE8B7C]/30 scale-110'
                          : 'border-[#EDEDED]'
                      }`}
                      style={{ backgroundColor: color.hex_code }}
                      title={getLocalizedName(color, lang)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-[#0A0A0A] mb-2.5">{t.selectSize}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.size)}
                      className={`min-w-[40px] h-10 px-3 rounded-lg border text-sm font-medium transition-all ${
                        selectedSize === size.size
                          ? 'bg-[#FE8B7C] text-white border-[#FE8B7C]'
                          : 'bg-white text-[#0A0A0A] border-[#EDEDED] hover:border-[#FE8B7C] hover:text-[#FE8B7C]'
                      }`}
                    >
                      {size.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="mt-auto pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.available}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  product.available
                    ? 'bg-[#FE8B7C] text-white hover:bg-[#F47768] active:scale-[0.98] shadow-lg shadow-[#FE8B7C]/25'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FiShoppingCart size={18} />
                {product.available ? t.addToCart : t.unavailable}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
