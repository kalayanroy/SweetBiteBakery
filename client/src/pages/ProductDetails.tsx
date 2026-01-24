import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Helmet } from "react-helmet";
import {
  ShoppingCart, ChevronRight, Award, Heart, Clock,
  Leaf, Shield, Truck, ChefHat, Sparkles, Star,
  ZoomIn, Share2, Facebook, Twitter, MessageCircle,
  Package, Thermometer, Check, Minus, Plus, X, Users, TrendingUp
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const { data: product, isLoading, error } = useQuery<ProductWithCategory>({
    queryKey: [`/api/products/${slug}`],
    enabled: !!slug,
  });

  const { data: storeSettings } = useQuery({
    queryKey: ['/api/settings/store'],
    queryFn: async () => {
      const res = await fetch('/api/settings/store');
      if (!res.ok) return {};
      return res.json();
    }
  });

  const freeDeliveryThreshold = storeSettings?.freeDeliveryThreshold && !isNaN(Number(storeSettings.freeDeliveryThreshold))
    ? Number(storeSettings.freeDeliveryThreshold)
    : 1000;

  const allImages = product ? [
    product.image,
    ...(Array.isArray(product.images) ? product.images : [])
  ].filter(img => img && img.trim() !== "") : [];

  const getCurrentPrice = (): number => {
    if (!product) return 0;
    const variations = product.priceVariations as Record<string, number> || {};

    // 1. Check for specific Size + Color combination first (most specific)
    if (selectedSize && selectedColor) {
      const key = `${selectedSize}-${selectedColor}`;
      if (variations[key]) return variations[key];
    }

    // 2. Check for Size only pricing
    if (selectedSize && variations[selectedSize]) {
      return variations[selectedSize];
    }

    return product.price;
  };

  const currentPrice = getCurrentPrice();

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
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        toast({
          title: "🍰 Size Selection Required",
          description: "Please choose your preferred size before adding to basket.",
          variant: "destructive",
        });
        return;
      }

      if (product.colors && product.colors.length > 0 && !selectedColor) {
        toast({
          title: "🎨 Color Selection Required",
          description: "Please choose your preferred color before adding to basket.",
          variant: "destructive",
        });
        return;
      }

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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "💔 Removed from Favorites" : "❤️ Added to Favorites",
      description: isFavorite ? "Product removed from your wishlist" : "Product saved to your wishlist",
    });
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${product?.name} at Probashi Bakery!`;
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    };
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const mockReviews = [
    { id: 1, name: "Sarah Ahmed", rating: 5, comment: "Absolutely delicious! The cake was fresh and beautifully decorated.", date: "2024-12-05", avatar: "S" },
    { id: 2, name: "John Doe", rating: 5, comment: "Best bakery in town! Will definitely order again.", date: "2024-12-03", avatar: "J" },
    { id: 3, name: "Ayesha Khan", rating: 4, comment: "Great taste and quality. Delivery was on time.", date: "2024-12-01", avatar: "A" },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--cream))] via-white to-[hsl(var(--vanilla))] dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-20">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 bg-gray-200 dark:bg-gray-700 rounded-2xl h-96"></div>
                <div className="lg:col-span-3 space-y-4">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
        <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--cream))] via-white to-[hsl(var(--vanilla))] dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center px-4">
            <ChefHat className="w-20 h-20 mx-auto text-[hsl(var(--cinnamon))] opacity-50 mb-4" />
            <h2 className="text-2xl font-bold text-[hsl(var(--chocolate))] dark:text-white mb-3">Product Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Oops! This delicious treat seems to have been sold out.</p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-[hsl(var(--cinnamon))] to-[hsl(var(--chocolate))] text-white hover:opacity-90">
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
        <title>{product.name} | Probashi Bakery</title>
        <meta name="description" content={product.description} />
      </Helmet>

      {/* Full Screen Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={allImages[currentImageIndex] || product.image}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--cream))] via-white to-[hsl(var(--vanilla))] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Breadcrumb */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-b border-[hsl(var(--blush))]/20 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center text-sm space-x-2">
              <Link href="/"><a className="text-[hsl(var(--cinnamon))] hover:underline font-medium">Home</a></Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link href="/products"><a className="text-[hsl(var(--cinnamon))] hover:underline font-medium">Products</a></Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-[hsl(var(--chocolate))] dark:text-gray-300 font-semibold truncate">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Image Gallery with Vertical Thumbnails - 2 columns */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 flex gap-4">
                {/* Vertical Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex flex-col gap-3 w-20">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative rounded-lg overflow-hidden transition-all duration-300 ${index === currentImageIndex
                          ? "ring-2 ring-[hsl(var(--cinnamon))] ring-offset-2 shadow-lg scale-105"
                          : "hover:scale-105 opacity-60 hover:opacity-100"
                          }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} view ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                        {index === currentImageIndex && (
                          <div className="absolute inset-0 border-2 border-[hsl(var(--cinnamon))] pointer-events-none"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Image */}
                <div className="flex-1">
                  <div className="relative group rounded-2xl overflow-hidden bg-gradient-to-br from-white to-[hsl(var(--vanilla))] p-4 shadow-xl">
                    {/* Special Badges */}
                    {(product.isBestseller || product.isNew || product.isPopular) && (
                      <div className="absolute top-6 right-6 z-10">
                        {product.isBestseller && (
                          <Badge className="bg-gradient-to-r from-[hsl(var(--honey))] to-[hsl(var(--cinnamon))] text-white border-none shadow-lg animate-pulse">
                            <Award className="w-3 h-3 mr-1" /> Bestseller
                          </Badge>
                        )}
                        {product.isNew && (
                          <Badge className="bg-gradient-to-r from-[hsl(var(--pistachio))] to-green-400 text-white border-none shadow-lg">
                            <Sparkles className="w-3 h-3 mr-1" /> New
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Favorite & Zoom Buttons */}
                    <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                      <button
                        onClick={toggleFavorite}
                        className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:scale-110 transition-all duration-300 hover:bg-white"
                      >
                        <Heart className={`w-5 h-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-[hsl(var(--cinnamon))]"}`} />
                      </button>
                      <button
                        onClick={() => setShowImageModal(true)}
                        className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:scale-110 transition-all duration-300 hover:bg-white"
                      >
                        <ZoomIn className="w-5 h-5 text-[hsl(var(--cinnamon))]" />
                      </button>
                    </div>

                    <img
                      src={allImages[currentImageIndex] || product.image}
                      alt={product.name}
                      className="w-full aspect-square object-cover rounded-xl cursor-pointer transition-transform duration-700 hover:scale-105"
                      onClick={() => setShowImageModal(true)}
                    />
                  </div>

                  {/* Artisan Seal */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-[hsl(var(--cinnamon))] bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm py-2 px-4 rounded-full">
                    <ChefHat className="w-4 h-4" />
                    <span className="text-xs font-semibold">Handcrafted by Our Bakers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info - 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              {/* Category & Dietary */}
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-gradient-to-r from-[hsl(var(--blush))] to-pink-200 text-[hsl(var(--chocolate))] border-none px-3 py-1 shadow-sm">
                  <Package className="w-3 h-3 mr-1" />
                  {product.category.name}
                </Badge>
                {Array.isArray(product.dietaryOptions) && product.dietaryOptions.length > 0 && (
                  (product.dietaryOptions as string[]).map((option, index) => (
                    <Badge key={index} className="bg-gradient-to-r from-[hsl(var(--pistachio))] to-green-200 text-[hsl(var(--chocolate))] border-none shadow-sm">
                      <Leaf className="w-3 h-3 mr-1" />
                      {option.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}
                    </Badge>
                  ))
                )}
              </div>

              {/* Title */}
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[hsl(var(--chocolate))] dark:text-white leading-tight">
                {product.name}
              </h1>

              {/* Rating & Quick Stats */}
              <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-[hsl(var(--blush))]/30">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[hsl(var(--honey))] fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-[hsl(var(--chocolate))] dark:text-white">4.9</span>
                  <span className="text-sm text-gray-500">(128 reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-[hsl(var(--honey))]" />
                  <span className="font-semibold text-[hsl(var(--chocolate))] dark:text-white">1.2k+</span>
                  <span className="text-gray-500">sold</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-[hsl(var(--honey))]" />
                  <span className="font-semibold text-[hsl(var(--chocolate))] dark:text-white">Top 10</span>
                  <span className="text-gray-500">this week</span>
                </div>
              </div>

              {/* Price Card */}
              <div className="bg-gradient-to-br from-[hsl(var(--honey))]/20 via-[hsl(var(--cinnamon))]/10 to-transparent rounded-2xl p-6 border-2 border-[hsl(var(--honey))]/30 shadow-lg">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price</p>
                    <span className="text-4xl font-bold bg-gradient-to-r from-[hsl(var(--cinnamon))] to-[hsl(var(--chocolate))] bg-clip-text text-transparent font-heading">
                      {formatCurrency(currentPrice)}
                    </span>
                  </div>
                  {(selectedSize || selectedColor) && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Selected</p>
                      <p className="text-sm font-semibold text-[hsl(var(--chocolate))] dark:text-white">
                        {[selectedSize, selectedColor].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-[hsl(var(--chocolate))] dark:text-white flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[hsl(var(--honey))] rounded-full"></div>
                    Choose Size
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${selectedSize === size
                          ? "bg-gradient-to-r from-[hsl(var(--cinnamon))] to-[hsl(var(--chocolate))] text-white shadow-lg scale-105"
                          : "bg-white dark:bg-gray-700 border-2 border-[hsl(var(--blush))] text-[hsl(var(--chocolate))] dark:text-white hover:border-[hsl(var(--cinnamon))] hover:scale-105"
                          }`}
                      >
                        {size}
                        {selectedSize === size && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--pistachio))] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[hsl(var(--pistachio))]"></span>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-[hsl(var(--chocolate))] dark:text-white flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[hsl(var(--honey))] rounded-full"></div>
                    Choose Color
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${selectedColor === color
                          ? "bg-gradient-to-r from-[hsl(var(--cinnamon))] to-[hsl(var(--chocolate))] text-white shadow-lg scale-105"
                          : "bg-white dark:bg-gray-700 border-2 border-[hsl(var(--blush))] text-[hsl(var(--chocolate))] dark:text-white hover:border-[hsl(var(--cinnamon))] hover:scale-105"
                          }`}
                      >
                        {color}
                        {selectedColor === color && (
                          <Check className="absolute -top-1 -right-1 w-4 h-4 text-[hsl(var(--pistachio))] bg-white rounded-full p-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="bg-gradient-to-br from-white to-[hsl(var(--vanilla))] dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-lg border border-[hsl(var(--blush))]/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-[hsl(var(--chocolate))] dark:text-white">Quantity</span>
                  <div className="flex items-center bg-white dark:bg-gray-600 border-2 border-[hsl(var(--honey))]/30 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-[hsl(var(--cream))] dark:hover:bg-gray-500 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-[hsl(var(--cinnamon))]" />
                    </button>
                    <span className="px-8 py-2 font-bold text-lg text-[hsl(var(--chocolate))] dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-[hsl(var(--cream))] dark:hover:bg-gray-500 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-[hsl(var(--cinnamon))]" />
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-[hsl(var(--cinnamon))] via-[hsl(var(--chocolate))] to-[hsl(var(--cinnamon))] hover:opacity-90 text-white py-6 text-lg font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Basket • {formatCurrency(currentPrice * quantity)}
                </Button>

                <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-3 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-[hsl(var(--honey))]" />
                  Free delivery on orders over BDT {freeDeliveryThreshold}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="group text-center p-4 bg-gradient-to-br from-white to-[hsl(var(--cream))] dark:from-gray-800 dark:to-gray-700 rounded-xl border border-[hsl(var(--blush))]/20 hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-[hsl(var(--honey))] group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-[hsl(var(--chocolate))] dark:text-white">Fresh Daily</p>
                </div>
                <div className="group text-center p-4 bg-gradient-to-br from-white to-[hsl(var(--cream))] dark:from-gray-800 dark:to-gray-700 rounded-xl border border-[hsl(var(--blush))]/20 hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-[hsl(var(--honey))] group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-[hsl(var(--chocolate))] dark:text-white">Guaranteed</p>
                </div>
                <div className="group text-center p-4 bg-gradient-to-br from-white to-[hsl(var(--cream))] dark:from-gray-800 dark:to-gray-700 rounded-xl border border-[hsl(var(--blush))]/20 hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <Truck className="w-6 h-6 mx-auto mb-2 text-[hsl(var(--honey))] group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-[hsl(var(--chocolate))] dark:text-white">Fast Delivery</p>
                </div>
              </div>

              {/* Share */}
              <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--blush))]/30">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Share this product
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleShare('facebook')} className="p-2.5 rounded-full bg-blue-500 text-white hover:scale-110 transition-transform shadow-lg">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleShare('twitter')} className="p-2.5 rounded-full bg-sky-400 text-white hover:scale-110 transition-transform shadow-lg">
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleShare('whatsapp')} className="p-2.5 rounded-full bg-green-500 text-white hover:scale-110 transition-transform shadow-lg">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-12 bg-gradient-to-br from-white to-[hsl(var(--vanilla))] dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-xl border border-[hsl(var(--blush))]/20">
            <h2 className="text-2xl font-bold text-[hsl(var(--chocolate))] dark:text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[hsl(var(--honey))] to-[hsl(var(--cinnamon))] rounded-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              About This Product
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
              {product.description}
            </p>
          </div>

          {/* Product Details */}
          <div className="mt-8 bg-gradient-to-br from-white to-[hsl(var(--vanilla))] dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-xl border border-[hsl(var(--blush))]/20">
            <h2 className="text-2xl font-bold text-[hsl(var(--chocolate))] dark:text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[hsl(var(--honey))] to-[hsl(var(--cinnamon))] rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              Product Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl">
                <div className="p-3 bg-gradient-to-br from-[hsl(var(--blush))] to-pink-200 rounded-lg">
                  <Package className="w-5 h-5 text-[hsl(var(--chocolate))]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                  <p className="font-bold text-[hsl(var(--chocolate))] dark:text-white">{product.category.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl">
                <div className="p-3 bg-gradient-to-br from-[hsl(var(--blush))] to-pink-200 rounded-lg">
                  <Thermometer className="w-5 h-5 text-[hsl(var(--chocolate))]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Storage</p>
                  <p className="font-bold text-[hsl(var(--chocolate))] dark:text-white">Refrigerate</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl">
                <div className="p-3 bg-gradient-to-br from-[hsl(var(--blush))] to-pink-200 rounded-lg">
                  <Clock className="w-5 h-5 text-[hsl(var(--chocolate))]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Shelf Life</p>
                  <p className="font-bold text-[hsl(var(--chocolate))] dark:text-white">2-3 Days</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl">
                <div className="p-3 bg-gradient-to-br from-[hsl(var(--blush))] to-pink-200 rounded-lg">
                  <ChefHat className="w-5 h-5 text-[hsl(var(--chocolate))]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Made With</p>
                  <p className="font-bold text-[hsl(var(--chocolate))] dark:text-white">Premium Ingredients</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="mt-8 mb-12 bg-gradient-to-br from-white to-[hsl(var(--vanilla))] dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-xl border border-[hsl(var(--blush))]/20">
            <h2 className="text-2xl font-bold text-[hsl(var(--chocolate))] dark:text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[hsl(var(--honey))] to-[hsl(var(--cinnamon))] rounded-lg">
                <Star className="w-5 h-5 text-white fill-current" />
              </div>
              Customer Reviews ({mockReviews.length})
            </h2>
            <div className="space-y-4">
              {mockReviews.map((review) => (
                <div key={review.id} className="p-6 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-xl border border-[hsl(var(--blush))]/20 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--honey))] to-[hsl(var(--cinnamon))] flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg">
                      {review.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-[hsl(var(--chocolate))] dark:text-white">{review.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{review.date}</p>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-[hsl(var(--honey))] fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
