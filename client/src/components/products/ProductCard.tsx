import { Link } from 'wouter';
import { ShoppingCart, Plus, Star } from 'lucide-react';
import { ProductWithCategory } from '@shared/schema';
import { useCart } from '@/hooks/use-cart';
import { formatCurrency, truncateText } from '@/lib/utils';

type ProductCardProps = {
  product: ProductWithCategory;
  featured?: boolean;
  priority?: boolean;
};

const ProductCard = ({ product, featured = false, priority = false }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  let badge = null;
  let badgeColor = "";

  if (product.isBestseller) {
    badge = "Bestseller";
    badgeColor = "bg-amber-100 text-amber-700";
  } else if (product.isPopular) {
    badge = "Popular";
    badgeColor = "bg-purple-100 text-purple-700";
  } else if (product.isNew) {
    badge = "New";
    badgeColor = "bg-accent/25 text-primary";
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <div className={`bg-white rounded-2xl border border-[#e3d9c8] overflow-hidden group ${featured
        ? 'shadow-md hover:shadow-xl transition-all duration-500'
        : 'shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2'
        }`}>
        {/* Image Container with overlay effect */}
        <div className="relative overflow-hidden">
          {/* Badge */}
          {badge && (
            <div className={`absolute top-4 left-4 z-10 ${badgeColor} py-1 px-3 rounded-full text-xs font-bold flex items-center`}>
              {product.isBestseller && <Star className="mr-1" size={12} fill="currentColor" />}
              {badge}
            </div>
          )}

          {/* Category Tag */}
          <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm py-1 px-3 rounded-full text-xs font-medium text-gray-700">
            {product.category.name}
          </div>

          {/* Quick add button - visible on hover */}
          <button
            className="absolute right-4 bottom-4 z-10 bg-primary text-white p-3 rounded-full shadow-lg transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <Plus size={20} />
          </button>

          {/* Product Image */}
          <div className="overflow-hidden bg-gradient-to-br from-[#faf6f1] via-[#f5efe6] to-[#ede5d8]">
            <img
              src={product.image}
              alt={product.name}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              // @ts-ignore - fetchPriority is not yet in React types
              fetchpriority={priority ? "high" : "auto"}
              onLoad={(e) => e.currentTarget.classList.add('loaded')}
              style={{ mixBlendMode: 'multiply' }}
              className={`w-full ${featured ? 'h-72' : 'h-56'} object-contain p-4 transform transition-transform duration-700 group-hover:scale-105 blur-sm opacity-70 transition-all duration-300 [&.loaded]:blur-0 [&.loaded]:opacity-100`}
            />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product Title & Price */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-heading text-lg font-bold text-text-dark group-hover:text-primary transition-colors duration-300 flex-1">{product.name}</h3>
            <span className="text-primary font-bold ml-3 whitespace-nowrap">{formatCurrency(product.price)}</span>
          </div>

          {/* Optional dietary tags */}
          {Array.isArray(product.dietaryOptions) && (product.dietaryOptions as string[]).length > 0 && (
            <div className="flex space-x-1 mb-3">
              {(product.dietaryOptions as string[]).includes('vegan') && (
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded">Vegan</span>
              )}
              {(product.dietaryOptions as string[]).includes('gluten-free') && (
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">GF</span>
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-gray-600 text-sm mb-5 leading-relaxed">
            {truncateText(product.description, featured ? 120 : 75)}
          </p>

          {/* Add to Cart Button */}
          <button
            className="w-full bg-[#faf6f1] hover:bg-primary hover:text-white text-primary py-3 px-4 rounded-xl font-medium transition-colors duration-300 flex items-center justify-center"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2" size={18} />
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
