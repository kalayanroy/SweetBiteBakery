import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import {
    usePathaoCities,
    usePathaoZones,
    usePathaoAreas,
    usePathaoStores,
    calculatePathaoPrice,
    createPathaoOrder
} from "@/hooks/use-pathao";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import Layout from "@/components/layout/Layout";
import { formatCurrency } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    CreditCard,
    BanknoteIcon,
    CheckCircle,
    CreditCard as CardIcon,
    Truck,
    Loader2,
    MapPin
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Extend order schema with validation rules for Bangladesh
const checkoutFormSchema = insertOrderSchema.extend({
    customerName: z.string().min(2, "Name must be at least 2 characters"),
    customerEmail: z.string().email("Please enter a valid email address"),
    customerPhone: z.string().min(11, "Please enter a valid Bangladeshi phone number (11 digits)"),
    address: z.string().min(10, "Please enter your complete address"),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
        message: "You must agree to the Terms, Privacy Policy, and Refund Policy",
    }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const CheckoutWithPathao = () => {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { cart, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pathao integration state
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
    const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
    const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
    const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

    // Fetch Pathao data
    const { data: cities, isLoading: loadingCities } = usePathaoCities();
    const { data: zones, isLoading: loadingZones } = usePathaoZones(selectedCityId);
    const { data: areas, isLoading: loadingAreas } = usePathaoAreas(selectedZoneId);
    const { data: stores } = usePathaoStores();

    // Get default store ID
    const defaultStoreId = stores?.[0]?.store_id;

    // Redirect if cart is empty
    if (cart.items.length === 0) {
        setLocation("/cart");
    }

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutFormSchema),
        defaultValues: {
            customerName: "",
            customerEmail: "",
            customerPhone: "+880",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            paymentMethod: "cash",
            total: cart.subtotal,
            acceptTerms: false,
        }
    });

    // Calculate delivery charge when zone is selected
    useEffect(() => {
        const calculateDelivery = async () => {
            if (!selectedCityId || !selectedZoneId || !defaultStoreId) {
                setDeliveryCharge(0);
                return;
            }

            setIsCalculatingPrice(true);
            try {
                // Estimate weight based on cart items (0.5kg per item)
                const estimatedWeight = cart.items.reduce((sum, item) => sum + (item.quantity * 0.5), 0);

                const pricing = await calculatePathaoPrice({
                    storeId: defaultStoreId,
                    recipientCity: selectedCityId,
                    recipientZone: selectedZoneId,
                    deliveryType: "normal",
                    itemType: "parcel",
                    itemWeight: Math.max(estimatedWeight, 0.5), // Minimum 0.5kg
                });

                setDeliveryCharge(pricing.total_price);

                toast({
                    title: "✅ Delivery Charge Calculated",
                    description: `Delivery fee: ${formatCurrency(pricing.total_price)}`,
                });
            } catch (error) {
                console.error("Failed to calculate delivery:", error);
                toast({
                    title: "⚠️ Could not calculate delivery",
                    description: "Using standard delivery charge of ৳60",
                    variant: "destructive",
                });
                setDeliveryCharge(60); // Fallback charge
            } finally {
                setIsCalculatingPrice(false);
            }
        };

        calculateDelivery();
    }, [selectedCityId, selectedZoneId, defaultStoreId, cart.items, toast]);

    const onSubmit = async (data: CheckoutFormValues) => {
        if (cart.items.length === 0) {
            toast({
                title: "Cart is empty",
                description: "Please add some products to your cart before checking out.",
                variant: "destructive"
            });
            return;
        }

        // Validate Pathao location selection
        if (!selectedCityId || !selectedZoneId || !selectedAreaId) {
            toast({
                title: "📍 Location Required",
                description: "Please select your delivery location (City, Zone, Area)",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Get selected location names for storage
            const selectedCity = cities?.find(c => c.city_id === selectedCityId);
            const selectedZone = zones?.find(z => z.zone_id === selectedZoneId);
            const selectedArea = areas?.find(a => a.area_id === selectedAreaId);

            // Step 1: Create order in our database
            const orderData = {
                ...data,
                city: selectedCity?.city_name || "",
                state: selectedZone?.zone_name || "",
                zipCode: selectedArea?.post_code || "",
                total: cart.subtotal + deliveryCharge, // Include delivery charge
                items: cart.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity
                }))
            };

            const response = await apiRequest("POST", "/api/orders", orderData);
            const result = await response.json();
            const orderId = result.order.id;

            // Step 2: Create Pathao courier order (for Cash on Delivery)
            if (defaultStoreId && data.paymentMethod === "cash") {
                try {
                    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
                    const estimatedWeight = cart.items.reduce((sum, item) => sum + (item.quantity * 0.5), 0);
                    const itemsList = cart.items.map(item => item.name).join(", ");

                    const pathaoOrder = await createPathaoOrder({
                        storeId: defaultStoreId,
                        merchantOrderId: `SBB-${orderId}`,
                        recipientName: data.customerName,
                        recipientPhone: data.customerPhone.replace(/\s/g, ""),
                        recipientAddress: data.address,
                        recipientCity: selectedCityId,
                        recipientZone: selectedZoneId,
                        recipientArea: selectedAreaId,
                        deliveryType: "normal",
                        itemType: "parcel",
                        itemQuantity: totalItems,
                        itemWeight: Math.max(estimatedWeight, 0.5),
                        itemDescription: `Bakery Items: ${itemsList.substring(0, 100)}`,
                        amountToCollect: cart.subtotal, // COD amount
                        specialInstruction: "🍰 Handle with care - Fresh bakery items. Keep upright.",
                    });

                    console.log("Pathao order created:", pathaoOrder);

                    toast({
                        title: "🚚 Delivery Scheduled!",
                        description: `Pathao tracking ID: ${pathaoOrder.data.consignment_id}`,
                    });
                } catch (pathaoError: any) {
                    console.error("Pathao order failed:", pathaoError);
                    // Continue anyway - order is placed, just delivery scheduling failed
                    toast({
                        title: "⚠️ Delivery scheduling pending",
                        description: "Order confirmed! We'll arrange delivery manually.",
                    });
                }
            }

            toast({
                title: "🎉 Order placed successfully!",
                description: "Thank you for your order. You will receive a confirmation shortly.",
            });

            // Store order details for confirmation page
            sessionStorage.setItem("order_placed", "true");
            sessionStorage.setItem("order_id", orderId.toString());
            sessionStorage.setItem("order_email", data.customerEmail);

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
                <title>Checkout | Probashi Bakery</title>
                <meta name="description" content="Complete your order at Probashi Bakery with Pathao courier delivery." />
            </Helmet>

            <div className="container mx-auto px-4 py-20">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
                    Checkout
                </h1>

                <div className="flex flex-col-reverse lg:flex-row gap-8">
                    {/* Checkout Form */}
                    <div className="lg:w-2/3">
                        <Card>
                            <CardContent className="p-6">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        {/* Contact Information */}
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
                                                                <Input placeholder="+880 171 234 5678" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Delivery Location with Pathao */}
                                        <div>
                                            <h2 className="font-heading text-xl font-bold text-primary mb-4 flex items-center">
                                                <Truck className="mr-2" size={20} /> Delivery Location
                                            </h2>

                                            <div className="grid grid-cols-1 gap-4">
                                                {/* Complete Address */}
                                                <FormField
                                                    control={form.control}
                                                    name="address"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Complete Address (House/Road/Landmark)</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="House 12, Road 5, Dhanmondi"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* City Selection */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium flex items-center gap-2">
                                                        <MapPin size={16} />
                                                        City *
                                                    </label>
                                                    {loadingCities ? (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 p-3 border rounded-md">
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Loading cities from Pathao...
                                                        </div>
                                                    ) : (
                                                        <Select
                                                            value={selectedCityId?.toString()}
                                                            onValueChange={(value) => {
                                                                setSelectedCityId(parseInt(value));
                                                                setSelectedZoneId(null);
                                                                setSelectedAreaId(null);
                                                                setDeliveryCharge(0);
                                                            }}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select your city" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {cities?.map((city) => (
                                                                    <SelectItem key={city.city_id} value={city.city_id.toString()}>
                                                                        📍 {city.city_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </div>

                                                {/* Zone Selection */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Zone/Thana *</label>
                                                    {selectedCityId && loadingZones ? (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 p-3 border rounded-md">
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Loading zones...
                                                        </div>
                                                    ) : (
                                                        <Select
                                                            value={selectedZoneId?.toString()}
                                                            onValueChange={(value) => {
                                                                setSelectedZoneId(parseInt(value));
                                                                setSelectedAreaId(null);
                                                            }}
                                                            disabled={!selectedCityId}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder={!selectedCityId ? "Select city first" : "Select your zone"} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {zones?.map((zone) => (
                                                                    <SelectItem key={zone.zone_id} value={zone.zone_id.toString()}>
                                                                        {zone.zone_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </div>

                                                {/* Area Selection */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Specific Area *</label>
                                                    {selectedZoneId && loadingAreas ? (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 p-3 border rounded-md">
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Loading areas...
                                                        </div>
                                                    ) : (
                                                        <Select
                                                            value={selectedAreaId?.toString()}
                                                            onValueChange={(value) => setSelectedAreaId(parseInt(value))}
                                                            disabled={!selectedZoneId}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder={!selectedZoneId ? "Select zone first" : "Select your area"} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {areas?.map((area) => (
                                                                    <SelectItem key={area.area_id} value={area.area_id.toString()}>
                                                                        {area.area_name} {area.post_code ? `(${area.post_code})` : ''}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </div>

                                                {/* Delivery Charge Indicator */}
                                                {isCalculatingPrice && (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                                        <span className="text-sm text-blue-800">Calculating delivery charge...</span>
                                                    </div>
                                                )}

                                                {deliveryCharge > 0 && !isCalculatingPrice && (
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                            <span className="text-sm text-green-800 font-medium">Delivery charge calculated</span>
                                                        </div>
                                                        <span className="text-green-900 font-bold">{formatCurrency(deliveryCharge)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Payment Method */}
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
                                                                            <div className="text-sm text-gray-500">Pay when you receive your order via Pathao</div>
                                                                        </div>
                                                                    </label>
                                                                </div>
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="acceptTerms"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-4">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>
                                                                I agree to the{" "}
                                                                <a href="/terms" target="_blank" className="text-primary hover:underline">Terms & Conditions</a>,{" "}
                                                                <a href="/privacy-policy" target="_blank" className="text-primary hover:underline">Privacy Policy</a>, and{" "}
                                                                <a href="/refund-policy" target="_blank" className="text-primary hover:underline">Return & Refund Policy</a>.
                                                            </FormLabel>
                                                            <FormMessage />
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                className="w-full bg-success hover:bg-success/90 text-white py-6 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                                disabled={isSubmitting || isCalculatingPrice}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Processing Order...
                                                    </>
                                                ) : (
                                                    <>
                                                        Place Order <CheckCircle size={20} />
                                                    </>
                                                )}
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

                                {/* Store Notice */}
                                {!defaultStoreId && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-yellow-800 font-medium flex items-center gap-2">
                                            <Truck size={16} />
                                            ⚠️ No store configured
                                        </p>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Please create a store in Pathao merchant panel to enable automated delivery.
                                        </p>
                                    </div>
                                )}

                                {/* Cart Items */}
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

                                {/* Pricing Summary */}
                                <div className="space-y-4 pt-3 border-t border-gray-200">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">{formatCurrency(cart.subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-2">
                                            <Truck size={16} className="text-primary" />
                                            Delivery Charge
                                            {isCalculatingPrice && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                                        </span>
                                        <span className="font-semibold text-primary">
                                            {deliveryCharge > 0 ? formatCurrency(deliveryCharge) : "Select location"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                                        <span>Total</span>
                                        <span className="text-primary">{formatCurrency(cart.subtotal + deliveryCharge)}</span>
                                    </div>
                                </div>

                                {/* Info Notice */}
                                <div className="mt-6">
                                    <div className="bg-neutral p-3 rounded-md flex items-start">
                                        <CreditCard className="text-primary mr-2 mt-0.5 flex-shrink-0" size={18} />
                                        <p className="text-sm">
                                            Your order will be delivered via <strong>Pathao Courier</strong>.
                                            You'll receive tracking information via email and SMS.
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

export default CheckoutWithPathao;
