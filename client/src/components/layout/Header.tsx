import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingCart, User, Menu, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import CartSidebar from '@/components/cart/CartSidebar';
import MobileSidebar from './MobileSidebar';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [location] = useLocation();
  const { cart, isOpen, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
  
  return (
    <header className="bg-gradient-to-r from-[#faf6f1] to-white shadow-md backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-[#e3d9c8]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <span className="text-primary text-2xl sm:text-3xl font-heading font-bold tracking-tight">SweetBite</span>
                <span className="ml-1 text-accent/80 text-xs uppercase tracking-widest font-semibold hidden sm:inline-block">Bakery</span>
              </div>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link href="/">
              <div className={`text-text-dark hover:text-primary transition-colors duration-300 font-semibold relative cursor-pointer ${location === '/' ? 'text-primary' : ''}`}>
                <span>Home</span>
                {location === '/' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full transform translate-y-1"></span>}
              </div>
            </Link>
            <Link href="/products">
              <div className={`text-text-dark hover:text-primary transition-colors duration-300 font-semibold relative cursor-pointer ${location === '/products' ? 'text-primary' : ''}`}>
                <span>Products</span>
                {location === '/products' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full transform translate-y-1"></span>}
              </div>
            </Link>
            <Link href="/#about">
              <div className="text-text-dark hover:text-primary transition-colors duration-300 font-semibold cursor-pointer">
                About Us
              </div>
            </Link>
            <Link href="/#contact">
              <div className="text-text-dark hover:text-primary transition-colors duration-300 font-semibold cursor-pointer">
                Contact
              </div>
            </Link>
          </nav>

          {/* Account & Cart - Desktop */}
          <div className="hidden md:flex items-center space-x-5">
            <Link href="/admin/login">
              <div className="flex items-center text-text-dark hover:text-primary transition-colors cursor-pointer">
                <User className="h-5 w-5" />
                <span className="ml-2 font-semibold">Account</span>
              </div>
            </Link>
          </div>

          {/* Mobile Menu and Cart Buttons */}
          <div className="flex items-center space-x-2 md:hidden">
            <button 
              className="text-primary p-2 flex items-center justify-center" 
              onClick={() => setIsOpen(true)}
              aria-label="Open cart"
            >
              <div className="relative">
                <ShoppingBag className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
            </button>
            <button 
              className="text-primary p-2" 
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      <MobileSidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />
      
      {/* Cart Sidebar */}
      <CartSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      
      {/* Floating Cart Button (visible on all pages) */}
      <div className="fixed bottom-6 right-6 z-40 md:block hidden">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
          aria-label="Open cart"
        >
          <div className="relative">
            <ShoppingBag className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
        </Button>
      </div>
    </header>
  );
};

export default Header;
