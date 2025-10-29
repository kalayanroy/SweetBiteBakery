import { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem, ProductWithCategory } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cart: Cart;
  addToCart: (product: ProductWithCategory, options?: { size?: string; color?: string; price?: number }) => void;
  removeFromCart: (productId: number, size?: string, color?: string) => void;
  updateCartItemQuantity: (productId: number, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'sweetbite-cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize cart from localStorage or create new one
  const [cart, setCart] = useState<Cart>(() => {
    if (typeof window === 'undefined') {
      return { id: '', items: [], subtotal: 0 };
    }
    
    return { id: createCartId(), items: [], subtotal: 0 };
  });

  // Clear old cart data on mount to fix price calculation issues
  useEffect(() => {
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Helper function to create a unique cart ID
  function createCartId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // Calculate subtotal
  function calculateSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // Add item to cart
  const addToCart = (product: ProductWithCategory, options?: { size?: string; color?: string; price?: number }) => {
    const { size, color, price } = options || {};
    const actualPrice = price !== undefined ? price : product.price;
    
    setCart(prevCart => {
      // Find existing item with same product, size, and color
      const existingItemIndex = prevCart.items.findIndex(
        item => item.productId === product.id && 
                item.size === size && 
                item.color === color
      );
      
      let updatedItems;
      
      if (existingItemIndex >= 0) {
        // Item already in cart, increase quantity
        updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
      } else {
        // New item
        updatedItems = [
          ...prevCart.items,
          {
            productId: product.id,
            name: product.name,
            price: actualPrice,
            image: product.image,
            quantity: 1,
            size,
            color,
          }
        ];
      }
      
      return {
        ...prevCart,
        items: updatedItems,
        subtotal: calculateSubtotal(updatedItems)
      };
    });

    // Show toast and open cart sidebar after state update
    const variantText = (size || color) ? ` (${[size, color].filter(Boolean).join(', ')})` : '';
    toast({
      title: "Added to cart",
      description: `${product.name}${variantText} has been added to your cart`,
    });
    
    if (!isOpen) {
      setTimeout(() => setIsOpen(true), 300);
    }
  };

  // Remove item from cart
  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(item => item.productId !== productId);
      return {
        ...prevCart,
        items: updatedItems,
        subtotal: calculateSubtotal(updatedItems)
      };
    });
  };

  // Update item quantity
  const updateCartItemQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    
    setCart(prevCart => {
      const updatedItems = prevCart.items.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      );
      
      return {
        ...prevCart,
        items: updatedItems,
        subtotal: calculateSubtotal(updatedItems)
      };
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart({
      id: createCartId(),
      items: [],
      subtotal: 0
    });
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateCartItemQuantity, 
      clearCart,
      isOpen,
      setIsOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
