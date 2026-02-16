import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { ProductWithCategory, Category } from '@shared/schema';
import ProductCard from './ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ProductGridProps = {
  products: ProductWithCategory[];
  isLoading: boolean;
  error: unknown;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  queryParams: any; // Using any for now to match the hook return type, but interface is better
  setQueryParams: (params: any) => void;
  categories: Category[];
};

const ProductGrid = ({
  products,
  isLoading,
  error,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  queryParams,
  setQueryParams,
  categories
}: ProductGridProps) => {
  // Local state for search input to avoid triggering fetch on every keystroke
  const [localSearch, setLocalSearch] = useState(queryParams.q || '');

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (queryParams.q || '')) {
        const newParams = { ...queryParams };
        if (localSearch) {
          newParams.q = localSearch;
        } else {
          delete newParams.q;
        }
        setQueryParams(newParams);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, queryParams, setQueryParams]);

  // Sync local search if URL changes externally
  useEffect(() => {
    if (queryParams.q !== localSearch) {
      setLocalSearch(queryParams.q || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams.q]);

  const handleSortChange = (value: string) => {
    const newParams = { ...queryParams, sort: value };
    setQueryParams(newParams);
  };

  const handleCategoryChange = (value: string) => {
    const newParams = { ...queryParams };
    if (value === 'all') {
      delete newParams.category;
    } else {
      newParams.category = value;
    }
    setQueryParams(newParams);
  };

  return (
    <div className="w-full lg:pl-8">
      {/* Search, Category, and Sort */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="w-full md:w-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Category Dropdown */}
          <Select
            value={queryParams.category || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full md:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.slug}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <Select
            value={queryParams.sort || 'featured'}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="bestselling">Bestselling</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading && products.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden p-6 animate-pulse">
              <div className="w-full h-48 bg-gray-200 mb-4"></div>
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
          Failed to load products. Please try again later.
        </div>
      ) : products.length === 0 ? (
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={i < 4}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchNextPage?.()}
                disabled={isFetchingNextPage || isLoading}
                className="px-8 py-3 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More Products'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductGrid;
