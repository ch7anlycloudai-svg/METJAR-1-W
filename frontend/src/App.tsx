import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useLanguage } from './i18n';
import Layout from './components/layout/Layout';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductsList = lazy(() => import('./pages/admin/ProductsList'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const CategoriesList = lazy(() => import('./pages/admin/CategoriesList'));
const OrdersList = lazy(() => import('./pages/admin/OrdersList'));
const OrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const CustomersList = lazy(() => import('./pages/admin/CustomersList'));
const CouponsList = lazy(() => import('./pages/admin/CouponsList'));
const HomepageManager = lazy(() => import('./pages/admin/HomepageManager'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[#FFF1EE] border-t-[#FE8B7C] rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const { lang } = useLanguage();

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Storefront */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="categories" element={<CategoriesList />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="customers" element={<CustomersList />} />
          <Route path="coupons" element={<CouponsList />} />
          <Route path="homepage" element={<HomepageManager />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
