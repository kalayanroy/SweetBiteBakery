import { useEffect } from 'react';
import { Link } from 'wouter';
import { X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import CartItem from './CartItem';
import { Button } from '@/components/ui/button';

type CartSidebarProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const CartSidebar = ({ isOpen, setIsOpen }: CartSidebarProps) => {
  const { cart } = useCart();

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
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-heading text-2xl font-bold text-primary">Your Cart</h2>
          <button 
            className="text-gray-500 hover:text-primary" 
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          {cart.items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Button 
                onClick={() => setIsOpen(false)}
                className="bg-primary text-white hover:bg-opacity-90"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="max-h-[calc(100vh-250px)] overflow-y-auto mb-4">
                {cart.items.map((item) => (
                  <CartItem key={item.productId} item={item} />
                ))}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-bold text-lg">{formatCurrency(cart.subtotal)}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Shipping and taxes calculated at checkout</p>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/cart">
                    <Button
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-primary text-white hover:bg-opacity-90"
                    >
                      View Cart
                    </Button>
                  </Link>
                  <Link href="/checkout">
                    <Button
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-success text-white hover:bg-opacity-90"
                    >
                      Checkout
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
