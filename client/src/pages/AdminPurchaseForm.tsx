import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Supplier, Product, InsertPurchase, InsertPurchaseItem } from "@shared/schema";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Save, ArrowLeft, Search } from "lucide-react";
import { z } from "zod";

// Helper type for form items
type FormItem = {
    productId: number;
    productName: string;
    quantity: number;
    unitCost: number;
    subtotal: number;
};

export default function AdminPurchaseForm() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Form State
    const [supplierId, setSupplierId] = useState<string>("");
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState("pending");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<FormItem[]>([]);

    // Item adding state
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [itemQuantity, setItemQuantity] = useState(1);
    const [itemCost, setItemCost] = useState(0);

    // Queries
    const { data: suppliers = [] } = useQuery<Supplier[]>({
        queryKey: ["/api/admin/suppliers"],
    });

    const { data: productsData } = useQuery({
        queryKey: ["/api/products"],
    });

    const products = (Array.isArray(productsData) ? productsData : (productsData as any)?.products || []) as Product[];

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/admin/purchases", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/purchases"] });
            queryClient.invalidateQueries({ queryKey: ["/api/products"] }); // Stock updated
            toast({ title: "Purchase invoice created successfully" });
            setLocation("/admin/purchases");
        },
        onError: (error: Error) => {
            toast({ title: "Failed to create invoice", description: error.message, variant: "destructive" });
        },
    });

    // Handlers
    const handleAddItem = () => {
        if (!selectedProductId) return;

        const product = products.find(p => p.id === parseInt(selectedProductId));
        if (!product) return;

        const newItem: FormItem = {
            productId: product.id,
            productName: product.name,
            quantity: itemQuantity,
            unitCost: itemCost,
            subtotal: itemQuantity * itemCost
        };

        setItems([...items, newItem]);

        // Reset item inputs
        setSelectedProductId("");
        setItemQuantity(1);
        setItemCost(0);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplierId || !invoiceNumber || items.length === 0) {
            toast({ title: "Validation Error", description: "Please fill all required fields and add items.", variant: "destructive" });
            return;
        }

        const payload = {
            supplierId: parseInt(supplierId),
            invoiceNumber,
            date: new Date(date).toISOString(),
            status,
            notes,
            totalAmount: calculateTotal(),
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitCost: item.unitCost,
                subtotal: item.subtotal
            }))
        };

        createMutation.mutate(payload);
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>New Purchase Invoice | SweetBite Admin</title>
            </Helmet>

            <div className="flex items-center mb-6 px-6 pt-6 gap-4">
                <Link href="/admin/purchases">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">New Purchase Invoice</h1>
            </div>

            <form onSubmit={handleSubmit} className="px-6 mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Invoice Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Supplier <span className="text-red-500">*</span></label>
                                <Select value={supplierId} onValueChange={setSupplierId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Supplier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Invoice Number <span className="text-red-500">*</span></label>
                                <Input
                                    value={invoiceNumber}
                                    onChange={e => setInvoiceNumber(e.target.value)}
                                    placeholder="e.g. INV-2024-001"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date <span className="text-red-500">*</span></label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="received">Received (Updates Stock)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500">
                                    Selecting <strong>Received</strong> will automatically increase product stock.
                                </p>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium">Notes</label>
                                <Textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Additional notes about this purchase..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Add Item Form */}
                            <div className="flex flex-col md:flex-row gap-4 items-end mb-6 p-4 bg-gray-50 rounded-lg border">
                                <div className="flex-1 space-y-2 w-full">
                                    <label className="text-sm font-medium">Product</label>
                                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => (
                                                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-24 space-y-2">
                                    <label className="text-sm font-medium">Qty</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={itemQuantity}
                                        onChange={e => setItemQuantity(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="w-32 space-y-2">
                                    <label className="text-sm font-medium">Unit Cost</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={itemCost}
                                        onChange={e => setItemCost(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <Button type="button" onClick={handleAddItem} disabled={!selectedProductId}>
                                    <Plus className="h-4 w-4" /> Add
                                </Button>
                            </div>

                            {/* Items Table */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-center">Qty</TableHead>
                                        <TableHead className="text-right">Unit Cost</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                No items added yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.productName}</TableCell>
                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                <TableCell className="text-right">৳{item.unitCost.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-bold">৳{item.subtotal.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Summary */}
                <div className="space-y-6">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total Amount:</span>
                                <span className="text-primary text-2xl">৳{calculateTotal().toFixed(2)}</span>
                            </div>
                            <div className="pt-4 border-t">
                                <Button type="submit" className="w-full" size="lg" disabled={createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Invoice
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </AdminLayout>
    );
}
