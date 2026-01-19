import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useIsMobile } from '@/hooks/use-mobile';
import CartSidebar from '@/components/cart/CartSidebar';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { cart, isOpen, setIsOpen } = useCart();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />

      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg p-3 sm:p-4 z-50 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/40 group mb-14 md:mb-0"
        aria-label="Open cart"
      >
        <div className="relative">
          <ShoppingCart size={isMobile ? 20 : 24} className="group-hover:animate-bounce" />
          {cart.items.length > 0 && (
            <span className="absolute -top-3 -right-3 bg-accent text-white text-[10px] sm:text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center animate-pulse">
              {cart.items.length}
            </span>
          )}
        </div>
      </button>

      {/* Special tooltip that appears above the cart button */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-8 bg-white px-3 py-2 rounded-lg shadow-md border border-primary/20 text-xs sm:text-sm font-medium text-primary z-50 transform transition-all duration-300 mb-14 md:mb-0">
          {formatTotal(cart.subtotal)} · {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
          <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white border-r border-b border-primary/20 transform rotate-45"></div>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

// Helper function to format the total in a compact way
function formatTotal(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: 'compact'
  }).format(amount);
}

export default Layout;
