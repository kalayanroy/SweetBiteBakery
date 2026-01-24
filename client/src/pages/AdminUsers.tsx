import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Search, Plus, Edit, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type User = {
    id: number;
    username: string;
    email: string;
    name: string | null;
    isAdmin: boolean;
    createdAt: string;
};

export default function AdminUsers() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        name: '',
        isAdmin: false
    });

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch users
    const { data: users = [], isLoading } = useQuery<User[]>({
        queryKey: ['/api/admin/users'],
    });

    // Create user mutation
    const createUserMutation = useMutation({
        mutationFn: async (userData: typeof formData) => {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
                credentials: 'include',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to create user');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
            setIsDialogOpen(false);
            resetForm();
            toast({
                title: 'Success',
                description: 'User created successfully',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Update user mutation
    const updateUserMutation = useMutation({
        mutationFn: async ({ id, userData }: { id: number; userData: Partial<typeof formData> }) => {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
                credentials: 'include',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to update user');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
            setIsDialogOpen(false);
            resetForm();
            toast({
                title: 'Success',
                description: 'User updated successfully',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to delete user');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
            toast({
                title: 'Success',
                description: 'User deleted successfully',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            name: '',
            isAdmin: false
        });
        setEditingUser(null);
    };

    const handleOpenDialog = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                password: '', // Don't populate password
                name: user.name || '',
                isAdmin: user.isAdmin
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            // Update user - only send changed fields
            const updateData: any = {};
            if (formData.username !== editingUser.username) updateData.username = formData.username;
            if (formData.email !== editingUser.email) updateData.email = formData.email;
            if (formData.name !== (editingUser.name || '')) updateData.name = formData.name;
            if (formData.isAdmin !== editingUser.isAdmin) updateData.isAdmin = formData.isAdmin;
            if (formData.password) updateData.password = formData.password; // Only if password is provided

            updateUserMutation.mutate({ id: editingUser.id, userData: updateData });
        } else {
            // Create new user
            createUserMutation.mutate(formData);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            deleteUserMutation.mutate(id);
        }
    };

    // Filter users based on search query
    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        return (
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.name && user.name.toLowerCase().includes(query))
        );
    });

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-500">Manage system users and administrators</p>
                    </div>
                    <Button
                        onClick={() => handleOpenDialog()}
                        className="mt-4 md:mt-0 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </div>

                {/* Search */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                    <div className="md:col-span-6 lg:col-span-4 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search by username, email or name"
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Users table */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>System Users</CardTitle>
                        <CardDescription>
                            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="py-10 text-center">
                                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
                                <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500">No users found matching your criteria</p>
                            </div>
                        ) : (
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-full ${user.isAdmin ? 'bg-orange-100' : 'bg-gray-100'}`}>
                                                            {user.isAdmin ? (
                                                                <Shield className="h-4 w-4 text-orange-600" />
                                                            ) : (
                                                                <UserIcon className="h-4 w-4 text-gray-600" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{user.username}</div>
                                                            {user.name && <div className="text-sm text-muted-foreground">{user.name}</div>}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${user.isAdmin
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {user.isAdmin ? 'Admin' : 'User'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleOpenDialog(user)}
                                                            title="Edit user"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(user.id)}
                                                            title="Delete user"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add/Edit User Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                            <DialogDescription>
                                {editingUser ? 'Update user information' : 'Create a new system user'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        Password {editingUser && '(leave blank to keep current)'}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingUser}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isAdmin"
                                        checked={formData.isAdmin}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
                                    />
                                    <Label htmlFor="isAdmin">Administrator privileges</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                                >
                                    {editingUser ? 'Update' : 'Create'} User
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
