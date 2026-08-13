import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiSearch, FiChevronDown } from 'react-icons/fi';
import { useLanguage } from '../i18n';
import { api } from '../services/api';
import { getLocalizedName } from '../utils/helpers';
import type { Product, Category } from '../types';
import ProductCard from '../components/product/ProductCard';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const COLOR_OPTIONS = [
  { name_ar: 'أسود', name_fr: 'Noir', hex: '#000000' },
  { name_ar: 'أبيض', name_fr: 'Blanc', hex: '#FFFFFF' },
  { name_ar: 'أحمر', name_fr: 'Rouge', hex: '#EF4444' },
  { name_ar: 'أزرق', name_fr: 'Bleu', hex: '#3B82F6' },
  { name_ar: 'أخضر', name_fr: 'Vert', hex: '#22C55E' },
  { name_ar: 'وردي', name_fr: 'Rose', hex: '#EC4899' },
  { name_ar: 'بيج', name_fr: 'Beige', hex: '#D2B48C' },
  { name_ar: 'بني', name_fr: 'Marron', hex: '#92400E' },
  { name_ar: 'رمادي', name_fr: 'Gris', hex: '#6B7280' },
  { name_ar: 'ذهبي', name_fr: 'Doré', hex: '#F59E0B' },
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#EDEDED] animate-pulse">
      <div className="aspect-[3/4] bg-gradient-to-br from-[#FFF1EE] to-[#EDEDED]" />
      <div className="p-3.5 space-y-2">
        <div className="h-3 bg-[#EDEDED] rounded w-1/3" />
        <div className="h-4 bg-[#EDEDED] rounded w-2/3" />
        <div className="h-4 bg-[#EDEDED] rounded w-1/4" />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  useEffect(() => {
    api.getCategories()
      .then((res) => setCategories(res?.data || res || []))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (sortBy) params.sort = sortBy;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (selectedSizes.length) params.sizes = selectedSizes.join(',');
      if (selectedColors.length) params.colors = selectedColors.join(',');

      const res = await api.getProducts(params);
      setProducts(res?.data || res?.products || res || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, sortBy, minPrice, maxPrice, selectedSizes, selectedColors]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory) params.category = selectedCategory;
    if (sortBy && sortBy !== 'newest') params.sort = sortBy;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedCategory, sortBy, minPrice, maxPrice, setSearchParams]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (hex: string) => {
    setSelectedColors((prev) =>
      prev.includes(hex) ? prev.filter((c) => c !== hex) : [...prev, hex]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('newest');
    setMinPrice('');
    setMaxPrice('');
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  const hasActiveFilters = searchTerm || selectedCategory || minPrice || maxPrice || selectedSizes.length > 0 || selectedColors.length > 0;

  const FilterPanel = ({ onClose }: { onClose?: () => void }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-[#0A0A0A]">{t.filters}</h3>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-[#FFF1EE] rounded-full transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-semibold text-[#0A0A0A] mb-3">{t.categories}</h4>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`block w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${
              !selectedCategory ? 'bg-[#FE8B7C] text-white' : 'text-[#555555] hover:bg-[#FFF1EE]'
            }`}
          >
            {t.allCategories}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`block w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat.slug ? 'bg-[#FE8B7C] text-white' : 'text-[#555555] hover:bg-[#FFF1EE]'
              }`}
            >
              {getLocalizedName(cat, lang)}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-[#0A0A0A] mb-3">{t.priceRange}</h4>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border border-[#EDEDED] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FE8B7C] transition-colors"
          />
          <span className="text-[#555555]">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border border-[#EDEDED] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FE8B7C] transition-colors"
          />
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="font-semibold text-[#0A0A0A] mb-3">{t.sizes}</h4>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                selectedSizes.includes(size)
                  ? 'bg-[#FE8B7C] text-white border-[#FE8B7C]'
                  : 'border-[#EDEDED] text-[#555555] hover:border-[#FE8B7C]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h4 className="font-semibold text-[#0A0A0A] mb-3">{t.colors}</h4>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color.hex}
              onClick={() => toggleColor(color.hex)}
              title={lang === 'ar' ? color.name_ar : color.name_fr}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColors.includes(color.hex)
                  ? 'border-[#FE8B7C] ring-2 ring-[#FE8B7C]/30 scale-110'
                  : 'border-[#EDEDED] hover:border-[#FE8B7C]/50'
              }`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            clearFilters();
            onClose?.();
          }}
          className="w-full py-2.5 border border-[#FE8B7C] text-[#FE8B7C] rounded-xl text-sm font-medium hover:bg-[#FFF1EE] transition-colors"
        >
          {t.clearFilters}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0A0A0A] mb-6">{t.products}</h1>

          {/* Search and Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]" />
              <input
                type="text"
                placeholder={t.searchProducts}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full ps-12 pe-4 py-3 border border-[#EDEDED] rounded-xl text-sm focus:outline-none focus:border-[#FE8B7C] transition-colors bg-white"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-[#EDEDED] rounded-xl px-4 py-3 pe-10 text-sm focus:outline-none focus:border-[#FE8B7C] transition-colors cursor-pointer"
                >
                  <option value="newest">{t.newest}</option>
                  <option value="price_asc">{t.priceLowToHigh}</option>
                  <option value="price_desc">{t.priceHighToLow}</option>
                  <option value="featured">{t.featuredFirst}</option>
                </select>
                <FiChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555] pointer-events-none" />
              </div>
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden flex items-center gap-2 px-4 py-3 border border-[#EDEDED] rounded-xl text-sm hover:border-[#FE8B7C] transition-colors"
              >
                <FiFilter className="w-4 h-4" />
                {t.filters}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white border border-[#EDEDED] rounded-2xl p-5">
              <FilterPanel />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#FFF1EE] flex items-center justify-center">
                  <FiSearch className="w-8 h-8 text-[#FE8B7C]" />
                </div>
                <h3 className="text-xl font-semibold text-[#0A0A0A] mb-2">{t.noResults}</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-[#FE8B7C] hover:text-[#F47768] font-medium transition-colors"
                  >
                    {t.clearFilters}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 start-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl overflow-y-auto p-6 animate-slide-in">
            <FilterPanel onClose={() => setMobileFiltersOpen(false)} />
          </div>
        </>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        [dir="rtl"] @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
