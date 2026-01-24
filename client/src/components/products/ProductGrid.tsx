import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductWithCategory } from '@shared/schema';
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
};

const ProductGrid = ({ products, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage }: ProductGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  // Filter and sort products
  const filteredProducts = products ? products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'bestselling':
        if (a.isBestseller === b.isBestseller) return 0;
        return a.isBestseller ? -1 : 1;
      default:
        if (a.featured === b.featured) return 0;
        return a.featured ? -1 : 1;
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="w-full lg:pl-8">
      {/* Search and Sort */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="w-full md:w-auto mb-4 md:mb-0">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          </div>
        </div>
        <div className="w-full md:w-auto">
          <Select
            value={sortOption}
            onValueChange={(value) => {
              setSortOption(value);
              setCurrentPage(1); // Reset to first page on sort change
            }}
          >
            <SelectTrigger className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
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
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      ) : sortedProducts.length === 0 ? (
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <nav className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="py-2 px-4 border border-gray-300 bg-white text-text-dark rounded-l-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`py-2 px-4 border-t border-b border-gray-300 ${currentPage === index + 1
                      ? 'bg-primary text-white'
                      : 'bg-white text-text-dark hover:bg-gray-100'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="py-2 px-4 border border-gray-300 bg-white text-text-dark rounded-r-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
          )}

          {/* Load More Button */}
          {hasNextPage && !isLoading && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchNextPage?.()}
                disabled={isFetchingNextPage}
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
