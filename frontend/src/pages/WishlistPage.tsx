import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingBag, FiX } from 'react-icons/fi';
import { useLanguage } from '../i18n';
import { useCart } from '../store/cartStore';
import { useWishlist } from '../store/wishlistStore';
import { getLocalizedName, formatPrice } from '../utils/helpers';
import type { Product } from '../types';

function SizeColorModal({
  product,
  onClose,
  onConfirm,
}: {
  product: Product;
  onClose: () => void;
  onConfirm: (color: string | null, colorName: string | null, size: string | null) => void;
}) {
  const { lang, t } = useLanguage();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedColorName, setSelectedColorName] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const hasColors = product.colors && product.colors.length > 0;
  const hasSizes = product.sizes && product.sizes.length > 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 end-4 p-1 hover:bg-[#FFF1EE] rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-[#555555]" />
          </button>

          <h3 className="font-bold text-lg text-[#0A0A0A] mb-5">{getLocalizedName(product, lang)}</h3>

          {hasColors && (
            <div className="mb-5">
              <h4 className="font-semibold text-sm text-[#0A0A0A] mb-3">{t.selectColor}</h4>
              <div className="flex gap-3 flex-wrap">
                {product.colors!.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedColor(c.hex_code);
                      setSelectedColorName(getLocalizedName(c, lang));
                    }}
                    title={getLocalizedName(c, lang)}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${
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

          {hasSizes && (
            <div className="mb-6">
              <h4 className="font-semibold text-sm text-[#0A0A0A] mb-3">{t.selectSize}</h4>
              <div className="flex gap-2 flex-wrap">
                {product.sizes!.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(s.size)}
                    className={`min-w-[44px] px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
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

          <button
            onClick={() => onConfirm(selectedColor, selectedColorName, selectedSize)}
            className="w-full bg-[#FE8B7C] hover:bg-[#F47768] text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          >
            <FiShoppingBag className="w-4 h-4" />
            {t.addToCart}
          </button>
        </div>
      </div>
    </>
  );
}

export default function WishlistPage() {
  const { lang, t } = useLanguage();
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const [moveToCartProduct, setMoveToCartProduct] = useState<Product | null>(null);

  const handleMoveToCart = (product: Product) => {
    const hasOptions =
      (product.colors && product.colors.length > 0) ||
      (product.sizes && product.sizes.length > 0);

    if (hasOptions) {
      setMoveToCartProduct(product);
    } else {
      addItem(product, null, null, null);
      removeItem(product.id);
    }
  };

  const handleConfirmMoveToCart = (
    color: string | null,
    colorName: string | null,
    size: string | null
  ) => {
    if (moveToCartProduct) {
      addItem(moveToCartProduct, color, colorName, size);
      removeItem(moveToCartProduct.id);
      setMoveToCartProduct(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#FFF1EE] flex items-center justify-center">
            <FiHeart className="w-10 h-10 text-[#FE8B7C]" />
          </div>
          <h2 className="text-2xl font-bold text-[#0A0A0A] mb-3">{t.emptyWishlist}</h2>
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
        <h1 className="text-3xl md:text-4xl font-bold text-[#0A0A0A] mb-8">{t.myWishlist}</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map(({ product }) => {
            const name = getLocalizedName(product, lang);
            const image = product.images?.[0]?.url || '/placeholder.png';

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#EDEDED] hover:shadow-lg transition-all duration-300 group"
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#FFF1EE]">
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                </Link>

                <div className="p-3.5">
                  {product.category && (
                    <p className="text-xs text-[#555555] mb-1 truncate">
                      {getLocalizedName(product.category, lang)}
                    </p>
                  )}
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-sm font-semibold text-[#0A0A0A] truncate mb-2 hover:text-[#FE8B7C] transition-colors">
                      {name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#FE8B7C] font-bold text-sm">{formatPrice(product.price)}</span>
                    {product.old_price && product.old_price > product.price && (
                      <span className="text-[#555555] text-xs line-through">{formatPrice(product.old_price)}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#FE8B7C] hover:bg-[#F47768] text-white py-2 rounded-xl text-xs font-medium transition-colors"
                    >
                      <FiShoppingBag className="w-3.5 h-3.5" />
                      {t.moveToCart}
                    </button>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="w-9 flex items-center justify-center text-[#555555] hover:text-red-500 hover:bg-red-50 border border-[#EDEDED] rounded-xl transition-colors"
                      title={t.remove}
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {moveToCartProduct && (
        <SizeColorModal
          product={moveToCartProduct}
          onClose={() => setMoveToCartProduct(null)}
          onConfirm={handleConfirmMoveToCart}
        />
      )}
    </div>
  );
}
