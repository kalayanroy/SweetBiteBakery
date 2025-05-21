import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import ProductFilter from "@/components/products/ProductFilter";
import ProductGrid from "@/components/products/ProductGrid";
import { ProductWithCategory, Category } from "@shared/schema";
import { useQueryState } from "@/hooks/use-query-state";

const Products = () => {
  const [queryParams] = useQueryState();
  
  // Fetch all products
  const { 
    data: products, 
    isLoading: productsLoading, 
    error: productsError,
    refetch: refetchProducts
  } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/products'],
  });
  
  // Fetch categories for filtering
  const { 
    data: categories, 
    isLoading: categoriesLoading 
  } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Refetch products when query params change
  useEffect(() => {
    refetchProducts();
  }, [queryParams, refetchProducts]);

  // Filter products based on query parameters
  const filterProducts = (products: ProductWithCategory[]) => {
    if (!products) return [];

    let filtered = [...products];

    // Filter by category
    if (queryParams.category) {
      filtered = filtered.filter(p => 
        p.category.slug === queryParams.category
      );
    }

    // Filter by dietary options
    if (queryParams.dietary) {
      const dietaryOptions = queryParams.dietary.split(',');
      filtered = filtered.filter(p => 
        // Check if product has ALL selected dietary options
        dietaryOptions.every(option => 
          Array.isArray(p.dietaryOptions) && 
          (p.dietaryOptions as string[]).includes(option)
        )
      );
    }

    // Filter by price range
    if (queryParams.price) {
      const priceRanges = queryParams.price.split(',');
      filtered = filtered.filter(p => 
        priceRanges.some(range => {
          const [min, max] = range.split('-').map(Number);
          return p.price >= min && p.price <= max;
        })
      );
    }

    // Filter by search term
    if (queryParams.q) {
      const searchTerm = queryParams.q.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.description.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  };

  const filteredProducts = products ? filterProducts(products) : [];

  return (
    <Layout>
      <Helmet>
        <title>Products | SweetBite Bakery</title>
        <meta name="description" content="Browse our delicious selection of freshly baked goods including cakes, pastries, cookies, and artisan breads." />
        <meta property="og:title" content="Products | SweetBite Bakery" />
        <meta property="og:description" content="Browse our delicious selection of freshly baked goods including cakes, pastries, cookies, and artisan breads." />
      </Helmet>

      <section className="py-20 bg-neutral">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary mb-4">Our Products</h1>
            <p className="text-text-dark max-w-2xl mx-auto">
              Browse our delicious selection of freshly baked goods made with love and the finest ingredients.
            </p>
          </div>

          <div className="flex flex-wrap">
            <div className="w-full lg:w-1/4 mb-6 lg:mb-0">
              {categoriesLoading ? (
                <div className="animate-pulse bg-white p-6 rounded-lg shadow-md">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
                  <div className="h-5 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-full"></div>
                </div>
              ) : (
                <ProductFilter categories={categories || []} />
              )}
            </div>
            
            <div className="w-full lg:w-3/4">
              <ProductGrid 
                products={filteredProducts} 
                isLoading={productsLoading} 
                error={productsError} 
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
