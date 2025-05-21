import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { insertOrderSchema, type InsertOrder } from "@shared/schema";
import { z } from "zod";
import Layout from "@/components/layout/Layout";
import { formatCurrency } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CreditCard, BanknoteIcon, CheckCircle, CreditCard as CardIcon } from "lucide-react";

// Extend order schema with validation rules
const checkoutFormSchema = insertOrderSchema.extend({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const Checkout = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { cart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if cart is empty
  if (cart.items.length === 0) {
    setLocation("/cart");
  }

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      paymentMethod: "credit-card",
      total: cart.subtotal
    }
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    if (cart.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some products to your cart before checking out.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare order with items
      const orderData = {
        ...data,
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        }))
      };
      
      const response = await apiRequest("POST", "/api/orders", orderData);
      const result = await response.json();
      
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your order. You will receive a confirmation shortly.",
      });
      
      // Clear cart and redirect to confirmation page
      clearCart();
      setLocation("/order-confirmation");
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error placing order",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Checkout | SweetBite Bakery</title>
        <meta name="description" content="Complete your order at SweetBite Bakery." />
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-8 text-center">Checkout</h1>

        <div className="flex flex-col-reverse lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="lg:w-2/3">
            <Card>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-primary mb-4 flex items-center">
                        <CheckCircle className="mr-2" size={20} /> Contact Information
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h2 className="font-heading text-xl font-bold text-primary mb-4 flex items-center">
                        <CheckCircle className="mr-2" size={20} /> Shipping Address
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main Street" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input placeholder="NY" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="10001" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h2 className="font-heading text-xl font-bold text-primary mb-4 flex items-center">
                        <CheckCircle className="mr-2" size={20} /> Payment Method
                      </h2>
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-3"
                              >
                                <div className="flex items-center space-x-2 border border-gray-200 p-3 rounded-md cursor-pointer hover:border-primary">
                                  <RadioGroupItem value="credit-card" id="payment-cc" />
                                  <label htmlFor="payment-cc" className="flex items-center cursor-pointer w-full">
                                    <CardIcon className="mr-2 text-primary" />
                                    <div>
                                      <div className="font-semibold">Credit/Debit Card</div>
                                      <div className="text-sm text-gray-500">Pay securely with your card</div>
                                    </div>
                                  </label>
                                </div>
                                
                                <div className="flex items-center space-x-2 border border-gray-200 p-3 rounded-md cursor-pointer hover:border-primary">
                                  <RadioGroupItem value="cash" id="payment-cash" />
                                  <label htmlFor="payment-cash" className="flex items-center cursor-pointer w-full">
                                    <BanknoteIcon className="mr-2 text-primary" />
                                    <div>
                                      <div className="font-semibold">Cash on Delivery</div>
                                      <div className="text-sm text-gray-500">Pay when you receive your order</div>
                                    </div>
                                  </label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full bg-success text-white hover:bg-opacity-90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Processing..." : "Place Order"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-heading text-xl font-bold text-primary mb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.quantity} × {formatCurrency(item.price)}</p>
                        </div>
                      </div>
                      <div className="font-semibold">{formatCurrency(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4 pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatCurrency(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatCurrency(cart.subtotal)}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="bg-neutral p-3 rounded-md flex items-start">
                    <CreditCard className="text-primary mr-2 mt-0.5 flex-shrink-0" size={18} />
                    <p className="text-sm">
                      This is a simulation. No actual payment will be processed.
                      Your order details will be saved for demonstration purposes only.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
