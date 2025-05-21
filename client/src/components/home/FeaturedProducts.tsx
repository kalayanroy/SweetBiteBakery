import { useQuery } from "@tanstack/react-query";
import { Link } from 'wouter';
import { ProductWithCategory } from "@shared/schema";
import ProductCard from '@/components/products/ProductCard';
import { ArrowRight } from 'lucide-react';

const FeaturedProducts = () => {
  const { data: products, isLoading, error } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/products/featured'],
  });

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">Featured Delights</h2>
          <p className="text-text-dark max-w-2xl mx-auto">Discover our most popular treats loved by our customers. Handcrafted with care and premium ingredients.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden p-6 animate-pulse">
                <div className="w-full h-60 bg-gray-200 mb-4"></div>
                <div className="h-6 bg-gray-200 w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 w-full mb-4"></div>
                <div className="h-4 bg-gray-200 w-5/6 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 w-20"></div>
                  <div className="h-10 bg-gray-200 w-32 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            Failed to load featured products. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products && products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/products">
            <a className="inline-block bg-transparent border-2 border-primary text-primary py-3 px-8 rounded-full font-semibold hover:bg-primary hover:text-white transition-all">
              View All Products <ArrowRight className="ml-2 inline" size={18} />
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
