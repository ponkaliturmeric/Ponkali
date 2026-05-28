import { CartProvider } from '@/components/CartContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MiniCart from '@/components/MiniCart';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AnnouncementBar />
      <Header />
      <MiniCart />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </CartProvider>
  );
}
