import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiChevronRight, FiChevronLeft, FiTruck, FiCheck } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useLanguage } from '../i18n';
import { useCart } from '../store/cartStore';
import { useWishlist } from '../store/wishlistStore';
import { api } from '../services/api';
import { getLocalizedName, getLocalizedText, formatPrice, calculateDiscount } from '../utils/helpers';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';

function ImageSkeleton() {
  return <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-[#FFF1EE] to-[#EDEDED] animate-pulse" />;
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-[#EDEDED] rounded w-1/3" />
      <div className="h-8 bg-[#EDEDED] rounded w-2/3" />
      <div className="h-6 bg-[#EDEDED] rounded w-1/4" />
      <div className="h-20 bg-[#EDEDED] rounded w-full" />
      <div className="flex gap-3 mt-6">
        <div className="h-12 bg-[#EDEDED] rounded-xl flex-1" />
        <div className="h-12 bg-[#EDEDED] rounded-xl flex-1" />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedColorName, setSelectedColorName] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setSelectedImage(0);
    setSelectedColor(null);
    setSelectedColorName(null);
    setSelectedSize(null);

    api.getProduct(id)
      .then((res) => {
        const p = res?.product || res;
        setProduct(p);
        if (p?.category_id) {
          api.getProducts({ category: p.category?.slug || p.category_id, limit: '4' })
            .then((r) => {
              const items = (r?.products || []).filter(
                (rp: Product) => rp.id !== p.id
              );
              setRelatedProducts(items.slice(0, 4));
            })
            .catch(() => {});
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <ImageSkeleton />
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">{t.noResults}</h2>
        <Link to="/products" className="text-[#FE8B7C] hover:text-[#F47768] font-medium transition-colors">
          {t.continueShopping}
        </Link>
      </div>
    );
  }

  const name = getLocalizedName(product, lang);
  const description = getLocalizedText(product, 'description', lang);
  const images = product.images || [];
  const mainImageUrl = images[selectedImage]?.url || '/placeholder.png';
  const discount = product.old_price ? calculateDiscount(product.price, product.old_price) : 0;
  const inWishlist = isInWishlist(product.id);
  const BreadcrumbArrow = lang === 'ar' ? FiChevronLeft : FiChevronRight;

  const handleAddToCart = () => {
    addItem(product, selectedColor, selectedColorName, selectedSize);
  };

  const handleBuyNow = () => {
    addItem(product, selectedColor, selectedColorName, selectedSize);
    navigate('/cart');
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#555555] mb-8 flex-wrap">
          <Link to="/" className="hover:text-[#FE8B7C] transition-colors">{t.home}</Link>
          <BreadcrumbArrow className="w-3 h-3" />
          <Link to="/products" className="hover:text-[#FE8B7C] transition-colors">{t.products}</Link>
          {product.category && (
            <>
              <BreadcrumbArrow className="w-3 h-3" />
              <Link
                to={`/products?category=${product.category.slug}`}
                className="hover:text-[#FE8B7C] transition-colors"
              >
                {getLocalizedName(product.category, lang)}
              </Link>
            </>
          )}
          <BreadcrumbArrow className="w-3 h-3" />
          <span className="text-[#0A0A0A] font-medium truncate max-w-[200px]">{name}</span>
        </nav>

        {/* Product Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#FFF1EE] mb-4">
              <img
                src={mainImageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-4 start-4 bg-[#FE8B7C] text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-[#FE8B7C] ring-2 ring-[#FE8B7C]/30' : 'border-[#EDEDED] hover:border-[#FE8B7C]/50'
                    }`}
                  >
                    <img src={img.url} alt={img.alt || name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.category && (
              <Link
                to={`/products?category=${product.category.slug}`}
                className="text-sm text-[#FE8B7C] hover:text-[#F47768] font-medium transition-colors"
              >
                {getLocalizedName(product.category, lang)}
              </Link>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-[#0A0A0A] mt-2 mb-4">{name}</h1>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl md:text-3xl font-bold text-[#FE8B7C]">
                {formatPrice(product.price)}
              </span>
              {product.old_price && product.old_price > product.price && (
                <>
                  <span className="text-lg text-[#555555] line-through">
                    {formatPrice(product.old_price)}
                  </span>
                  <span className="bg-[#FFF1EE] text-[#FE8B7C] text-sm font-bold px-2.5 py-1 rounded-full">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2 mb-6">
              {product.available ? (
                <>
                  <FiCheck className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">{t.available}</span>
                </>
              ) : (
                <span className="text-sm text-red-500 font-medium">{t.unavailable}</span>
              )}
            </div>

            {/* Description */}
            {description && (
              <div className="mb-6">
                <h3 className="font-semibold text-[#0A0A0A] mb-2">{t.description}</h3>
                <p className="text-[#555555] leading-relaxed text-sm whitespace-pre-line">{description}</p>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-[#0A0A0A] mb-3">
                  {t.selectColor}
                  {selectedColorName && (
                    <span className="text-sm font-normal text-[#555555] ms-2">
                      - {selectedColorName}
                    </span>
                  )}
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedColor(c.hex_code);
                        setSelectedColorName(getLocalizedName(c, lang));
                      }}
                      title={getLocalizedName(c, lang)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === c.hex_code
                          ? 'border-[#FE8B7C] ring-2 ring-[#FE8B7C]/30 scale-110'
                          : 'border-[#EDEDED] hover:border-[#FE8B7C]/50'
                      }`}
                      style={{ backgroundColor: c.hex_code }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-[#0A0A0A] mb-3">{t.selectSize}</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSize(s.size)}
                      className={`min-w-[48px] px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        selectedSize === s.size
                          ? 'bg-[#FE8B7C] text-white border-[#FE8B7C]'
                          : 'border-[#EDEDED] text-[#0A0A0A] hover:border-[#FE8B7C]'
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={!product.available}
                className="flex-1 flex items-center justify-center gap-2 bg-[#FE8B7C] hover:bg-[#F47768] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#FE8B7C]/30"
              >
                <FiShoppingBag className="w-5 h-5" />
                {t.addToCart}
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`w-14 flex items-center justify-center rounded-xl border-2 transition-all ${
                  inWishlist
                    ? 'border-[#FE8B7C] bg-[#FFF1EE]'
                    : 'border-[#EDEDED] hover:border-[#FE8B7C]'
                }`}
              >
                {inWishlist ? (
                  <FaHeart className="w-5 h-5 text-[#FE8B7C]" />
                ) : (
                  <FiHeart className="w-5 h-5 text-[#555555]" />
                )}
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={!product.available}
              className="w-full py-3.5 rounded-xl font-semibold border-2 border-[#FE8B7C] text-[#FE8B7C] hover:bg-[#FFF1EE] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mb-6"
            >
              {t.buyNow}
            </button>

            {/* Delivery Info */}
            <div className="flex items-start gap-3 p-4 bg-[#FFF1EE] rounded-xl">
              <FiTruck className="w-5 h-5 text-[#FE8B7C] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#555555]">{t.deliveryInfo}</p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-20">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0A0A0A] mb-8">{t.relatedProducts}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
