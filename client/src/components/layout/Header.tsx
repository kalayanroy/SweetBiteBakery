import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingCart, User, Menu } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import CartSidebar from '@/components/cart/CartSidebar';
import MobileSidebar from './MobileSidebar';

const Header = () => {
  const [location] = useLocation();
  const { cart, isOpen, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center">
              <span className="text-primary text-3xl font-heading font-bold">SweetBite</span>
            </a>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className={`text-text-dark hover:text-primary transition-colors duration-300 font-semibold ${location === '/' ? 'text-primary' : ''}`}>
                Home
              </a>
            </Link>
            <Link href="/products">
              <a className={`text-text-dark hover:text-primary transition-colors duration-300 font-semibold ${location === '/products' ? 'text-primary' : ''}`}>
                Products
              </a>
            </Link>
            <Link href="/#about">
              <a className="text-text-dark hover:text-primary transition-colors duration-300 font-semibold">
                About Us
              </a>
            </Link>
            <Link href="/#contact">
              <a className="text-text-dark hover:text-primary transition-colors duration-300 font-semibold">
                Contact
              </a>
            </Link>
          </nav>

          {/* Cart and Account - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative group">
              <button 
                className="flex items-center text-text-dark hover:text-primary transition-colors"
                onClick={() => setIsOpen(true)}
              >
                <ShoppingCart className="text-xl" />
                <span className="ml-2 font-semibold">Cart</span>
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.items.length}
                </span>
              </button>
            </div>
            
            <Link href="/admin/login">
              <a className="flex items-center text-text-dark hover:text-primary transition-colors">
                <User className="text-xl" />
                <span className="ml-2 font-semibold">Account</span>
              </a>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-4">
            <button 
              className="p-2 text-primary relative"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingCart className="text-xl" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.items.length}
              </span>
            </button>
            <button 
              className="text-primary" 
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="text-2xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      
      {/* Mobile Menu Sidebar */}
      <MobileSidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />
    </header>
  );
};

export default Header;
