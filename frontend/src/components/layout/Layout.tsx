import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <Toaster position="top-center" toastOptions={{
        duration: 3000,
        style: {
          fontFamily: 'Cairo, Poppins, sans-serif',
          borderRadius: '12px',
        },
      }} />
    </div>
  );
}
