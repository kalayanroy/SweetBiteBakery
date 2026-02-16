import { useEffect, useMemo } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import ProductGrid from "@/components/products/ProductGrid";
import { ProductWithCategory, Category } from "@shared/schema";
import { useQueryState } from "@/hooks/use-query-state";

const Products = () => {
  const [queryParams, setQueryParams] = useQueryState();

  // Fetch products with infinite query for progressive loading
  const {
    data,
    isLoading: productsLoading,
    error: productsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['/api/products', queryParams],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 3; // Reduced from 6 for faster initial load
      const offset = pageParam;

      const searchParams = new URLSearchParams();
      searchParams.append('limit', limit.toString());
      searchParams.append('offset', offset.toString());

      if (queryParams.category) searchParams.append('category', queryParams.category);
      if (queryParams.price) searchParams.append('price', queryParams.price);
      if (queryParams.q) searchParams.append('q', queryParams.q);
      if (queryParams.dietary) searchParams.append('dietary', queryParams.dietary);
      // Add sort parameter
      if (queryParams.sort) searchParams.append('sort', queryParams.sort);

      const response = await fetch(`/api/products?${searchParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.products.length, 0);
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Flatten all pages into single array
  const products = data?.pages.flatMap(page => page.products) || [];

  // Fetch categories for filtering
  const {
    data: categories,
    isLoading: categoriesLoading
  } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  return (
    <Layout>
      <Helmet>
        <title>Products | Probashi Bakery</title>
        <meta name="description" content="Browse our delicious selection of freshly baked goods including cakes, pastries, cookies, and artisan breads." />
        <meta property="og:title" content="Products | Probashi Bakery" />
        <meta property="og:description" content="Browse our delicious selection of freshly baked goods including cakes, pastries, cookies, and artisan breads." />
      </Helmet>

      <section className="py-20 bg-neutral">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary mb-4">Our Products</h1>
            {/* <p className="text-text-dark max-w-2xl mx-auto">
              Browse our delicious selection of freshly baked goods made with love and the finest ingredients.
            </p> */}
          </div>

          <div>
            <ProductGrid
              products={products}
              isLoading={productsLoading}
              error={productsError}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              queryParams={queryParams}
              setQueryParams={setQueryParams}
              categories={categories || []}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
