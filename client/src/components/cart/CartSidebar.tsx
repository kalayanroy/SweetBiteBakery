import { useEffect } from 'react';
import { Link } from 'wouter';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto transition-transform duration-300 ease-in-out border-l border-[#e3d9c8] z-[101]" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white px-7 py-6 flex justify-between items-center border-b border-[#e3d9c8]">
          <h2 className="font-heading text-2xl font-bold text-primary">Your Cart</h2>
          <button 
            className="rounded-full p-2 text-primary hover:bg-neutral transition-colors" 
            onClick={() => setIsOpen(false)}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-7">
          {cart.items.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="mb-5 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-neutral flex items-center justify-center text-primary">
                  <ShoppingBag size={36} />
                </div>
              </div>
              <h3 className="font-heading text-xl font-semibold text-text-dark mb-3">Your Cart is Empty</h3>
              <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
              <Button 
                onClick={() => setIsOpen(false)}
                className="bg-primary text-white hover:bg-primary/90 transition-all px-8 py-6 rounded-xl font-medium text-base"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="max-h-[calc(100vh-250px)] overflow-y-auto mb-6 pr-1">
                {cart.items.map((item) => (
                  <CartItem key={item.productId} item={item} />
                ))}
              </div>
              
              {/* Cart Summary */}
              <div className="sticky bottom-0 pt-5 border-t border-[#e3d9c8] bg-gradient-to-r from-[#faf6f1] to-white backdrop-blur-sm">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-[#e3d9c8]">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(cart.subtotal)}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-5 italic">Taxes calculated at checkout</p>

                <div className="space-y-3">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/5 transition-all py-6 rounded-xl font-medium text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/cart">View Cart</Link>
                  </Button>
                  
                  <Button
                    asChild
                    className="w-full bg-primary text-white hover:bg-primary/90 transition-all py-6 rounded-xl font-medium text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/checkout">
                      Checkout <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
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
