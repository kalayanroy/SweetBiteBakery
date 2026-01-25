import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Supplier, insertSupplierSchema } from "@shared/schema";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Search, Loader2, Plus, Pencil, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { z } from "zod";

export default function AdminSuppliers() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
        queryKey: ["/api/admin/suppliers"],
    });

    const form = useForm({
        resolver: zodResolver(insertSupplierSchema),
        defaultValues: {
            name: "",
            contactName: "",
            email: "",
            phone: "",
            address: "",
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: z.infer<typeof insertSupplierSchema>) => {
            const res = await apiRequest("POST", "/api/admin/suppliers", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/suppliers"] });
            toast({ title: "Supplier created successfully" });
            setIsDialogOpen(false);
            form.reset();
        },
        onError: (error: Error) => {
            toast({ title: "Failed to create supplier", description: error.message, variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof insertSupplierSchema> }) => {
            const res = await apiRequest("PUT", `/api/admin/suppliers/${id}`, data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/suppliers"] });
            toast({ title: "Supplier updated successfully" });
            setIsDialogOpen(false);
            setEditingSupplier(null);
            form.reset();
        },
        onError: (error: Error) => {
            toast({ title: "Failed to update supplier", description: error.message, variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/admin/suppliers/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/suppliers"] });
            toast({ title: "Supplier deleted successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Failed to delete supplier", description: error.message, variant: "destructive" });
        },
    });

    const onSubmit = (data: z.infer<typeof insertSupplierSchema>) => {
        if (editingSupplier) {
            updateMutation.mutate({ id: editingSupplier.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        form.reset({
            name: supplier.name,
            contactName: supplier.contactName || "",
            email: supplier.email || "",
            phone: supplier.phone || "",
            address: supplier.address || "",
        });
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingSupplier(null);
        form.reset({
            name: "",
            contactName: "",
            email: "",
            phone: "",
            address: "",
        });
        setIsDialogOpen(true);
    };

    const filteredSuppliers = suppliers.filter((supplier) =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.contactName && supplier.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AdminLayout>
            <Helmet>
                <title>Suppliers | SweetBite Admin</title>
            </Helmet>

            <div className="flex justify-between items-center mb-6 px-6 pt-6">
                <h1 className="text-3xl font-bold text-gray-800">Suppliers</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAddNew}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Supplier
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Supplier Company Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contactName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Person</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contact Person Name" {...field} value={field.value || ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Email Address" {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Phone Number" {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Full Address" {...field} value={field.value || ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingSupplier ? "Update Supplier" : "Create Supplier"}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6 mx-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search suppliers..."
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
                            <TableHead>Company Name</TableHead>
                            <TableHead>Contact Person</TableHead>
                            <TableHead>Contact Info</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredSuppliers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    No suppliers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSuppliers.map((supplier) => (
                                <TableRow key={supplier.id}>
                                    <TableCell className="font-medium">{supplier.name}</TableCell>
                                    <TableCell>{supplier.contactName || "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                                            {supplier.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3 w-3" /> {supplier.phone}
                                                </div>
                                            )}
                                            {supplier.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3 w-3" /> {supplier.email}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {supplier.address && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin className="h-3 w-3" /> {supplier.address}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(supplier)}>
                                            <Pencil className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => {
                                            if (confirm("Are you sure you want to delete this supplier?")) {
                                                deleteMutation.mutate(supplier.id);
                                            }
                                        }}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
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
