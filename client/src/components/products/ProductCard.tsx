import { Link } from 'wouter';
import { ShoppingCart } from 'lucide-react';
import { ProductWithCategory } from '@shared/schema';
import { useCart } from '@/hooks/use-cart';
import { formatCurrency, truncateText } from '@/lib/utils';

type ProductCardProps = {
  product: ProductWithCategory;
  featured?: boolean;
};

const ProductCard = ({ product, featured = false }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  let badge = null;
  if (product.isBestseller) {
    badge = "Bestseller";
  } else if (product.isPopular) {
    badge = "Popular";
  } else if (product.isNew) {
    badge = "New";
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <a className={`bg-white rounded-lg shadow-lg overflow-hidden ${featured ? 'hover-card' : 'transition-transform duration-300 hover:-translate-y-2'}`}>
        <img 
          src={product.image} 
          alt={product.name} 
          className={`w-full ${featured ? 'h-60' : 'h-48'} object-cover`}
        />
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-heading text-xl font-bold text-primary">{product.name}</h3>
            {badge && (
              <span className="bg-accent text-primary text-sm font-semibold py-1 px-3 rounded-full">{badge}</span>
            )}
          </div>
          <p className="text-text-dark text-sm mb-4">
            {truncateText(product.description, featured ? 120 : 80)}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-primary text-xl font-bold">{formatCurrency(product.price)}</span>
            <button 
              className="bg-primary text-white py-2 px-4 rounded-md font-semibold hover:bg-opacity-90 transition flex items-center"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2" size={16} /> Add to Cart
            </button>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default ProductCard;
