import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { useLanguage } from '../i18n';
import { api } from '../services/api';
import { getLocalizedName, getLocalizedText } from '../utils/helpers';
import type { Product, Category, HomepageSection } from '../types';
import ProductCard from '../components/product/ProductCard';

function useOnScreen(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useOnScreen(ref);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

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

function SkeletonCategory() {
  return (
    <div className="aspect-[4/3] rounded-2xl animate-pulse bg-gradient-to-br from-[#FFF1EE] to-[#EDEDED]" />
  );
}

export default function HomePage() {
  const { lang, t } = useLanguage();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sectionsRes, catsRes, newRes, featRes, saleRes] = await Promise.allSettled([
          api.getHomepageSections(),
          api.getCategories(),
          api.getProducts({ new_arrival: 'true', limit: '8' }),
          api.getProducts({ featured: 'true', limit: '8' }),
          api.getProducts({ sale: 'true', limit: '8' }),
        ]);
        if (sectionsRes.status === 'fulfilled') setSections(sectionsRes.value?.data || sectionsRes.value || []);
        if (catsRes.status === 'fulfilled') setCategories(catsRes.value?.data || catsRes.value || []);
        if (newRes.status === 'fulfilled') setNewArrivals(newRes.value?.data || newRes.value?.products || []);
        if (featRes.status === 'fulfilled') setFeatured(featRes.value?.data || featRes.value?.products || []);
        if (saleRes.status === 'fulfilled') setSaleProducts(saleRes.value?.data || saleRes.value?.products || []);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const heroSection = sections.find(s => s.section_type === 'hero');
  const bannerSection = sections.find(s => s.section_type === 'banner');
  const ArrowIcon = lang === 'ar' ? FiArrowLeft : FiArrowRight;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <AnimatedSection>
        <section className="relative overflow-hidden">
          <div
            className="min-h-[70vh] md:min-h-[80vh] flex items-center relative"
            style={{
              background: heroSection?.image
                ? `url(${heroSection.image}) center/cover no-repeat`
                : 'linear-gradient(135deg, #FFF1EE 0%, rgba(254,139,124,0.12) 50%, #FFF1EE 100%)',
            }}
          >
            {heroSection?.image && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent rtl:bg-gradient-to-l" />
            )}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="max-w-2xl">
                <h1
                  className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${
                    heroSection?.image ? 'text-white' : 'text-[#0A0A0A]'
                  }`}
                >
                  {heroSection ? getLocalizedText(heroSection, 'title', lang) || t.heroTitle : t.heroTitle}
                </h1>
                <p
                  className={`text-lg md:text-xl mb-8 leading-relaxed ${
                    heroSection?.image ? 'text-white/90' : 'text-[#555555]'
                  }`}
                >
                  {heroSection ? getLocalizedText(heroSection, 'subtitle', lang) || t.heroSubtitle : t.heroSubtitle}
                </p>
                <Link
                  to={heroSection?.link || '/products'}
                  className="inline-flex items-center gap-2 bg-[#FE8B7C] hover:bg-[#F47768] text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-[#FE8B7C]/30 hover:-translate-y-0.5"
                >
                  {t.shopNow}
                  <ArrowIcon className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </section>
      </AnimatedSection>

      {/* Categories Section */}
      <AnimatedSection>
        <section className="py-16 md:py-20 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0A0A0A]">{t.categories}</h2>
            <Link
              to="/products"
              className="text-[#FE8B7C] hover:text-[#F47768] font-medium flex items-center gap-1 transition-colors"
            >
              {t.viewAll}
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCategory key={i} />)
              : categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.slug}`}
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#FFF1EE]"
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={getLocalizedName(cat, lang)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#FFF1EE] to-[#FE8B7C]/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-colors duration-300" />
                    <div className="absolute bottom-0 inset-x-0 p-4">
                      <h3 className="text-white font-semibold text-lg">{getLocalizedName(cat, lang)}</h3>
                    </div>
                  </Link>
                ))}
          </div>
        </section>
      </AnimatedSection>

      {/* New Arrivals */}
      {(loading || newArrivals.length > 0) && (
        <AnimatedSection>
          <section className="py-16 md:py-20 bg-[#FFF1EE]/40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-[#0A0A0A]">{t.newArrivals}</h2>
                <Link
                  to="/products?sort=newest"
                  className="text-[#FE8B7C] hover:text-[#F47768] font-medium flex items-center gap-1 transition-colors"
                >
                  {t.viewAll}
                  <ArrowIcon className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                  : newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Featured Products */}
      {(loading || featured.length > 0) && (
        <AnimatedSection>
          <section className="py-16 md:py-20 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0A0A0A]">{t.featuredProducts}</h2>
              <Link
                to="/products?sort=featured"
                className="text-[#FE8B7C] hover:text-[#F47768] font-medium flex items-center gap-1 transition-colors"
              >
                {t.viewAll}
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                : featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Promotional Banner */}
      <AnimatedSection>
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="relative rounded-3xl overflow-hidden min-h-[300px] md:min-h-[350px] flex items-center"
              style={{
                background: bannerSection?.image
                  ? `url(${bannerSection.image}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #FE8B7C 0%, #F47768 50%, #e06555 100%)',
              }}
            >
              {bannerSection?.image && (
                <div className="absolute inset-0 bg-black/30" />
              )}
              <div className="relative z-10 p-8 md:p-14 max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {bannerSection
                    ? getLocalizedText(bannerSection, 'title', lang) || t.offers
                    : t.offers}
                </h2>
                <p className="text-white/90 text-lg mb-6">
                  {bannerSection
                    ? getLocalizedText(bannerSection, 'subtitle', lang) || t.heroSubtitle
                    : t.heroSubtitle}
                </p>
                <Link
                  to={bannerSection?.link || '/products?sale=true'}
                  className="inline-flex items-center gap-2 bg-white text-[#FE8B7C] hover:bg-white/90 px-8 py-3.5 rounded-full font-semibold transition-all duration-300 hover:shadow-lg"
                >
                  {t.shopNow}
                  <ArrowIcon className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Offers / Sale Products */}
      {(loading || saleProducts.length > 0) && (
        <AnimatedSection>
          <section className="py-16 md:py-20 bg-[#FFF1EE]/40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-[#0A0A0A]">{t.offers}</h2>
                <Link
                  to="/products?sale=true"
                  className="text-[#FE8B7C] hover:text-[#F47768] font-medium flex items-center gap-1 transition-colors"
                >
                  {t.viewAll}
                  <ArrowIcon className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                  : saleProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}
    </div>
  );
}
