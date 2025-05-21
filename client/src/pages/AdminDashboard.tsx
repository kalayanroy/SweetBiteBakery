import { useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { ShoppingBag, Package, TrendingUp, Users, DollarSign } from "lucide-react";

// Types for admin dashboard
interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  recentOrders: any[];
}

const AdminDashboard = () => {
  const [location, navigate] = useLocation();
  
  // Check for admin authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/dashboard', {
          credentials: 'include'
        });
        
        if (response.status === 401) {
          navigate('/admin/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/admin/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Fetch dashboard data
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard'],
    // If this fails due to auth, we'll redirect in the effect above
    retry: false 
  });

  // Sample data for charts (in a real app, this would come from the API)
  const productCategoriesData = [
    { name: 'Cakes', count: 5 },
    { name: 'Pastries', count: 4 },
    { name: 'Cookies', count: 3 },
    { name: 'Breads', count: 4 },
  ];

  const ordersByMonthData = [
    { name: 'Jan', orders: 42 },
    { name: 'Feb', orders: 55 },
    { name: 'Mar', orders: 67 },
    { name: 'Apr', orders: 80 },
    { name: 'May', orders: 95 },
    { name: 'Jun', orders: 110 },
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <AdminLayout>
      <Helmet>
        <title>Admin Dashboard | SweetBite Bakery</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="rounded-full bg-primary/20 p-3 mr-4">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <h3 className="text-2xl font-bold">
                  {isLoading ? "..." : data?.totalProducts || 16}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="rounded-full bg-accent/20 p-3 mr-4">
                <Package className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Categories</p>
                <h3 className="text-2xl font-bold">
                  {isLoading ? "..." : data?.totalCategories || 4}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="rounded-full bg-success/20 p-3 mr-4">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Orders</p>
                <h3 className="text-2xl font-bold">
                  {isLoading ? "..." : data?.totalOrders || 125}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="rounded-full bg-secondary/40 p-3 mr-4">
                <DollarSign className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Revenue</p>
                <h3 className="text-2xl font-bold">$5,240</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Products by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productCategoriesData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {productCategoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ordersByMonthData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Order ID</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sample data - in a real app, this would use data?.recentOrders */}
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">#SB-123456</td>
                    <td className="py-3 px-4">Jennifer D.</td>
                    <td className="py-3 px-4">June 15, 2023</td>
                    <td className="py-3 px-4">$54.99</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">#SB-123455</td>
                    <td className="py-3 px-4">Michael T.</td>
                    <td className="py-3 px-4">June 14, 2023</td>
                    <td className="py-3 px-4">$32.50</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Processing
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">#SB-123454</td>
                    <td className="py-3 px-4">Sarah K.</td>
                    <td className="py-3 px-4">June 14, 2023</td>
                    <td className="py-3 px-4">$67.75</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">#SB-123453</td>
                    <td className="py-3 px-4">David R.</td>
                    <td className="py-3 px-4">June 13, 2023</td>
                    <td className="py-3 px-4">$89.99</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">#SB-123452</td>
                    <td className="py-3 px-4">Lisa M.</td>
                    <td className="py-3 px-4">June 12, 2023</td>
                    <td className="py-3 px-4">$42.25</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
