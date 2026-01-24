import { useState } from "react";
import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Package,
    MapPin,
    CreditCard,
    Calendar,
    Search,
    CheckCircle,
    Clock,
    Truck,
    Home,
    Mail,
    Phone,
    ShoppingBag,
    AlertCircle,
    PackageCheck,
    PackageX,
    User
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Modern status configuration
const statusConfig = {
    pending: {
        color: "bg-amber-500",
        bgLight: "bg-amber-50",
        textColor: "text-amber-700",
        borderColor: "border-amber-300",
        icon: Clock,
        label: "Pending"
    },
    processing: {
        color: "bg-blue-500",
        bgLight: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-300",
        icon: Package,
        label: "Processing"
    },
    shipped: {
        color: "bg-purple-500",
        bgLight: "bg-purple-50",
        textColor: "text-purple-700",
        borderColor: "border-purple-300",
        icon: Truck,
        label: "Shipped"
    },
    delivered: {
        color: "bg-green-500",
        bgLight: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-300",
        icon: PackageCheck,
        label: "Delivered"
    },
    cancelled: {
        color: "bg-red-500",
        bgLight: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-300",
        icon: PackageX,
        label: "Cancelled"
    }
};

// Status timeline steps
const getStatusSteps = (currentStatus: string) => {
    const steps = [
        { status: 'pending', label: 'Placed', icon: CheckCircle },
        { status: 'processing', label: 'Processing', icon: Clock },
        { status: 'shipped', label: 'Shipped', icon: Truck },
        { status: 'delivered', label: 'Delivered', icon: Home },
    ];

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus.toLowerCase());

    return steps.map((step, index) => ({
        ...step,
        completed: index <= currentIndex,
        active: index === currentIndex,
    }));
};

export default function OrderTracking() {
    const [orderId, setOrderId] = useState("");
    const [email, setEmail] = useState("");
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleTrackOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setOrder(null);

        if (!orderId || !email) {
            setError("Please enter both Order ID and Email");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`/api/orders/track?orderId=${orderId}&email=${encodeURIComponent(email)}`);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Order not found");
            }

            const data = await response.json();
            setOrder(data);
        } catch (err: any) {
            setError(err.message || "Failed to track order. Please check your Order ID and Email.");
        } finally {
            setIsLoading(false);
        }
    };

    const statusSteps = order ? getStatusSteps(order.status) : [];
    const currentStatusConfig = order ? statusConfig[order.status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending : null;
    const StatusIcon = currentStatusConfig?.icon;

    // Calculate totals
    const subtotal = order?.items?.reduce((sum: number, item: any) => sum + (item.subtotal || item.price * item.quantity), 0) || 0;
    const deliveryFee = (order?.total || 0) - subtotal;

    return (
        <Layout>
            <Helmet>
                <title>Order Tracking | SweetBite Bakery</title>
                <meta name="description" content="Track your order from SweetBite Bakery" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-b from-neutral to-white">
                <div className="container mx-auto px-4 py-6 md:py-24 max-w-7xl">
                    {/* Compact Header - Closer to Navbar */}
                    <div className="text-center mb-6">
                        <h1 className="font-heading text-5xl md:text-6xl font-bold text-primary mb-6">
                            Track Your Order
                        </h1>
                        <p className="text-gray-600">
                            Enter your order details to check delivery status
                        </p>
                    </div>

                    {/* Compact Search Form */}
                    <div className="max-w-3xl mx-auto mb-8">
                        <Card className="shadow-sm border-gray-200">
                            <CardContent className="p-6">
                                <form onSubmit={handleTrackOrder} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Order ID</label>
                                            <Input
                                                type="text"
                                                placeholder="e.g., 123"
                                                value={orderId}
                                                onChange={(e) => setOrderId(e.target.value)}
                                                className="h-11"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                                            <Input
                                                type="email"
                                                placeholder="your@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-11"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                            <p className="text-red-800 text-sm">{error}</p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full h-11 bg-primary hover:bg-primary/90 transition-colors"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Tracking...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="h-4 w-4 mr-2" />
                                                Track Order
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Details - Compact Layout */}
                    {order && (
                        <div className="max-w-7xl mx-auto space-y-6">
                            {/* Status Card - Compact */}
                            <Card className="shadow-sm border-gray-200">
                                <div className={`h-1.5 ${currentStatusConfig?.color}`}></div>
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            {StatusIcon && (
                                                <div className={`w-12 h-12 rounded-lg ${currentStatusConfig?.bgLight} flex items-center justify-center`}>
                                                    <StatusIcon className={`w-6 h-6 ${currentStatusConfig?.textColor}`} />
                                                </div>
                                            )}
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
                                                <div className="flex items-center gap-1.5 text-gray-600 text-sm mt-0.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>
                                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge
                                            className={`${currentStatusConfig?.bgLight} ${currentStatusConfig?.textColor} ${currentStatusConfig?.borderColor} border px-4 py-1.5 font-semibold capitalize w-fit`}
                                        >
                                            {currentStatusConfig?.label}
                                        </Badge>
                                    </div>

                                    {/* Compact Timeline */}
                                    <div className="relative pt-2">
                                        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"></div>
                                        <div
                                            className={`absolute top-6 left-0 h-0.5 ${currentStatusConfig?.color} transition-all duration-1000`}
                                            style={{
                                                width: `${(statusSteps.filter(s => s.completed).length - 1) / (statusSteps.length - 1) * 100}%`
                                            }}
                                        ></div>

                                        <div className="relative flex justify-between">
                                            {statusSteps.map((step) => {
                                                const Icon = step.icon;
                                                return (
                                                    <div key={step.status} className="flex flex-col items-center">
                                                        <div
                                                            className={`w-12 h-12 rounded-full flex items-center justify-center border-3 mb-2 transition-all z-10 ${step.completed
                                                                ? `${currentStatusConfig?.color} border-white text-white shadow-md`
                                                                : 'bg-white border-gray-300 text-gray-400'
                                                                } ${step.active ? 'ring-3 ring-primary/20' : ''}`}
                                                        >
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <p className={`text-xs font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                                                            {step.label}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Main Content Grid - 3 Columns */}
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Left Column - Order Items (Takes 2 columns) */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Compact Order Items Table */}
                                    <Card className="shadow-sm border-gray-200">
                                        <CardHeader className="pb-3 px-6 pt-5">
                                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                <Package className="h-5 w-5 text-primary" />
                                                Order Items ({order.items?.length || 0})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-6 pb-5">
                                            <div className="space-y-2">
                                                {order.items?.map((item: any, index: number) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        {/* Compact Image */}
                                                        <div className="w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-white border border-gray-200">
                                                            {item.productImage ? (
                                                                <img
                                                                    src={item.productImage}
                                                                    alt={item.productName}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                    <Package className="h-6 w-6 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Product Info - Compact */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-sm text-gray-900 truncate">
                                                                {item.productName || `Product #${item.productId}`}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                {formatCurrency(item.price)} × {item.quantity}
                                                            </p>
                                                        </div>

                                                        {/* Price - Compact */}
                                                        <div className="text-right">
                                                            <p className="font-bold text-sm text-gray-900">
                                                                {formatCurrency(item.subtotal || item.price * item.quantity)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Delivery Address - Compact */}
                                    <Card className="shadow-sm border-gray-200">
                                        <CardHeader className="pb-3 px-6 pt-5">
                                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-primary" />
                                                Delivery Address
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-6 pb-5">
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-sm text-gray-900">{order.customerName}</p>
                                                        <p className="text-sm text-gray-600 mt-0.5">{order.address}</p>
                                                        <p className="text-sm text-gray-600">{order.city}, {order.state} {order.zipCode}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <p className="text-sm text-gray-900">{order.customerPhone}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Column - Payment Summary */}
                                <div className="lg:col-span-1">
                                    <Card className="shadow-sm border-gray-200 sticky top-4">
                                        <CardHeader className="pb-3 px-6 pt-5">
                                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                <CreditCard className="h-5 w-5 text-secondary" />
                                                Payment
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-6 pb-5">
                                            <div className="space-y-3">
                                                {/* Payment Method */}
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                                                    <p className="font-semibold text-sm text-gray-900 capitalize">
                                                        {order.paymentMethod === 'cash' ? 'Cash on Delivery' : order.paymentMethod}
                                                    </p>
                                                </div>

                                                {/* Price Breakdown */}
                                                <div className="space-y-2 pt-2">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600">Subtotal</span>
                                                        <span className="font-medium text-gray-900">
                                                            {formatCurrency(subtotal)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600">Delivery Fee</span>
                                                        <span className="font-medium text-gray-900">
                                                            {formatCurrency(deliveryFee)}
                                                        </span>
                                                    </div>
                                                    <div className="border-t border-gray-200 pt-2 mt-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold text-gray-900">Total</span>
                                                            <span className="text-xl font-bold text-primary">
                                                                {formatCurrency(order.total || 0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Support - Compact */}
                                    <Card className="shadow-sm border-gray-200 mt-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                                        <CardContent className="p-5">
                                            <h3 className="font-bold text-sm mb-3 text-gray-900">Need Help?</h3>
                                            <div className="space-y-2">
                                                <a
                                                    href="mailto:info@sweetbitebakery.com"
                                                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                    <span>info@sweetbitebakery.com</span>
                                                </a>
                                                <a
                                                    href="tel:+8801234567890"
                                                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors"
                                                >
                                                    <Phone className="w-4 h-4" />
                                                    <span>+880 1234-567890</span>
                                                </a>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
