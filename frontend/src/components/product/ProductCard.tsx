import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiEye, FiShoppingCart } from 'react-icons/fi';
import { useLanguage } from '../../i18n';
import { useCart } from '../../store/cartStore';
import { useWishlist } from '../../store/wishlistStore';
import { getLocalizedName, formatPrice, calculateDiscount } from '../../utils/helpers';
import type { Product } from '../../types';
import QuickView from '../ui/QuickView';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { lang, t } = useLanguage();
  const addToCart = useCart((s) => s.addItem);
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();

  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const images = product.images || [];
  const mainImage = images.length > 0 ? images[0].url : '/placeholder.png';
  const secondImage = images.length > 1 ? images[1].url : null;
  const discount = product.old_price ? calculateDiscount(product.price, product.old_price) : 0;
  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, null, null, null);
  };

  return (
    <>
      <div
        className="group relative bg-white rounded-2xl overflow-hidden border border-[#EDEDED] hover:border-[#FE8B7C]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#FE8B7C]/5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
          <div className="aspect-[3/4] relative bg-[#FAFAFA]">
            {/* Loading Skeleton */}
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#FFF1EE] to-[#EDEDED]" />
            )}

            {/* Main Image */}
            <img
              src={mainImage}
              alt={getLocalizedName(product, lang)}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                secondImage && isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
              } ${imgLoaded ? '' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
              loading="lazy"
            />

            {/* Second Image (hover) */}
            {secondImage && (
              <img
                src={secondImage}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
                loading="lazy"
              />
            )}

            {/* Unavailable Overlay */}
            {!product.available && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-[5]">
                <span className="bg-[#0A0A0A] text-white text-xs font-semibold px-4 py-2 rounded-full">
                  {t.unavailable}
                </span>
              </div>
            )}
          </div>

          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute top-3 start-3 bg-[#FE8B7C] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
              {discount}% {t.off}
            </span>
          )}

          {/* New Arrival Badge */}
          {product.new_arrival && !discount && (
            <span className="absolute top-3 start-3 bg-[#0A0A0A] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
              {t.newArrivals}
            </span>
          )}

          {/* Wishlist Button - Always visible */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-3 end-3 z-10 w-9 h-9 flex items-center justify-center rounded-full shadow-md transition-all duration-300 ${
              inWishlist
                ? 'bg-[#FE8B7C] text-white scale-110'
                : 'bg-white/90 text-[#555555] hover:bg-[#FE8B7C] hover:text-white'
            }`}
            aria-label={t.wishlist}
          >
            <FiHeart size={16} className={inWishlist ? 'fill-current' : ''} />
          </button>

          {/* Hover Actions */}
          <div
            className={`absolute inset-x-0 bottom-0 p-3 flex items-center justify-center gap-2 bg-gradient-to-t from-black/20 to-transparent pt-10 transition-all duration-300 ${
              isHovered
                ? 'translate-y-0 opacity-100'
                : 'translate-y-full opacity-0'
            }`}
          >
            {/* Quick View Button */}
            <button
              onClick={handleQuickView}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg text-[#0A0A0A] hover:bg-[#FE8B7C] hover:text-white transition-all duration-200 hover:scale-105"
              aria-label={t.quickView}
              title={t.quickView}
            >
              <FiEye size={17} />
            </button>

            {/* Add to Cart Button */}
            {product.available && (
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 px-5 h-10 rounded-full bg-[#FE8B7C] text-white text-sm font-medium shadow-lg hover:bg-[#F47768] transition-all duration-200 hover:scale-105"
              >
                <FiShoppingCart size={15} />
                {t.addToCart}
              </button>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-3.5 md:p-4">
          {/* Category */}
          {product.category && (
            <p className="text-[10px] uppercase tracking-wider text-[#FE8B7C] font-medium mb-1">
              {getLocalizedName(product.category, lang)}
            </p>
          )}

          {/* Name */}
          <Link to={`/product/${product.id}`}>
            <h3 className="text-sm font-semibold text-[#0A0A0A] leading-snug mb-2 line-clamp-2 hover:text-[#FE8B7C] transition-colors">
              {getLocalizedName(product, lang)}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-[#FE8B7C]">
              {formatPrice(product.price)}
            </span>
            {product.old_price && product.old_price > product.price && (
              <span className="text-xs text-[#999] line-through">
                {formatPrice(product.old_price)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <QuickView product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
}
