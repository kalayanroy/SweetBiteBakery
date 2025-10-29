import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Helmet } from "react-helmet";
import { 
  ShoppingCart, ChevronRight, Award, Heart, Clock, 
  Leaf, Shield, Truck, ChefHat, Sparkles, Star, ChevronLeft
} from "lucide-react";
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: product, isLoading, error } = useQuery<ProductWithCategory>({
    queryKey: [`/api/products/${slug}`],
    enabled: !!slug,
  });

  // Get all images (primary + additional)
  const allImages = product ? [
    product.image,
    ...(Array.isArray(product.images) ? product.images : [])
  ].filter(img => img && img.trim() !== "") : [];

  // Calculate current price based on size and color
  const getCurrentPrice = (): number => {
    if (!product) return 0;
    
    // If both size and color are selected and variations exist
    if (selectedSize && selectedColor && product.priceVariations) {
      const key = `${selectedSize}-${selectedColor}`;
      const variations = product.priceVariations as Record<string, number>;
      if (variations[key]) {
        return variations[key];
      }
    }
    
    // Return base price
    return product.price;
  };

  const currentPrice = getCurrentPrice();

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
          title: "🍰 Size Selection Required",
          description: "Please choose your preferred size before adding to basket.",
          variant: "destructive",
        });
        return;
      }

      // Check if color is required but not selected
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        toast({
          title: "🎨 Color Selection Required",
          description: "Please choose your preferred color before adding to basket.",
          variant: "destructive",
        });
        return;
      }

      // Add to cart with selected variant information
      for (let i = 0; i < quantity; i++) {
        addToCart(product, {
          size: selectedSize || undefined,
          color: selectedColor || undefined,
          price: currentPrice,
        });
      }

      toast({
        title: "✨ Added to Your Basket!",
        description: `${product.name} is ready for checkout. Fresh & delicious!`,
      });
    }
  };

  // Navigate to previous image
  const previousImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  // Navigate to next image
  const nextImage = () => {
    setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--cream))] to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-20">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-3xl h-[500px]"></div>
                <div className="space-y-6">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
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
        <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--cream))] to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="mb-6">
              <ChefHat className="w-24 h-24 mx-auto text-[hsl(var(--cinnamon))] opacity-50" />
            </div>
            <h2 className="text-3xl font-bold text-[hsl(var(--chocolate))] dark:text-white mb-4">
              Product Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Oops! This delicious treat seems to have been sold out.
            </p>
            <Link href="/products">
              <Button className="bg-[hsl(var(--cinnamon))] text-white hover:bg-[hsl(var(--chocolate))]" data-testid="button-back-to-products">
                Browse Our Bakery
              </Button>
            </Link>
          </div>
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

      {/* Hero Section with Warm Background */}
      <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--cream))] via-white to-[hsl(var(--vanilla))] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm mb-8 space-x-2" data-testid="breadcrumb">
            <Link href="/">
              <a className="text-[hsl(var(--cinnamon))] hover:text-[hsl(var(--chocolate))] transition-colors" data-testid="link-breadcrumb-home">
                Home
              </a>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/products">
              <a className="text-[hsl(var(--cinnamon))] hover:text-[hsl(var(--chocolate))] transition-colors" data-testid="link-breadcrumb-products">
                Products
              </a>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/products?category=${product.category.slug}`}>
              <a className="text-[hsl(var(--cinnamon))] hover:text-[hsl(var(--chocolate))] transition-colors" data-testid="link-breadcrumb-category">
                {product.category.name}
              </a>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-[hsl(var(--chocolate))] dark:text-gray-300 font-medium" data-testid="text-breadcrumb-product">
              {product.name}
            </span>
          </nav>

          {/* Main Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Image Gallery */}
            <div className="relative group">
              <div className="sticky top-8">
                {/* Artisan Badge */}
                {(product.isBestseller || product.isNew || product.isPopular) && (
                  <div className="absolute -top-4 -right-4 z-10">
                    <div className="relative">
                      <div className="bg-[hsl(var(--honey))] text-white rounded-full p-4 shadow-2xl border-4 border-white dark:border-gray-800 transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
                        {product.isBestseller && <Award className="w-8 h-8" />}
                        {product.isNew && <Sparkles className="w-8 h-8" />}
                        {product.isPopular && <Star className="w-8 h-8" fill="currentColor" />}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <Badge className="bg-white text-[hsl(var(--chocolate))] border-2 border-[hsl(var(--honey))] shadow-lg text-xs font-bold" data-testid="badge-special">
                          {product.isBestseller && "Bestseller"}
                          {product.isNew && "New"}
                          {product.isPopular && "Popular"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Image with Navigation */}
                <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white dark:bg-gray-800 border-8 border-white dark:border-gray-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--cream))]/20 to-transparent pointer-events-none"></div>
                  <img 
                    src={allImages[currentImageIndex] || product.image} 
                    alt={product.name} 
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" 
                    style={{ minHeight: "400px", maxHeight: "600px" }}
                    data-testid="img-product"
                  />
                  
                  {/* Image Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={previousImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                        data-testid="button-prev-image"
                      >
                        <ChevronLeft className="w-6 h-6 text-[hsl(var(--cinnamon))]" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                        data-testid="button-next-image"
                      >
                        <ChevronRight className="w-6 h-6 text-[hsl(var(--cinnamon))]" />
                      </button>
                    </>
                  )}
                  
                  {/* Image Indicator Dots */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {allImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex 
                              ? "bg-[hsl(var(--cinnamon))] w-8" 
                              : "bg-white/60 hover:bg-white/80"
                          }`}
                          data-testid={`button-image-dot-${index}`}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Decorative Corner */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-white/40 to-transparent"></div>
                </div>

                {/* Image Thumbnails */}
                {allImages.length > 1 && (
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {allImages.slice(0, 4).map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative overflow-hidden rounded-xl border-4 transition-all ${
                          index === currentImageIndex
                            ? "border-[hsl(var(--cinnamon))] scale-105"
                            : "border-white dark:border-gray-700 hover:border-[hsl(var(--honey))]"
                        }`}
                        data-testid={`button-thumbnail-${index}`}
                      >
                        <img 
                          src={img} 
                          alt={`${product.name} ${index + 1}`} 
                          className="w-full h-20 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Chef's Seal */}
                <div className="mt-6 flex items-center justify-center space-x-2 text-[hsl(var(--cinnamon))]">
                  <ChefHat className="w-5 h-5" />
                  <span className="text-sm font-semibold">Handcrafted by Our Bakers</span>
                </div>
              </div>
            </div>

            {/* Product Details Section */}
            <div className="space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-[hsl(var(--pistachio))] text-[hsl(var(--chocolate))] border-none" data-testid="badge-category">
                    {product.category.name}
                  </Badge>
                  {Array.isArray(product.dietaryOptions) && product.dietaryOptions.length > 0 && (
                    (product.dietaryOptions as string[]).map((option, index) => (
                      <Badge key={index} className="bg-[hsl(var(--blush))] text-[hsl(var(--chocolate))] border-none" data-testid={`badge-dietary-${index}`}>
                        <Leaf className="w-3 h-3 mr-1" />
                        {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
                      </Badge>
                    ))
                  )}
                </div>

                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-[hsl(var(--chocolate))] dark:text-white mb-4 leading-tight" data-testid="text-product-name">
                  {product.name}
                </h1>

                {/* Dynamic Price Display */}
                <div className="inline-block relative">
                  <div className="bg-gradient-to-r from-[hsl(var(--honey))] to-[hsl(var(--cinnamon))] text-white px-8 py-4 rounded-2xl shadow-xl">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-bold font-heading" data-testid="text-product-price">
                        {formatCurrency(currentPrice)}
                      </span>
                    </div>
                    {selectedSize && selectedColor && currentPrice !== product.price && (
                      <p className="text-xs text-white/80 mt-1">
                        for {selectedSize} · {selectedColor}
                      </p>
                    )}
                  </div>
                  {/* Decorative Element */}
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[hsl(var(--blush))] rounded-full -z-10"></div>
                </div>
              </div>

              {/* Storytelling Card */}
              <div className="bg-gradient-to-br from-[hsl(var(--vanilla))] to-white dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl border-2 border-[hsl(var(--blush))] shadow-lg">
                <div className="flex items-start gap-3 mb-3">
                  <Heart className="w-5 h-5 text-[hsl(var(--cinnamon))] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[hsl(var(--chocolate))] dark:text-white mb-2">
                      Our Story
                    </h3>
                    <p className="text-[hsl(var(--chocolate))]/80 dark:text-gray-300 leading-relaxed" data-testid="text-product-description">
                      {product.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 font-heading text-lg font-bold text-[hsl(var(--chocolate))] dark:text-white">
                    <div className="w-2 h-2 bg-[hsl(var(--honey))] rounded-full"></div>
                    Choose Your Size
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {product.sizes.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`group relative px-4 py-4 rounded-xl border-2 font-semibold transition-all duration-200 ${
                          selectedSize === size
                            ? "border-[hsl(var(--cinnamon))] bg-[hsl(var(--cinnamon))] text-white shadow-xl transform scale-105"
                            : "border-[hsl(var(--blush))] bg-white dark:bg-gray-800 text-[hsl(var(--chocolate))] dark:text-white hover:border-[hsl(var(--honey))] hover:shadow-lg"
                        }`}
                        data-testid={`button-size-${index}`}
                      >
                        {size}
                        {selectedSize === size && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[hsl(var(--pistachio))] rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 font-heading text-lg font-bold text-[hsl(var(--chocolate))] dark:text-white">
                    <div className="w-2 h-2 bg-[hsl(var(--honey))] rounded-full"></div>
                    Choose Your Color
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`group relative px-4 py-4 rounded-xl border-2 font-semibold transition-all duration-200 ${
                          selectedColor === color
                            ? "border-[hsl(var(--cinnamon))] bg-[hsl(var(--cinnamon))] text-white shadow-xl transform scale-105"
                            : "border-[hsl(var(--blush))] bg-white dark:bg-gray-800 text-[hsl(var(--chocolate))] dark:text-white hover:border-[hsl(var(--honey))] hover:shadow-lg"
                        }`}
                        data-testid={`button-color-${index}`}
                      >
                        {color}
                        {selectedColor === color && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[hsl(var(--pistachio))] rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Badges */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-[hsl(var(--cream))] dark:border-gray-700 hover:border-[hsl(var(--honey))] transition-colors">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--honey))]" />
                  <p className="text-xs font-semibold text-[hsl(var(--chocolate))] dark:text-white">Baked Fresh Daily</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-[hsl(var(--cream))] dark:border-gray-700 hover:border-[hsl(var(--honey))] transition-colors">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--honey))]" />
                  <p className="text-xs font-semibold text-[hsl(var(--chocolate))] dark:text-white">Quality Guaranteed</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-[hsl(var(--cream))] dark:border-gray-700 hover:border-[hsl(var(--honey))] transition-colors">
                  <Truck className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--honey))]" />
                  <p className="text-xs font-semibold text-[hsl(var(--chocolate))] dark:text-white">Fast Delivery</p>
                </div>
              </div>

              {/* Action Tray - Quantity & Add to Cart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-4 border-[hsl(var(--blush))] shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-heading text-lg font-bold text-[hsl(var(--chocolate))] dark:text-white">
                    Quantity
                  </label>
                  <div className="flex items-center border-2 border-[hsl(var(--honey))] rounded-full overflow-hidden bg-[hsl(var(--cream))] dark:bg-gray-700">
                    <button 
                      className="px-5 py-2 text-xl font-bold bg-[hsl(var(--honey))] text-white hover:bg-[hsl(var(--cinnamon))] transition-colors" 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      data-testid="button-decrease-quantity"
                    >
                      −
                    </button>
                    <span className="px-8 py-2 text-xl font-bold text-[hsl(var(--chocolate))] dark:text-white" data-testid="text-quantity">
                      {quantity}
                    </span>
                    <button 
                      className="px-5 py-2 text-xl font-bold bg-[hsl(var(--honey))] text-white hover:bg-[hsl(var(--cinnamon))] transition-colors" 
                      onClick={() => setQuantity(quantity + 1)}
                      data-testid="button-increase-quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-[hsl(var(--cinnamon))] to-[hsl(var(--chocolate))] text-white py-7 px-8 rounded-2xl hover:shadow-2xl transition-all text-lg font-bold transform hover:scale-105 active:scale-95"
                  onClick={handleAddToCart}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="mr-3" size={24} />
                  Add to Basket · {formatCurrency(currentPrice * quantity)}
                </Button>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Free delivery on orders over BDT 1000
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
