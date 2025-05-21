import { useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { CheckCircle, ChevronRight, ShoppingBag } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const OrderConfirmation = () => {
  const [_, setLocation] = useLocation();

  // Redirect if accessed directly without placing an order
  useEffect(() => {
    const hasPlacedOrder = sessionStorage.getItem("order_placed");
    if (!hasPlacedOrder) {
      setLocation("/");
    } else {
      // Set flag that will be cleared when component unmounts
      sessionStorage.setItem("order_placed", "true");
      return () => {
        sessionStorage.removeItem("order_placed");
      };
    }
  }, [setLocation]);

  const orderNumber = `SB-${Math.floor(100000 + Math.random() * 900000)}`;
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);
  
  const formattedDeliveryDate = estimatedDelivery.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Layout>
      <Helmet>
        <title>Order Confirmation | SweetBite Bakery</title>
        <meta name="description" content="Thank you for your order at SweetBite Bakery." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="container mx-auto px-4 py-20 flex flex-col items-center">
        <div className="max-w-2xl w-full">
          <Card className="border-success">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
                  <CheckCircle className="text-success h-10 w-10" />
                </div>
                <h1 className="font-heading text-3xl font-bold text-primary mb-2">Order Confirmed!</h1>
                <p className="text-text-dark">
                  Thank you for your order. We've received your order and will begin processing it right away.
                </p>
              </div>

              <div className="bg-neutral rounded-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-text-dark text-sm">Order Number:</span>
                  <span className="font-semibold">{orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-dark text-sm">Estimated Delivery:</span>
                  <span className="font-semibold">{formattedDeliveryDate}</span>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-6 mb-8">
                <h2 className="font-heading text-xl font-bold text-primary mb-4">What happens next?</h2>
                <ul className="space-y-4">
                  <li className="flex">
                    <div className="mr-4 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold">Order Processing</h3>
                      <p className="text-sm text-text-dark">
                        We're preparing your order in our bakery with the freshest ingredients.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="mr-4 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold">Ready for Pickup/Delivery</h3>
                      <p className="text-sm text-text-dark">
                        You'll receive a notification when your order is ready for pickup or out for delivery.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="mr-4 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold">Enjoy Your Sweet Treats!</h3>
                      <p className="text-sm text-text-dark">
                        Savor the delicious flavors of your SweetBite bakery items.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => setLocation("/")}
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  Return to Home
                </Button>
                <Button 
                  className="bg-primary text-white hover:bg-opacity-90"
                  onClick={() => setLocation("/products")}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
