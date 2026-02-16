import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { CartProvider } from "@/hooks/use-cart";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/CheckoutWithPathao";
import OrderConfirmation from "@/pages/OrderConfirmation";
import OrderTracking from "@/pages/OrderTracking";
import AboutUs from "@/pages/AboutUs";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminProducts from "@/pages/AdminProducts";
import AdminProductForm from "@/pages/AdminProductForm";
import AdminOrders from "@/pages/AdminOrders";
import AdminCustomers from "@/pages/AdminCustomers";
import AdminUsers from "@/pages/AdminUsers";
import AdminSettings from "@/pages/AdminSettings";
import AdminPOS from "@/pages/AdminPOS";
import AdminInventory from "@/pages/AdminInventory";
import AdminSuppliers from "@/pages/AdminSuppliers";
import AdminPurchases from "@/pages/AdminPurchases";
import AdminPurchaseForm from "@/pages/AdminPurchaseForm";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import UserPanel from "@/pages/UserPanel";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminReports from "@/pages/admin/AdminReports";

import HomeVariant1 from "@/pages/HomeVariant1";
import HomeVariant2 from "@/pages/HomeVariant2";
import HomeVariant3 from "@/pages/HomeVariant3";
import HomeVariant4 from "@/pages/HomeVariant4";
import TermsPage from "@/pages/TermsPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import RefundPolicyPage from "@/pages/RefundPolicyPage";
import DeliveryInfoPage from "@/pages/DeliveryInfoPage";
import ReturnPolicyPage from "@/pages/ReturnPolicyPage";
import FAQPage from "@/pages/FAQPage";
import { ScrollToTop } from "@/components/ScrollToTop";

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={Home} />
        {/* Design Variants Preview Routes */}
        <Route path="/v1" component={HomeVariant1} />
        <Route path="/v2" component={HomeVariant2} />
        <Route path="/v3" component={HomeVariant3} />
        <Route path="/v4" component={HomeVariant4} />

        <Route path="/products" component={Products} />
        <Route path="/products/:slug" component={ProductDetails} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/order-confirmation" component={OrderConfirmation} />
        <Route path="/order-tracking" component={OrderTracking} />
        <Route path="/about" component={AboutUs} />
        <Route path="/contact" component={Contact} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/refund-policy" component={RefundPolicyPage} />
        <Route path="/delivery" component={DeliveryInfoPage} />
        <Route path="/return-policy" component={ReturnPolicyPage} />
        <Route path="/faq" component={FAQPage} />

        {/* User Authentication Routes */}
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/user-panel" component={UserPanel} />

        {/* Admin Routes */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/products/new" component={AdminProductForm} />
        <Route path="/admin/products/edit/:id" component={AdminProductForm} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/customers" component={AdminCustomers} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/customers" component={AdminCustomers} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/pos" component={AdminPOS} />
        <Route path="/admin/suppliers" component={AdminSuppliers} />
        <Route path="/admin/purchases" component={AdminPurchases} />
        <Route path="/admin/purchases/new" component={AdminPurchaseForm} />
        <Route path="/admin/purchases/:id" component={AdminPurchaseForm} />
        <Route path="/admin/inventory" component={AdminInventory} />
        <Route path="/admin/reports" component={AdminReports} />

        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
