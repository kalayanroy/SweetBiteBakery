import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, Calendar, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Order type definition
interface OrderItem {
  productId: number;
  productName?: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  status: string;
  total: number;
  createdAt: string;
  paymentMethod: string;
  items: OrderItem[];
}

// Status badge colors
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'shipped':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function AdminOrders() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch orders data
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    staleTime: 60000, // 1 minute
  });

  // Date filtering logic
  const filterByDate = (order: Order) => {
    if (dateFilter === 'all') return true;

    const orderDate = new Date(order.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case 'today':
        return orderDate >= today;
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return orderDate >= monthAgo;
      }
      case 'year': {
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return orderDate >= yearAgo;
      }
      default:
        return true;
    }
  };

  // Filter orders based on search query, status, and date
  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch =
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id?.toString().includes(searchQuery) ||
      order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesDate = filterByDate(order);

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  // Calculate statistics based on filtered orders
  const totalSales = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const orderCount = filteredOrders.length;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500">Manage and track all customer orders</p>
        </div>

        {/* Statistics Cards - Compact Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Total Orders Card */}
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Orders</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl font-bold text-gray-900">{orderCount}</h3>
                    <span className="text-xs text-gray-400">
                      {statusFilter !== 'all' && statusFilter}
                      {dateFilter !== 'all' && ` • ${dateFilter === 'today' ? 'today' : dateFilter === 'week' ? '7d' : dateFilter === 'month' ? '30d' : '1y'}`}
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Sales Card */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Sales</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</h3>
                    {orderCount > 0 && (
                      <span className="text-xs text-gray-400">avg: {formatCurrency(totalSales / orderCount)}</span>
                    )}
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and search */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by order #, name or email"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="md:col-span-3">
            <Select value={dateFilter} onValueChange={handleFilterChange(setDateFilter)}>
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="Filter by date" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Orders List</CardTitle>
            <CardDescription>
              Showing {paginatedOrders.length} of {filteredOrders.length} orders
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-10 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
                <p className="mt-2 text-sm text-gray-500">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-10">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No orders found matching your criteria</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders.map((order: Order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customerName}</div>
                              <div className="text-sm text-gray-500">{order.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {order.items?.length || 0} item(s)
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold">{formatCurrency(order.total || 0)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${getStatusColor(order.status)}`}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View order details"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Show first page, last page, current page, and pages around current
                            return page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1);
                          })
                          .map((page, index, array) => (
                            <div key={page} className="flex items-center">
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="min-w-[40px]"
                              >
                                {page}
                              </Button>
                            </div>
                          ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status with Edit */}
              <div>
                <h3 className="font-semibold mb-2">Order Status</h3>
                <Select
                  value={selectedOrder.status}
                  onValueChange={async (newStatus) => {
                    try {
                      // Optimistically update UI
                      setSelectedOrder({ ...selectedOrder, status: newStatus });

                      // Update in backend
                      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus }),
                        credentials: 'include'
                      });

                      if (!response.ok) throw new Error('Failed to update status');

                      // Refresh orders list
                      window.location.reload();

                      toast({
                        title: "✅ Status Updated",
                        description: `Order status changed to ${newStatus}`,
                      });
                    } catch (error) {
                      console.error('Failed to update status:', error);
                      toast({
                        title: "❌ Update Failed",
                        description: "Could not update order status",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Click to change order status</p>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedOrder.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedOrder.customerPhone}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                  <p className="font-medium">{selectedOrder.address}</p>
                  <p className="text-gray-600">
                    {selectedOrder.city}, {selectedOrder.state}
                  </p>
                  {selectedOrder.zipCode && (
                    <p className="text-gray-600">Postal Code: {selectedOrder.zipCode}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map((item: OrderItem, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.productName || `Product #${item.productId}`}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.subtotal || item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        selectedOrder.items?.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0) || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Cost:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        selectedOrder.total - (selectedOrder.items?.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0) || 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(selectedOrder.total || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="font-medium capitalize">
                    {selectedOrder.paymentMethod === 'cash' ? 'Cash on Delivery' : selectedOrder.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => window.print()}
                  className="flex-1"
                  variant="outline"
                >
                  Print Invoice
                </Button>
                <Button
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(generateInvoiceHTML(selectedOrder));
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }}
                  className="flex-1"
                >
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Helper function to generate invoice HTML for printing/PDF
function generateInvoiceHTML(order: Order): string {
  const subtotal = order.items?.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0) || 0;
  const shippingCost = order.total - subtotal;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice #${order.id} - SweetBite Bakery</title>
      <style>
        @media print {
          body { margin: 0; }
          @page { margin: 2cm; }
        }
        
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          color: #333;
        }
        
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 40px;
          border-bottom: 3px solid #8B5CF6;
          padding-bottom: 20px;
        }
        
        .company-info h1 {
          color: #8B5CF6;
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        
        .company-info p {
          margin: 5px 0;
          color: #666;
        }
        
        .invoice-details {
          text-align: right;
        }
        
        .invoice-details h2 {
          color: #8B5CF6;
          margin: 0 0 10px 0;
        }
        
        .invoice-details p {
          margin: 5px 0;
        }
        
        .section {
          margin: 30px 0;
        }
        
        .section h3 {
          color: #8B5CF6;
          border-bottom: 2px solid #E9D5FF;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin: 20px 0;
        }
        
        .info-box {
          background: #F9FAFB;
          padding: 15px;
          border-radius: 8px;
        }
        
        .info-box p {
          margin: 8px 0;
          line-height: 1.6;
        }
        
        .info-box strong {
          color: #8B5CF6;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        thead {
          background: #8B5CF6;
          color: white;
        }
        
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #E5E7EB;
        }
        
        th {
          font-weight: 600;
        }
        
        tbody tr:hover {
          background: #F9FAFB;
        }
        
        .text-right {
          text-align: right;
        }
        
        .summary-table {
          margin-left: auto;
          width: 300px;
          margin-top: 20px;
        }
        
        .summary-table td {
          padding: 8px 12px;
          border: none;
        }
        
        .summary-table .total-row {
          border-top: 2px solid #8B5CF6;
          font-weight: bold;
          font-size: 18px;
          color: #8B5CF6;
        }
        
        .footer {
          margin-top: 60px;
          text-align: center;
          color: #666;
          font-size: 14px;
          border-top: 1px solid #E5E7EB;
          padding-top: 20px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          text-transform: capitalize;
        }
        
        .status-pending { background: #FEF3C7; color: #92400E; }
        .status-processing { background: #DBEAFE; color: #1E40AF; }
        .status-shipped { background: #E9D5FF; color: #6B21A8; }
        .status-delivered { background: #D1FAE5; color: #065F46; }
        .status-cancelled { background: #FEE2E2; color: #991B1B; }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="company-info">
          <h1>🍰 SweetBite Bakery</h1>
          <p>Fresh Baked Goods Daily</p>
          <p>Email: info@sweetbitebakery.com</p>
          <p>Phone: +880 1234-567890</p>
        </div>
        <div class="invoice-details">
          <h2>INVOICE</h2>
          <p><strong>Invoice #:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Time:</strong> ${new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          <p><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></p>
        </div>
      </div>
      
      <div class="info-grid">
        <div class="info-box">
          <h3>Bill To:</h3>
          <p><strong>Name:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          <p><strong>Phone:</strong> ${order.customerPhone}</p>
        </div>
        <div class="info-box">
          <h3>Delivery Address:</h3>
          <p>${order.address}</p>
          <p>${order.city}, ${order.state}</p>
          ${order.zipCode ? `<p>Postal Code: ${order.zipCode}</p>` : ''}
        </div>
      </div>
      
      <div class="section">
        <h3>Order Items</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items?.map(item => `
              <tr>
                <td>${item.productName || `Product #${item.productId}`}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">৳${item.price.toFixed(2)}</td>
                <td class="text-right">৳${(item.subtotal || item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>
        
        <table class="summary-table">
          <tr>
            <td>Subtotal:</td>
            <td class="text-right">৳${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Shipping Cost:</td>
            <td class="text-right">৳${shippingCost.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td>Total:</td>
            <td class="text-right">৳${order.total.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      <div class="section">
        <h3>Payment Information</h3>
        <div class="info-box">
          <p><strong>Payment Method:</strong> ${order.paymentMethod === 'cash' ? 'Cash on Delivery (COD)' : order.paymentMethod}</p>
          <p><strong>Payment Status:</strong> ${order.paymentMethod === 'cash' ? 'Payment on Delivery' : 'Paid'}</p>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>Thank you for your order!</strong></p>
        <p>If you have any questions about this invoice, please contact us at info@sweetbitebakery.com</p>
        <p style="margin-top: 20px; font-size: 12px;">This is a computer-generated invoice. No signature required.</p>
      </div>
    </body>
    </html>
  `;
}
