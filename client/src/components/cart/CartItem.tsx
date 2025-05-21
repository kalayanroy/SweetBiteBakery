import { X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CartItem as CartItemType } from '@shared/schema';
import { useCart } from '@/hooks/use-cart';

type CartItemProps = {
  item: CartItemType;
};

const CartItem = ({ item }: CartItemProps) => {
  const { removeFromCart, updateCartItemQuantity } = useCart();

  return (
    <div className="flex items-center py-2 border-b border-gray-200">
      <img 
        src={item.image} 
        alt={item.name} 
        className="w-12 h-12 object-cover rounded-md"
      />
      <div className="ml-3 flex-1">
        <p className="font-semibold text-sm">{item.name}</p>
        <div className="flex items-center mt-1">
          <button 
            className="text-xs bg-gray-200 px-2 py-0.5 rounded-l-md"
            onClick={() => updateCartItemQuantity(item.productId, Math.max(1, item.quantity - 1))}
          >
            -
          </button>
          <span className="text-xs px-2 py-0.5 bg-gray-100">{item.quantity}</span>
          <button 
            className="text-xs bg-gray-200 px-2 py-0.5 rounded-r-md"
            onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
          >
            +
          </button>
          <p className="text-xs text-gray-500 ml-2">{formatCurrency(item.price)} each</p>
        </div>
      </div>
      <button 
        className="text-gray-400 hover:text-error"
        onClick={() => removeFromCart(item.productId)}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default CartItem;
