import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { X, User, Home, ShoppingBag, Info, Phone } from 'lucide-react';

type MobileSidebarProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const MobileSidebar = ({ isOpen, setIsOpen }: MobileSidebarProps) => {
  const [location] = useLocation();

  // Close sidebar when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location, setIsOpen]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 max-w-[80vw] bg-white shadow-xl overflow-y-auto">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="font-heading text-xl font-bold text-primary">Menu</h2>
          <button 
            className="text-gray-500 hover:text-primary" 
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-4">
            <li>
              <Link href="/">
                <a className="flex items-center p-2 text-text-dark hover:text-primary hover:bg-neutral rounded-md">
                  <Home className="mr-3" size={20} />
                  <span>Home</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/products">
                <a className="flex items-center p-2 text-text-dark hover:text-primary hover:bg-neutral rounded-md">
                  <ShoppingBag className="mr-3" size={20} />
                  <span>Products</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/#about">
                <a className="flex items-center p-2 text-text-dark hover:text-primary hover:bg-neutral rounded-md">
                  <Info className="mr-3" size={20} />
                  <span>About Us</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/#contact">
                <a className="flex items-center p-2 text-text-dark hover:text-primary hover:bg-neutral rounded-md">
                  <Phone className="mr-3" size={20} />
                  <span>Contact</span>
                </a>
              </Link>
            </li>
            <li className="border-t pt-4 mt-4">
              <Link href="/admin/login">
                <a className="flex items-center p-2 text-text-dark hover:text-primary hover:bg-neutral rounded-md">
                  <User className="mr-3" size={20} />
                  <span>Account</span>
                </a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MobileSidebar;
