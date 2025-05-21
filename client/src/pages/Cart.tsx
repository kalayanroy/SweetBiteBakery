import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { ShoppingCart, X, AlertTriangle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Cart = () => {
  const { cart, removeFromCart, updateCartItemQuantity } = useCart();

  return (
    <Layout>
      <Helmet>
        <title>Your Cart | SweetBite Bakery</title>
        <meta name="description" content="View and manage your shopping cart at SweetBite Bakery." />
      </Helmet>

      <div className="container mx-auto px-4 py-20">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-8 text-center">Your Shopping Cart</h1>

        {cart.items.length === 0 ? (
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-8">
              <div className="text-center">
                <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-heading font-bold text-primary mb-2">Your cart is empty</h2>
                <p className="text-text-dark mb-6">Looks like you haven't added any products to your cart yet.</p>
                <Link href="/products">
                  <Button className="bg-primary text-white hover:bg-opacity-90">
                    Browse Products
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col-reverse lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <Card>
                <CardContent className="p-6">
                  <div className="hidden md:grid grid-cols-6 gap-4 mb-4 font-semibold text-text-dark">
                    <div className="col-span-3">Product</div>
                    <div className="text-center">Price</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-right">Total</div>
                  </div>

                  {cart.items.map((item) => (
                    <div key={item.productId} className="border-b border-gray-200 last:border-b-0 py-4">
                      <div className="md:grid md:grid-cols-6 md:gap-4 md:items-center">
                        {/* Product */}
                        <div className="flex items-center col-span-3 mb-3 md:mb-0">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-20 h-20 object-cover rounded-md mr-4"
                          />
                          <div>
                            <Link href={`/products/${item.productId}`}>
                              <a className="font-semibold text-primary hover:underline">{item.name}</a>
                            </Link>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="flex justify-between items-center md:block md:text-center mb-2 md:mb-0">
                          <span className="md:hidden">Price:</span>
                          <span>{formatCurrency(item.price)}</span>
                        </div>
                        
                        {/* Quantity */}
                        <div className="flex justify-between items-center md:justify-center mb-2 md:mb-0">
                          <span className="md:hidden">Quantity:</span>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button 
                              className="px-2 py-1 text-sm"
                              onClick={() => updateCartItemQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            >
                              -
                            </button>
                            <span className="px-3 py-1 border-l border-r border-gray-300 text-sm">
                              {item.quantity}
                            </span>
                            <button 
                              className="px-2 py-1 text-sm"
                              onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        {/* Total & Remove */}
                        <div className="flex justify-between items-center md:text-right">
                          <span className="md:hidden">Total:</span>
                          <div>
                            <div className="font-semibold">{formatCurrency(item.price * item.quantity)}</div>
                            <button 
                              className="text-gray-400 hover:text-error flex items-center text-sm mt-1"
                              onClick={() => removeFromCart(item.productId)}
                            >
                              <X size={14} className="mr-1" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-heading text-xl font-bold text-primary mb-4">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold">{formatCurrency(cart.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Estimated Total</span>
                      <span>{formatCurrency(cart.subtotal)}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="bg-neutral p-3 rounded-md flex items-start">
                      <AlertTriangle className="text-primary mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <p className="text-sm">
                        Shipping, taxes, and discounts will be calculated at checkout. 
                        Orders are usually processed within 24 hours.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Link href="/checkout">
                      <Button className="w-full bg-success text-white hover:bg-opacity-90">
                        Proceed to Checkout
                      </Button>
                    </Link>
                    <Link href="/products">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
