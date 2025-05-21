import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Helmet } from "react-helmet";
import { ShoppingCart, ChevronRight, Tag, Shield, TruckIcon } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/hooks/use-cart";
import { ProductWithCategory } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ProductDetails = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery<ProductWithCategory>({
    queryKey: [`/api/products/${slug}`],
    enabled: !!slug,
  });

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse">
            <div className="flex flex-wrap">
              <div className="w-full md:w-1/2 pr-0 md:pr-8 mb-8 md:mb-0">
                <div className="bg-gray-200 rounded-lg h-96"></div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
                <div className="h-12 bg-gray-200 rounded w-full mb-6"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-text-dark mb-4">
            Product not found
          </h2>
          <p className="mb-8">Sorry, we couldn't find the product you're looking for.</p>
          <Link href="/products">
            <Button className="bg-primary text-white">Back to Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{product.name} | SweetBite Bakery</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={`${product.name} | SweetBite Bakery`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
      </Helmet>

      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex text-sm text-gray-500">
            <Link href="/">
              <a className="hover:text-primary">Home</a>
            </Link>
            <ChevronRight className="mx-2 h-4 w-4" />
            <Link href="/products">
              <a className="hover:text-primary">Products</a>
            </Link>
            <ChevronRight className="mx-2 h-4 w-4" />
            <Link href={`/products?category=${product.category.slug}`}>
              <a className="hover:text-primary">{product.category.name}</a>
            </Link>
            <ChevronRight className="mx-2 h-4 w-4" />
            <span className="text-text-dark">{product.name}</span>
          </nav>
        </div>

        <div className="flex flex-wrap">
          {/* Product Image */}
          <div className="w-full md:w-1/2 pr-0 md:pr-8 mb-8 md:mb-0">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full rounded-lg shadow-lg object-cover" 
              style={{ maxHeight: "500px" }}
            />
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2">
            <div className="flex flex-wrap items-start mb-2">
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2 mr-3">
                {product.name}
              </h1>
              {product.isBestseller && (
                <Badge className="bg-accent text-primary">Bestseller</Badge>
              )}
              {product.isNew && (
                <Badge className="bg-accent text-primary">New</Badge>
              )}
              {product.isPopular && (
                <Badge className="bg-accent text-primary">Popular</Badge>
              )}
            </div>

            <div className="flex items-center mb-6">
              <div className="bg-primary text-white px-3 py-1 rounded-md">
                <span className="font-heading text-xl font-bold">{formatCurrency(product.price)}</span>
              </div>
              <div className="flex ml-4">
                <Badge className="bg-secondary text-primary">{product.category.name}</Badge>
                {Array.isArray(product.dietaryOptions) && (product.dietaryOptions as string[]).map((option, index) => (
                  <Badge key={index} className="bg-neutral text-primary ml-2">
                    {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-text-dark mb-6">{product.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center p-3 bg-neutral rounded-md">
                  <Tag className="text-primary mr-2" size={20} />
                  <span className="text-sm font-semibold">Premium Quality</span>
                </div>
                <div className="flex items-center p-3 bg-neutral rounded-md">
                  <Shield className="text-primary mr-2" size={20} />
                  <span className="text-sm font-semibold">Satisfaction Guarantee</span>
                </div>
                <div className="flex items-center p-3 bg-neutral rounded-md">
                  <TruckIcon className="text-primary mr-2" size={20} />
                  <span className="text-sm font-semibold">Fast Delivery</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center">
                <span className="mr-4 font-semibold">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button 
                    className="px-3 py-1 text-lg font-bold" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border-l border-r border-gray-300">{quantity}</span>
                  <button 
                    className="px-3 py-1 text-lg font-bold" 
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <Button
              className="w-full md:w-auto bg-primary text-white py-3 px-6 rounded-full hover:bg-opacity-90 transition-all"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2" size={18} />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
