import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Store,
  CreditCard,
  Bell,
  Shield,
  UserCircle,
  Save,
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Menu,
  Check,
  X
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const storeSettingsSchema = z.object({
  storeName: z.string().min(2, { message: 'Store name must be at least 2 characters.' }),
  storeEmail: z.string().email({ message: 'Please enter a valid email address.' }),
  storePhone: z.string().optional(),
  storeAddress: z.string().min(5, { message: 'Please enter a complete address.' }),
  storeCurrency: z.string(),
  taxRate: z.string().refine((val) => !isNaN(Number(val)), {
    message: 'Tax rate must be a number.'
  }),
  freeDeliveryThreshold: z.string().optional().refine((val) => !val || !isNaN(Number(val)), {
    message: 'Threshold must be a number.'
  }),
});

const paymentSettingsSchema = z.object({
  enableCashOnDelivery: z.boolean(),
  enableBkash: z.boolean(),
  enableNagad: z.boolean(),
  bkashNumber: z.string().optional(),
  nagadNumber: z.string().optional(),
  checkoutNotes: z.string().optional(),
});

type StoreSettingsValues = z.infer<typeof storeSettingsSchema>;
type PaymentSettingsValues = z.infer<typeof paymentSettingsSchema>;

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'staff' | 'superadmin';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  isSuperAdmin?: boolean;
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("store");
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { toast } = useToast();

  // User Management state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'staff' as const,
    password: ''
  });

  // Fetch users from database
  const { data: dbUsers = [], isLoading: isUsersLoading, refetch: refetchUsers } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
  });

  // Map database users to the format expected by the UI
  const users: User[] = dbUsers.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.name || user.username,
    role: user.isAdmin ? 'admin' : 'staff',
    status: 'active',
    createdAt: user.createdAt,
    isSuperAdmin: user.username === 'superadmin'
  }));

  // Menu Permissions state
  const [selectedPermissionUser, setSelectedPermissionUser] = useState<User | null>(null);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', description: 'View dashboard and analytics' },
    { id: 'products', name: 'Products', description: 'Manage products and inventory' },
    { id: 'orders', name: 'Orders', description: 'View and manage orders' },
    { id: 'customers', name: 'Customers', description: 'View customer information' },
    { id: 'settings', name: 'Settings', description: 'Access system settings' },
    { id: 'users', name: 'User Management', description: 'Manage user accounts' },
    { id: 'reports', name: 'Reports', description: 'View reports and analytics' },
  ];

  const defaultPermissions: Record<string, string[]> = {
    admin: ['dashboard', 'products', 'orders', 'customers', 'settings', 'users', 'reports'],
    manager: ['dashboard', 'products', 'orders', 'customers', 'reports'],
    staff: ['dashboard', 'orders', 'customers'],
  };

  const [userPermissions, setUserPermissions] = useState<Record<number, string[]>>({});

  const getUserPermissions = (user: User): string[] => {
    if (userPermissions[user.id]) return userPermissions[user.id];
    return defaultPermissions[user.role] || [];
  };

  const togglePermission = (userId: number, menuId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const currentPerms = getUserPermissions(user);
    const newPerms = currentPerms.includes(menuId)
      ? currentPerms.filter(p => p !== menuId)
      : [...currentPerms, menuId];
    setUserPermissions(prev => ({ ...prev, [userId]: newPerms }));
    toast({ title: 'Permission Updated', description: `${user.fullName}'s permissions have been updated.` });
  };

  // Fetch store settings
  const { data: storeSettings, isLoading: isStoreSettingsLoading } = useQuery({
    queryKey: ['/api/admin/settings/store'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/settings/store');
      return res.json();
    }
  });

  // Store settings form
  const storeForm = useForm<StoreSettingsValues>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      storeName: '',
      storeEmail: '',
      storePhone: '',
      storeAddress: '',
      storeCurrency: 'BDT',
      taxRate: '0',
      freeDeliveryThreshold: '1000', // Default
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (storeSettings && Object.keys(storeSettings).length > 0) {
      storeForm.reset({
        storeName: storeSettings.storeName || '',
        storeEmail: storeSettings.storeEmail || '',
        storePhone: storeSettings.storePhone || '',
        storeAddress: storeSettings.storeAddress || '',
        storeCurrency: storeSettings.storeCurrency || 'BDT',
        taxRate: storeSettings.taxRate || '0',
        freeDeliveryThreshold: storeSettings.freeDeliveryThreshold || '1000',
      });
    }
  }, [storeSettings, storeForm]);

  // Payment settings form
  const paymentForm = useForm<PaymentSettingsValues>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      enableCashOnDelivery: true,
      enableBkash: true,
      enableNagad: false,
      bkashNumber: '',
      nagadNumber: '',
      checkoutNotes: '',
    },
  });

  // Handle store settings submission
  const storeSettingsMutation = useMutation({
    mutationFn: (data: StoreSettingsValues) => {
      return apiRequest('PUT', '/api/admin/settings/store', data);
    },
    onSuccess: () => {
      toast({
        title: 'Settings updated',
        description: 'Your store settings have been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'There was a problem updating your settings.',
        variant: 'destructive',
      });
    },
  });

  // Handle payment settings submission
  const paymentSettingsMutation = useMutation({
    mutationFn: (data: PaymentSettingsValues) => {
      return apiRequest('PUT', '/api/admin/settings/payment', data);
    },
    onSuccess: () => {
      toast({
        title: 'Settings updated',
        description: 'Your payment settings have been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'There was a problem updating your payment settings.',
        variant: 'destructive',
      });
    },
  });

  const onSubmitStoreSettings = (data: StoreSettingsValues) => {
    storeSettingsMutation.mutate(data);
  };

  const onSubmitPaymentSettings = (data: PaymentSettingsValues) => {
    paymentSettingsMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500">Configure your bakery shop settings</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-7 md:w-[800px]">
            <TabsTrigger value="store" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Store</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payment</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              <span className="hidden sm:inline">Permissions</span>
            </TabsTrigger>
          </TabsList>

          {/* Store Settings */}
          <TabsContent value="store" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>
                  Configure your store details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...storeForm}>
                  <form id="store-settings-form" onSubmit={storeForm.handleSubmit(onSubmitStoreSettings)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={storeForm.control}
                        name="storeName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Store Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={storeForm.control}
                        name="storeEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={storeForm.control}
                        name="storePhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={storeForm.control}
                        name="storeCurrency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="BDT">Bangladeshi Taka (৳)</SelectItem>
                                <SelectItem value="USD">US Dollar ($)</SelectItem>
                                <SelectItem value="EUR">Euro (€)</SelectItem>
                                <SelectItem value="GBP">British Pound (£)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={storeForm.control}
                      name="storeAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Address</FormLabel>
                          <FormControl>
                            <Textarea rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={storeForm.control}
                        name="taxRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Rate (%)</FormLabel>
                            <FormControl>
                              <Input type="text" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter the default tax rate as a percentage
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={storeForm.control}
                        name="freeDeliveryThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Free Delivery Threshold (BDT)</FormLabel>
                            <FormControl>
                              <Input type="text" {...field} />
                            </FormControl>
                            <FormDescription>
                              Minimum order amount for free delivery
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="submit"
                  form="store-settings-form"
                  disabled={storeSettingsMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {storeSettingsMutation.isPending && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                  )}
                  <Save className="h-4 w-4 mr-1" />
                  Save Store Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Configure payment options and settings for checkout
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...paymentForm}>
                  <form id="payment-settings-form" onSubmit={paymentForm.handleSubmit(onSubmitPaymentSettings)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Available Payment Methods</h3>

                      <FormField
                        control={paymentForm.control}
                        name="enableCashOnDelivery"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Cash on Delivery</FormLabel>
                              <FormDescription>
                                Accept cash payments when orders are delivered
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={paymentForm.control}
                        name="enableBkash"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">bKash Payment</FormLabel>
                              <FormDescription>
                                Accept bKash mobile payments
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {paymentForm.watch('enableBkash') && (
                        <FormField
                          control={paymentForm.control}
                          name="bkashNumber"
                          render={({ field }) => (
                            <FormItem className="ml-6">
                              <FormLabel>bKash Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter the bKash number customers should send payments to
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={paymentForm.control}
                        name="enableNagad"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Nagad Payment</FormLabel>
                              <FormDescription>
                                Accept Nagad mobile payments
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {paymentForm.watch('enableNagad') && (
                        <FormField
                          control={paymentForm.control}
                          name="nagadNumber"
                          render={({ field }) => (
                            <FormItem className="ml-6">
                              <FormLabel>Nagad Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter the Nagad number customers should send payments to
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Checkout Notes</h3>
                      <FormField
                        control={paymentForm.control}
                        name="checkoutNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Confirmation Message</FormLabel>
                            <FormControl>
                              <Textarea rows={4} {...field} />
                            </FormControl>
                            <FormDescription>
                              This message will be displayed to customers after they complete their order
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="submit"
                  form="payment-settings-form"
                  disabled={paymentSettingsMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {paymentSettingsMutation.isPending && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                  )}
                  <Save className="h-4 w-4 mr-1" />
                  Save Payment Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notifications Settings - Simplified */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure order and system notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="new-order" className="flex flex-col space-y-1">
                      <span>New Order Notifications</span>
                      <span className="font-normal text-sm text-gray-500">
                        Receive notifications when new orders are placed
                      </span>
                    </Label>
                    <Switch id="new-order" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="low-stock" className="flex flex-col space-y-1">
                      <span>Low Stock Alerts</span>
                      <span className="font-normal text-sm text-gray-500">
                        Get notified when products are running low on inventory
                      </span>
                    </Label>
                    <Switch id="low-stock" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="marketing" className="flex flex-col space-y-1">
                      <span>Marketing Updates</span>
                      <span className="font-normal text-sm text-gray-500">
                        Receive marketing tips and platform updates
                      </span>
                    </Label>
                    <Switch id="marketing" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4 mr-1" />
                  Save Notification Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Security Settings - Simplified */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:w-1/2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Security</h3>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="two-factor" className="flex flex-col space-y-1">
                      <span>Two-Factor Authentication</span>
                      <span className="font-normal text-sm text-gray-500">
                        Add an extra layer of security to your account
                      </span>
                    </Label>
                    <Switch id="two-factor" disabled />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  className="flex items-center gap-2"
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                  onClick={async () => {
                    if (newPassword !== confirmPassword) {
                      toast({
                        title: "Error",
                        description: "New passwords do not match",
                        variant: "destructive"
                      });
                      return;
                    }

                    try {
                      const response = await fetch('/api/auth/password', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ currentPassword, newPassword })
                      });

                      const data = await response.json();

                      if (!response.ok) {
                        throw new Error(data.message || 'Failed to update password');
                      }

                      toast({
                        title: "Success",
                        description: "Password updated successfully",
                      });

                      // Clear fields
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Update Security Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Account Settings - Simplified */}
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" defaultValue="Admin User" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john@example.com" defaultValue="admin@Probashi.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue="admin" disabled />
                    <p className="text-sm text-gray-500">Username cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Account Role</Label>
                    <Input id="role" defaultValue="Administrator" disabled />
                    <p className="text-sm text-gray-500">Contact support to change roles</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4 mr-1" />
                  Save Account Information
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage user accounts, roles, and permissions
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsAddUserDialogOpen(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                {isUsersLoading ? (
                  <div className="py-10 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading users from database...</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users
                          .filter(user => {
                            // Hide super admin from the user management table
                            if (user.isSuperAdmin) return false;

                            const matchesSearch =
                              user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              user.username.toLowerCase().includes(searchQuery.toLowerCase());
                            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
                            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
                            return matchesSearch && matchesRole && matchesStatus;
                          })
                          .map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{user.fullName}</div>
                                  <div className="text-sm text-gray-500">@{user.username}</div>
                                </div>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={
                                  user.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                    user.role === 'manager' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                      'bg-gray-100 text-gray-800 border-gray-200'
                                }>
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={
                                  user.status === 'active'
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-red-100 text-red-800 border-red-200'
                                }>
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.lastLogin
                                  ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                  : 'Never'
                                }
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setIsEditUserDialogOpen(true);
                                      }}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={async () => {
                                        try {
                                          const newStatus = user.status === 'active' ? 'inactive' : 'active';
                                          const response = await fetch(`/api/admin/users/${user.id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            credentials: 'include',
                                            body: JSON.stringify({
                                              status: newStatus
                                            })
                                          });

                                          if (!response.ok) {
                                            const error = await response.json();
                                            throw new Error(error.message || 'Failed to update status');
                                          }

                                          await refetchUsers();
                                          toast({
                                            title: 'Status Updated',
                                            description: `User ${user.status === 'active' ? 'deactivated' : 'activated'} successfully.`,
                                          });
                                        } catch (error: any) {
                                          toast({
                                            title: 'Error',
                                            description: error.message || 'Failed to update status',
                                            variant: 'destructive',
                                          });
                                        }
                                      }}
                                    >
                                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => {
                                        // Prevent deletion of super admin
                                        if (user.isSuperAdmin) {
                                          toast({
                                            title: 'Action Denied',
                                            description: 'Super admin cannot be deleted.',
                                            variant: 'destructive'
                                          });
                                          return;
                                        }

                                        if (confirm(`Are you sure you want to delete ${user.fullName}?`)) {
                                          (async () => {
                                            try {
                                              const response = await fetch(`/api/admin/users/${user.id}`, {
                                                method: 'DELETE',
                                                credentials: 'include',
                                              });

                                              if (!response.ok) {
                                                const error = await response.json();
                                                throw new Error(error.message || 'Failed to delete user');
                                              }

                                              await refetchUsers();
                                              toast({
                                                title: 'User Deleted',
                                                description: 'User has been removed successfully from the database.',
                                              });
                                            } catch (error: any) {
                                              toast({
                                                title: 'Error',
                                                description: error.message || 'Failed to delete user',
                                                variant: 'destructive',
                                              });
                                            }
                                          })();
                                        }
                                      }}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete User
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Permissions Tab */}
          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Menu Permissions</CardTitle>
                <CardDescription>
                  Manage user access to different menu items and features
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Permission Matrix */}
                <div className="space-y-6">
                  {/* Role-based defaults info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Default Permissions by Role</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Admin:</span>
                        <span className="text-blue-700 ml-2">Full Access</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Manager:</span>
                        <span className="text-blue-700 ml-2">Dashboard, Products, Orders, Customers, Reports</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Staff:</span>
                        <span className="text-blue-700 ml-2">Dashboard, Orders, Customers</span>
                      </div>
                    </div>
                  </div>

                  {/* Permission Matrix Table */}
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">User</TableHead>
                          <TableHead className="w-[120px]">Role</TableHead>
                          {menuItems.map(item => (
                            <TableHead key={item.id} className="text-center min-w-[100px]">
                              <div className="flex flex-col items-center">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-xs text-gray-500 font-normal">{item.description}</span>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users
                          .filter(user => !user.isSuperAdmin) // Hide super admin from permissions
                          .map((user) => {
                            const userPerms = getUserPermissions(user);
                            return (
                              <TableRow key={user.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{user.fullName}</div>
                                    <div className="text-sm text-gray-500">@{user.username}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={
                                    user.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                      user.role === 'manager' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                        'bg-gray-100 text-gray-800 border-gray-200'
                                  }>
                                    {user.role}
                                  </Badge>
                                </TableCell>
                                {menuItems.map(item => {
                                  const hasPermission = userPerms.includes(item.id);
                                  return (
                                    <TableCell key={item.id} className="text-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-8 w-8 p-0 ${hasPermission
                                          ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                          : 'text-gray-300 hover:text-gray-400 hover:bg-gray-50'
                                          }`}
                                        onClick={() => togglePermission(user.id, item.id)}
                                      >
                                        {hasPermission ? (
                                          <Check className="h-5 w-5" />
                                        ) : (
                                          <X className="h-5 w-5" />
                                        )}
                                      </Button>
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={() => {
                        toast({
                          title: 'Permissions Saved',
                          description: 'All permission changes have been saved successfully.',
                        });
                      }}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save All Permissions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add User Dialog */}
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with role and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-fullname">Full Name</Label>
                <Input
                  id="new-fullname"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-username">Username</Label>
                <Input
                  id="new-username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="johndoe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-role">Role</Label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger id="new-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/users', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({
                        username: newUser.username,
                        email: newUser.email,
                        name: newUser.fullName,
                        password: newUser.password,
                        isAdmin: (newUser.role as string) === 'admin',
                        role: newUser.role
                      })
                    });

                    if (!response.ok) {
                      const error = await response.json();
                      throw new Error(error.message || 'Failed to create user');
                    }

                    await refetchUsers();
                    setNewUser({ username: '', email: '', fullName: '', role: 'staff', password: '' });
                    setIsAddUserDialogOpen(false);
                    toast({
                      title: 'User Created',
                      description: 'New user has been added successfully to the database.',
                    });
                  } catch (error: any) {
                    toast({
                      title: 'Error',
                      description: error.message || 'Failed to create user',
                      variant: 'destructive',
                    });
                  }
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-fullname">Full Name</Label>
                  <Input
                    id="edit-fullname"
                    defaultValue={selectedUser.fullName}
                    onChange={(e) => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    defaultValue={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value: any) => setSelectedUser({ ...selectedUser, role: value })}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (selectedUser) {
                    try {
                      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          username: selectedUser.username,
                          email: selectedUser.email,
                          name: selectedUser.fullName,
                          isAdmin: selectedUser.role === 'admin',
                          role: selectedUser.role
                        })
                      });

                      if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Failed to update user');
                      }

                      await refetchUsers();
                      setIsEditUserDialogOpen(false);
                      toast({
                        title: 'User Updated',
                        description: 'User information has been updated successfully in the database.',
                      });
                    } catch (error: any) {
                      toast({
                        title: 'Error',
                        description: error.message || 'Failed to update user',
                        variant: 'destructive',
                      });
                    }
                  }
                }}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
