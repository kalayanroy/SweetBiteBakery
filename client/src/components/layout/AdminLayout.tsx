import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Users, Settings, LogOut, Menu, X, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

type AdminLayoutProps = {
  children: React.ReactNode;
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [location] = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/admin/logout', undefined);
      window.location.href = '/admin/login';
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 w-full max-w-xs flex flex-col bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-6 bg-primary text-white">
            <span className="text-xl font-heading font-bold">SweetBite Admin</span>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto pt-2">
            <nav className="flex-1 px-4 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                >
                  <a className={`group flex items-center py-3 px-3 rounded-md text-sm ${
                    location === item.href 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                    <item.icon className={`mr-3 h-5 w-5 ${
                      location === item.href ? 'text-primary' : 'text-gray-500'
                    }`} />
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t border-gray-200 p-4">
            <button
              className="flex items-center w-full py-2 px-3 text-sm text-red-600 hover:bg-red-50 rounded-md"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6">
              <h1 className="text-xl font-heading font-bold text-primary">SweetBite Admin</h1>
            </div>
            <div className="mt-6 flex-1 flex flex-col">
              <nav className="flex-1 px-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                  >
                    <a className={`group flex items-center py-3 px-3 rounded-md text-sm ${
                      location === item.href 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      <item.icon className={`mr-3 h-5 w-5 ${
                        location === item.href ? 'text-primary' : 'text-gray-500'
                      }`} />
                      {item.name}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="border-t border-gray-200 p-4">
              <button
                className="flex items-center w-full py-2 px-3 text-sm text-red-600 hover:bg-red-50 rounded-md"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-4">
            <div>
              <h1 className="text-xl font-heading font-bold text-primary">SweetBite Admin</h1>
            </div>
            <div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
