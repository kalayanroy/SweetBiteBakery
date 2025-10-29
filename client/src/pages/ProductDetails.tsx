import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Helmet } from "react-helmet";
import { ShoppingCart, ChevronRight, Tag, Shield, TruckIcon, Check } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/hooks/use-cart";
import { ProductWithCategory } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const ProductDetails = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  const { data: product, isLoading, error } = useQuery<ProductWithCategory>({
    queryKey: [`/api/products/${slug}`],
    enabled: !!slug,
  });

  // Set default selections when product data loads
  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0]);
      }
    }
  }, [product, selectedSize, selectedColor]);

  const handleAddToCart = () => {
    if (product) {
      // Check if size is required but not selected
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        toast({
          title: "Please select a size",
          description: "You must choose a size before adding to cart.",
          variant: "destructive",
        });
        return;
      }

      // Check if color is required but not selected
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        toast({
          title: "Please select a color",
          description: "You must choose a color before adding to cart.",
          variant: "destructive",
        });
        return;
      }

      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }

      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse">
            <div className="flex flex-wrap">
              <div className="w-full md:w-1/2 pr-0 md:pr-8 mb-8 md:mb-0">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-8"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full mb-6"></div>
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
          <h2 className="text-2xl font-bold text-text-dark dark:text-white mb-4">
            Product not found
          </h2>
          <p className="mb-8 dark:text-gray-300">Sorry, we couldn't find the product you're looking for.</p>
          <Link href="/products">
            <Button className="bg-primary text-white" data-testid="button-back-to-products">Back to Products</Button>
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
          <nav className="flex text-sm text-gray-500 dark:text-gray-400">
            <Link href="/">
              <a className="hover:text-primary" data-testid="link-breadcrumb-home">Home</a>
            </Link>
            <ChevronRight className="mx-2 h-4 w-4" />
            <Link href="/products">
              <a className="hover:text-primary" data-testid="link-breadcrumb-products">Products</a>
            </Link>
            <ChevronRight className="mx-2 h-4 w-4" />
            <Link href={`/products?category=${product.category.slug}`}>
              <a className="hover:text-primary" data-testid="link-breadcrumb-category">{product.category.name}</a>
            </Link>
            <ChevronRight className="mx-2 h-4 w-4" />
            <span className="text-text-dark dark:text-white" data-testid="text-breadcrumb-product">{product.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="sticky top-8">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-800">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-auto object-cover" 
                  style={{ maxHeight: "600px" }}
                  data-testid="img-product"
                />
                {product.isBestseller && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-accent text-primary px-3 py-1 text-sm font-semibold shadow-lg" data-testid="badge-bestseller">
                      ⭐ Bestseller
                    </Badge>
                  </div>
                )}
                {product.isNew && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-500 text-white px-3 py-1 text-sm font-semibold shadow-lg" data-testid="badge-new">
                      🎉 New
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Title & Category */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-primary" data-testid="badge-category">{product.category.name}</Badge>
                {product.isPopular && (
                  <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" data-testid="badge-popular">
                    🔥 Popular
                  </Badge>
                )}
              </div>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary dark:text-primary mb-3" data-testid="text-product-name">
                {product.name}
              </h1>
              {Array.isArray(product.dietaryOptions) && product.dietaryOptions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(product.dietaryOptions as string[]).map((option, index) => (
                    <Badge key={index} className="bg-neutral text-primary" data-testid={`badge-dietary-${index}`}>
                      {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-4 rounded-xl shadow-lg inline-block">
              <span className="text-sm opacity-90 block mb-1">Price</span>
              <span className="font-heading text-3xl md:text-4xl font-bold" data-testid="text-product-price">{formatCurrency(product.price)}</span>
            </div>

            {/* Description */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-2 text-text-dark dark:text-white">About this product</h3>
              <p className="text-text-dark dark:text-gray-300 leading-relaxed" data-testid="text-product-description">{product.description}</p>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <label className="font-semibold text-text-dark dark:text-white block">
                  Select Size <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-3 rounded-lg border-2 font-semibold transition-all duration-200 ${
                        selectedSize === size
                          ? "border-primary bg-primary text-white shadow-lg transform scale-105"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text-dark dark:text-white hover:border-primary hover:shadow-md"
                      }`}
                      data-testid={`button-size-${index}`}
                    >
                      {selectedSize === size && <Check className="inline mr-1" size={16} />}
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <label className="font-semibold text-text-dark dark:text-white block">
                  Select Color <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`px-5 py-3 rounded-lg border-2 font-semibold transition-all duration-200 ${
                        selectedColor === color
                          ? "border-primary bg-primary text-white shadow-lg transform scale-105"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-text-dark dark:text-white hover:border-primary hover:shadow-md"
                      }`}
                      data-testid={`button-color-${index}`}
                    >
                      {selectedColor === color && <Check className="inline mr-1" size={16} />}
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700">
                <Tag className="text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" size={24} />
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">Premium Quality</span>
              </div>
              <div className="flex items-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-700">
                <Shield className="text-green-600 dark:text-green-400 mr-3 flex-shrink-0" size={24} />
                <span className="text-sm font-semibold text-green-900 dark:text-green-200">100% Guarantee</span>
              </div>
              <div className="flex items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-700">
                <TruckIcon className="text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0" size={24} />
                <span className="text-sm font-semibold text-purple-900 dark:text-purple-200">Fast Delivery</span>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-text-dark dark:text-white text-lg">Quantity:</span>
                <div className="flex items-center border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button 
                    className="px-4 py-2 text-lg font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-text-dark dark:text-white transition-colors" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    data-testid="button-decrease-quantity"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 text-lg font-semibold bg-white dark:bg-gray-800 text-text-dark dark:text-white min-w-[60px] text-center" data-testid="text-quantity">{quantity}</span>
                  <button 
                    className="px-4 py-2 text-lg font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-text-dark dark:text-white transition-colors" 
                    onClick={() => setQuantity(quantity + 1)}
                    data-testid="button-increase-quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-white py-6 px-8 rounded-xl hover:shadow-xl transition-all text-lg font-semibold transform hover:scale-[1.02]"
                onClick={handleAddToCart}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="mr-2" size={22} />
                Add to Cart - {formatCurrency(product.price * quantity)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
