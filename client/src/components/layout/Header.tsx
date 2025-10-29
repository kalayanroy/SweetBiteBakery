import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, User, Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import CartSidebar from "@/components/cart/CartSidebar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

// Home icon component
const HomeIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const Header = () => {
  const [location] = useLocation();
  const { cart, isOpen, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // Close mobile menu when changing location
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-[#e3d9c8]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <span className="text-primary text-xl sm:text-2xl md:text-3xl font-heading font-bold tracking-tight">
                    SweetBite
                  </span>
                  <span className="ml-1 text-accent/80 text-[10px] sm:text-xs uppercase tracking-widest font-semibold hidden xs:inline-block">
                    Bakery
                  </span>
                </div>
              </Link>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-8 xl:space-x-10">
              <Link href="/">
                <div
                  className={`text-text-dark hover:text-primary transition-colors duration-300 font-semibold relative cursor-pointer ${location === "/" ? "text-primary" : ""}`}
                >
                  <span>Home</span>
                  {location === "/" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full transform translate-y-1"></span>
                  )}
                </div>
              </Link>
              <Link href="/products">
                <div
                  className={`text-text-dark hover:text-primary transition-colors duration-300 font-semibold relative cursor-pointer ${location === "/products" ? "text-primary" : ""}`}
                >
                  <span>Products</span>
                  {location === "/products" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full transform translate-y-1"></span>
                  )}
                </div>
              </Link>
              <Link href="/about">
                <div className={`text-text-dark hover:text-primary transition-colors duration-300 font-semibold relative cursor-pointer ${location === "/about" ? "text-primary" : ""}`}>
                  <span>About Us</span>
                  {location === "/about" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full transform translate-y-1"></span>
                  )}
                </div>
              </Link>
              <Link href="/contact">
                <div className={`text-text-dark hover:text-primary transition-colors duration-300 font-semibold relative cursor-pointer ${location === "/contact" ? "text-primary" : ""}`}>
                  <span>Contact</span>
                  {location === "/contact" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full transform translate-y-1"></span>
                  )}
                </div>
              </Link>
            </nav>

            {/* Account & Cart Buttons - Desktop */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link href="/admin/login">
                <div className="flex items-center text-text-dark hover:text-primary transition-colors cursor-pointer">
                  <User className="h-5 w-5" />
                  <span className="ml-2 font-semibold">Account</span>
                </div>
              </Link>
            </div>

            {/* Tablet Navigation (md screens only) */}
            <nav className="hidden md:flex lg:hidden items-center">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <div
                    className={`flex flex-col items-center text-text-dark hover:text-primary transition-colors duration-300 ${location === "/" ? "text-primary" : ""}`}
                  >
                    <HomeIcon className="h-5 w-5" />
                    <span className="text-xs mt-1">Home</span>
                  </div>
                </Link>
                <Link href="/products">
                  <div
                    className={`flex flex-col items-center text-text-dark hover:text-primary transition-colors duration-300 ${location === "/products" ? "text-primary" : ""}`}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span className="text-xs mt-1">Products</span>
                  </div>
                </Link>
                <button
                  onClick={() => setIsOpen(true)}
                  className="flex flex-col items-center text-text-dark hover:text-primary transition-colors duration-300"
                  aria-label="Open cart"
                >
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <span className="text-xs mt-1">Cart</span>
                </button>
                <Link href="/admin/login">
                  <div className="flex flex-col items-center text-text-dark hover:text-primary transition-colors duration-300">
                    <User className="h-5 w-5" />
                    <span className="text-xs mt-1">Account</span>
                  </div>
                </Link>
              </div>
            </nav>

            {/* Mobile Menu and Cart Buttons */}
            <div className="flex items-center space-x-1 md:hidden">
              <button
                className="relative text-primary p-2 flex items-center justify-center"
                onClick={() => setIsOpen(true)}
                aria-label="Open cart"
              >
                <ShoppingBag className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
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
      </header>

      {/* Mobile Menu (Full Screen Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col md:hidden">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-[#e3d9c8]">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex items-center cursor-pointer">
                <span className="text-primary text-xl font-heading font-bold tracking-tight">
                  SweetBite
                </span>
                <span className="ml-1 text-accent/80 text-[10px] uppercase tracking-widest font-semibold">
                  Bakery
                </span>
              </div>
            </Link>
            <button
              className="text-primary p-2"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Menu Items */}
          <nav className="flex-1 overflow-y-auto py-8 px-6">
            <ul className="space-y-6">
              <li>
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className={`text-lg font-medium ${location === "/" ? "text-primary" : "text-text-dark"}`}
                  >
                    Home
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/products" onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className={`text-lg font-medium ${location === "/products" ? "text-primary" : "text-text-dark"}`}
                  >
                    Products
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                  <div className={`text-lg font-medium ${location === "/about" ? "text-primary" : "text-text-dark"}`}>
                    About Us
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                  <div className={`text-lg font-medium ${location === "/contact" ? "text-primary" : "text-text-dark"}`}>
                    Contact
                  </div>
                </Link>
              </li>
              <li className="pt-4 border-t border-[#e3d9c8]">
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="text-lg font-medium text-text-dark flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    My Account
                  </div>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setTimeout(() => setIsOpen(true), 100);
                  }}
                  className="text-lg font-medium text-text-dark flex items-center w-full text-left"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Shopping Cart
                  {totalItems > 0 && (
                    <span className="ml-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default Header;
