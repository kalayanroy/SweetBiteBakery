import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Supplier, Purchase } from "@shared/schema";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Plus, FileText, Eye } from "lucide-react";

export default function AdminPurchases() {
    const [searchTerm, setSearchTerm] = useState("");

    const { data: purchases = [], isLoading: purchasesLoading } = useQuery<Purchase[]>({
        queryKey: ["/api/admin/purchases"],
    });

    const { data: suppliers = [], isLoading: suppliersLoading } = useQuery<Supplier[]>({
        queryKey: ["/api/admin/suppliers"],
    });

    const getSupplierName = (id: number) => {
        return suppliers.find(s => s.id === id)?.name || "Unknown Supplier";
    };

    const filteredPurchases = purchases.filter((purchase) => {
        const supplierName = getSupplierName(purchase.supplierId).toLowerCase();
        const invoice = purchase.invoiceNumber.toLowerCase();
        const search = searchTerm.toLowerCase();
        return supplierName.includes(search) || invoice.includes(search);
    });

    return (
        <AdminLayout>
            <Helmet>
                <title>Purchase Invoices | SweetBite Admin</title>
            </Helmet>

            <div className="flex justify-between items-center mb-6 px-6 pt-6">
                <h1 className="text-3xl font-bold text-gray-800">Purchase Invoices</h1>
                <Link href="/admin/purchases/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Purchase Invoice
                    </Button>
                </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6 mx-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search by Invoice # or Supplier..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden mx-6 mb-8">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchasesLoading || suppliersLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredPurchases.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    No invoices found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPurchases.map((purchase) => (
                                <TableRow key={purchase.id}>
                                    <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{purchase.invoiceNumber}</TableCell>
                                    <TableCell>{getSupplierName(purchase.supplierId)}</TableCell>
                                    <TableCell>৳{purchase.totalAmount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={purchase.status === "received" ? "secondary" : "outline"}
                                            className={purchase.status === "received" ? "bg-green-100 text-green-800" : "bg-yellow-50 text-yellow-800"}>
                                            {purchase.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/admin/purchases/${purchase.id}`}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </AdminLayout>
    );
}
