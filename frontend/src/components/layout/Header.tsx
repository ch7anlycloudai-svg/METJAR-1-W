import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiHeart, FiShoppingCart, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { useLanguage } from '../../i18n';
import { useCart } from '../../store/cartStore';
import { useWishlist } from '../../store/wishlistStore';
import { api } from '../../services/api';
import { getLocalizedName } from '../../utils/helpers';
import type { Category } from '../../types';

export default function Header() {
  const { lang, t, setLanguage } = useLanguage();
  const cartCount = useCart((s) => s.getCount());
  const wishlistCount = useWishlist((s) => s.getCount());
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const isRTL = lang === 'ar';

  useEffect(() => {
    api.getCategories()
      .then((res) => setCategories(res?.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#0A0A0A] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <p className="text-gray-400 text-[11px] hidden sm:block">{t.deliveryInfo}</p>
          <div className="flex items-center gap-3 ms-auto">
            <button
              onClick={() => setLanguage('ar')}
              className={`transition-colors ${lang === 'ar' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
            >
              العربية
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => setLanguage('fr')}
              className={`transition-colors ${lang === 'fr' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
            >
              Fran&ccedil;ais
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ms-2 text-[#0A0A0A] hover:text-[#FE8B7C] transition-colors"
              aria-label="Open menu"
            >
              <FiMenu size={24} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img
                src="/logo.png"
                alt="WWenatou"
                className="h-10 md:h-12 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent && !parent.querySelector('span')) {
                    const span = document.createElement('span');
                    span.className = 'text-xl md:text-2xl font-bold text-[#FE8B7C]';
                    span.textContent = 'WWenatou';
                    parent.appendChild(span);
                  }
                }}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                to="/"
                className="text-[#0A0A0A] hover:text-[#FE8B7C] transition-colors font-medium text-sm"
              >
                {t.home}
              </Link>
              <Link
                to="/products"
                className="text-[#0A0A0A] hover:text-[#FE8B7C] transition-colors font-medium text-sm"
              >
                {t.products}
              </Link>

              {/* Categories Dropdown */}
              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="flex items-center gap-1 text-[#0A0A0A] hover:text-[#FE8B7C] transition-colors font-medium text-sm"
                >
                  {t.categories}
                  <FiChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {categoriesOpen && (
                  <div className="absolute top-full mt-2 start-0 bg-white rounded-lg shadow-xl border border-[#EDEDED] py-2 min-w-[200px] z-50 animate-[fadeIn_0.15s_ease-out]">
                    <Link
                      to="/products"
                      onClick={() => setCategoriesOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[#0A0A0A] hover:bg-[#FFF1EE] hover:text-[#FE8B7C] transition-colors"
                    >
                      {t.allCategories}
                    </Link>
                    <div className="border-t border-[#EDEDED] my-1" />
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.slug}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#555555] hover:bg-[#FFF1EE] hover:text-[#FE8B7C] transition-colors"
                      >
                        {getLocalizedName(cat, lang)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/contact"
                className="text-[#0A0A0A] hover:text-[#FE8B7C] transition-colors font-medium text-sm"
              >
                {t.contact}
              </Link>
            </nav>

            {/* Desktop Search + Icons */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Search - Desktop */}
              <div className="hidden md:block relative">
                {searchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchProducts}
                      className="w-56 lg:w-64 px-4 py-2 text-sm bg-[#FFF1EE] border border-[#EDEDED] rounded-full focus:outline-none focus:border-[#FE8B7C] transition-all placeholder:text-[#999]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="ms-2 p-1.5 text-[#555555] hover:text-[#0A0A0A] transition-colors"
                    >
                      <FiX size={18} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2 text-[#0A0A0A] hover:text-[#FE8B7C] transition-colors"
                    aria-label={t.search}
                  >
                    <FiSearch size={20} />
                  </button>
                )}
              </div>

              {/* Search - Mobile */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 text-[#0A0A0A] hover:text-[#FE8B7C] transition-colors"
                aria-label={t.search}
              >
                <FiSearch size={20} />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2 text-[#0A0A0A] hover:text-[#FE8B7C] transition-colors"
                aria-label={t.wishlist}
              >
                <FiHeart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -end-0.5 bg-[#FE8B7C] text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full min-w-[18px] min-h-[18px]">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-[#0A0A0A] hover:text-[#FE8B7C] transition-colors"
                aria-label={t.cart}
              >
                <FiShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -end-0.5 bg-[#FE8B7C] text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full min-w-[18px] min-h-[18px]">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar - Expandable */}
          {searchOpen && (
            <div className="md:hidden pb-3 animate-[slideDown_0.2s_ease-out]">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchProducts}
                  className="flex-1 px-4 py-2.5 text-sm bg-[#FFF1EE] border border-[#EDEDED] rounded-full focus:outline-none focus:border-[#FE8B7C] transition-all placeholder:text-[#999]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="p-2 text-[#555555] hover:text-[#0A0A0A]"
                >
                  <FiX size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-0 bottom-0 w-[300px] max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
            isRTL ? 'right-0' : 'left-0'
          } ${
            mobileMenuOpen
              ? 'translate-x-0'
              : isRTL
              ? 'translate-x-full'
              : '-translate-x-full'
          }`}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#EDEDED]">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
              <img
                src="/logo.png"
                alt="WWenatou"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent && !parent.querySelector('span')) {
                    const span = document.createElement('span');
                    span.className = 'text-lg font-bold text-[#FE8B7C]';
                    span.textContent = 'WWenatou';
                    parent.appendChild(span);
                  }
                }}
              />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#555555] hover:text-[#0A0A0A] transition-colors"
            >
              <FiX size={22} />
            </button>
          </div>

          {/* Mobile Search */}
          <div className="p-4 border-b border-[#EDEDED]">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchProducts}
                className="w-full px-4 py-2.5 ps-10 text-sm bg-[#FFF1EE] border border-[#EDEDED] rounded-full focus:outline-none focus:border-[#FE8B7C] placeholder:text-[#999]"
              />
              <FiSearch
                size={16}
                className="absolute top-1/2 -translate-y-1/2 start-3.5 text-[#999]"
              />
            </form>
          </div>

          {/* Mobile Nav Links */}
          <nav className="flex-1 overflow-y-auto py-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-6 py-3.5 text-[#0A0A0A] hover:bg-[#FFF1EE] hover:text-[#FE8B7C] transition-colors font-medium"
            >
              {t.home}
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-6 py-3.5 text-[#0A0A0A] hover:bg-[#FFF1EE] hover:text-[#FE8B7C] transition-colors font-medium"
            >
              {t.products}
            </Link>

            {/* Mobile Categories */}
            <div>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center justify-between w-full px-6 py-3.5 text-[#0A0A0A] hover:bg-[#FFF1EE] hover:text-[#FE8B7C] transition-colors font-medium"
              >
                {t.categories}
                <FiChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {categoriesOpen && (
                <div className="bg-[#FAFAFA]">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug}`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setCategoriesOpen(false);
                      }}
                      className="block px-10 py-3 text-sm text-[#555555] hover:text-[#FE8B7C] transition-colors"
                    >
                      {getLocalizedName(cat, lang)}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-6 py-3.5 text-[#0A0A0A] hover:bg-[#FFF1EE] hover:text-[#FE8B7C] transition-colors font-medium"
            >
              {t.contact}
            </Link>

            <div className="border-t border-[#EDEDED] my-2" />

            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-6 py-3.5 text-[#0A0A0A] hover:bg-[#FFF1EE] hover:text-[#FE8B7C] transition-colors"
            >
              <span className="flex items-center gap-3">
                <FiHeart size={18} />
                {t.wishlist}
              </span>
              {wishlistCount > 0 && (
                <span className="bg-[#FE8B7C] text-white text-xs px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-6 py-3.5 text-[#0A0A0A] hover:bg-[#FFF1EE] hover:text-[#FE8B7C] transition-colors"
            >
              <span className="flex items-center gap-3">
                <FiShoppingCart size={18} />
                {t.cart}
              </span>
              {cartCount > 0 && (
                <span className="bg-[#FE8B7C] text-white text-xs px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Language Switcher */}
          <div className="border-t border-[#EDEDED] p-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setLanguage('ar');
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  lang === 'ar'
                    ? 'bg-[#FE8B7C] text-white'
                    : 'bg-[#FFF1EE] text-[#555555] hover:bg-[#FE8B7C]/10'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => {
                  setLanguage('fr');
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  lang === 'fr'
                    ? 'bg-[#FE8B7C] text-white'
                    : 'bg-[#FFF1EE] text-[#555555] hover:bg-[#FE8B7C]/10'
                }`}
              >
                Fran&ccedil;ais
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
