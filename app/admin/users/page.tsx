'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRequireRole } from '@/hooks/use-require-auth';
import { adminApi } from '@/lib/api/admin';
import { toast } from 'sonner';
import { 
  Shield,
  ArrowLeft,
  Loader2,
  Edit,
  Trash2,
  Ban,
  CheckCircle2,
  Search,
  Filter,
  Users as UsersIcon,
  Mail,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'mentor' | 'admin';
  accountType: 'individual' | 'business';
  onboardingCompleted: boolean;
  createdAt: string;
  avatarUrl?: string;
  country?: string;
  signupIntent?: 'user' | 'mentor';
  mentorStatus?: 'none' | 'pending_approval' | 'active' | 'suspended';
}

export default function AdminUsersPage() {
  const { user: currentUser, isLoading: authLoading } = useRequireRole(['admin']);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 20;

  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    role: 'user' as 'user' | 'mentor' | 'admin',
    accountType: 'individual' as 'individual' | 'business',
    mentorStatus: 'none' as 'none' | 'pending_approval' | 'active' | 'suspended',
  });

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, currentPage, roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params: any = { page: currentPage, limit };
      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }
      console.log('📥 Fetching users with params:', params);
      const response = await adminApi.getUsers(params);
      console.log('✅ Users fetched:', response);
      
      // Transform snake_case to camelCase if needed
      const transformedUsers = response.data.map((user: any) => {
        // Handle mentor_status: check for both snake_case and camelCase, treat null/undefined as 'none'
        const rawMentorStatus = user.mentor_status ?? user.mentorStatus;
        const mentorStatus = rawMentorStatus || 'none';
        
        console.log(`User ${user.email}: raw mentor_status=${user.mentor_status}, raw mentorStatus=${user.mentorStatus}, final=${mentorStatus}`);
        
        return {
          id: user.id,
          email: user.email,
          fullName: user.full_name || user.fullName,
          role: user.role,
          accountType: user.account_type || user.accountType,
          onboardingCompleted: user.onboarding_completed ?? user.onboardingCompleted,
          createdAt: user.created_at || user.createdAt,
          avatarUrl: user.avatar_url || user.avatarUrl,
          country: user.country,
          signupIntent: user.signup_intent || user.signupIntent,
          mentorStatus: mentorStatus,
        };
      });
      
      console.log('📊 Transformed users with mentor status:', transformedUsers.map(u => ({ email: u.email, mentorStatus: u.mentorStatus })));
      
      setUsers(transformedUsers);
      setTotalUsers(response.total);
    } catch (err: any) {
      console.error('❌ Failed to load users:', err);
      toast.error(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      accountType: user.accountType,
      mentorStatus: user.mentorStatus || 'none',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    // Validation: If trying to set mentor status to active/pending, ensure role is mentor
    if (editForm.mentorStatus && editForm.mentorStatus !== 'none' && editForm.role !== 'mentor') {
      toast.error('Please set the user role to "Mentor" before activating mentor status');
      return;
    }

    setProcessingId(selectedUser.id);
    try {
      console.log('📝 Updating user:', selectedUser.id, editForm);
      const updatedUser = await adminApi.updateUser(selectedUser.id, editForm);
      console.log('✅ User updated:', updatedUser);
      
      // Transform response (backend now returns mentor_status)
      const transformed: AdminUser = {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: (updatedUser as any).full_name || updatedUser.fullName,
        role: updatedUser.role,
        accountType: (updatedUser as any).account_type || updatedUser.accountType,
        onboardingCompleted: (updatedUser as any).onboarding_completed ?? updatedUser.onboardingCompleted,
        createdAt: (updatedUser as any).created_at || updatedUser.createdAt,
        avatarUrl: (updatedUser as any).avatar_url || updatedUser.avatarUrl,
        country: updatedUser.country,
        signupIntent: (updatedUser as any).signup_intent || (updatedUser as any).signupIntent,
        mentorStatus: (updatedUser as any).mentor_status || (updatedUser as any).mentorStatus || 'none',
      };
      
      console.log('✅ Transformed mentorStatus:', transformed.mentorStatus);
      
      toast.success('User updated successfully');
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? transformed : u));
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      console.error('❌ Update user error:', err);
      console.error('❌ Full error details:', JSON.stringify(err, null, 2));
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.message || 'Failed to update user';
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    // Prevent deleting yourself
    if (currentUser?.id === userId) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setProcessingId(userId);
    try {
      console.log('🗑️ Attempting to delete user:', userId);
      await adminApi.deleteUser(userId);
      console.log('✅ User deleted successfully');
      toast.success('User deleted successfully');
      setUsers(prev => prev.filter(u => u.id !== userId));
      setTotalUsers(prev => prev - 1);
    } catch (err: any) {
      console.error('❌ Delete user error:', err);
      const errorMessage = err.message || err.detail || 'Failed to delete user';
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      admin: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Admin' },
      mentor: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', label: 'Mentor' },
      user: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'User' },
    };
    const variant = variants[role] || variants.user;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const getSignupIntentBadge = (intent?: string) => {
    if (!intent) return <Badge variant="outline" className="text-gray-500">Not Set</Badge>;
    const variants: Record<string, { color: string; label: string }> = {
      mentor: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', label: '🎓 Mentor' },
      user: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: '👤 User' },
    };
    const variant = variants[intent] || { color: 'bg-gray-100 text-gray-800', label: intent };
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const getMentorStatusBadge = (status?: string) => {
    if (!status || status === 'none') {
      return <Badge variant="outline" className="text-gray-500">None</Badge>;
    }
    const variants: Record<string, { color: string; label: string }> = {
      pending_approval: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: '⏳ Pending' },
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: '✅ Active' },
      suspended: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: '🚫 Suspended' },
    };
    const variant = variants[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const getAccountTypeBadge = (type: string) => {
    return type === 'business' 
      ? <Badge variant="outline">Business</Badge>
      : <Badge variant="outline">Individual</Badge>;
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalUsers / limit);

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Panel
          </Button>
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage platform users</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {totalUsers} Total Users
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="role-filter" className="sr-only">Filter by role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="mentor">Mentors</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search query' : 'No users in the system yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Signup Intent</TableHead>
                <TableHead>Mentor Status</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        {user.country && (
                          <p className="text-sm text-muted-foreground">{user.country}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getSignupIntentBadge(user.signupIntent)}</TableCell>
                  <TableCell>{getMentorStatusBadge(user.mentorStatus)}</TableCell>
                  <TableCell>{getAccountTypeBadge(user.accountType)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(user)}
                        disabled={processingId === user.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(user.id)}
                        disabled={processingId === user.id || user.id === currentUser?.id}
                        className="text-destructive hover:text-destructive"
                      >
                        {processingId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(value: 'user' | 'mentor' | 'admin') => 
                  setEditForm({ ...editForm, role: value })
                }
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-account-type">Account Type</Label>
              <Select
                value={editForm.accountType}
                onValueChange={(value: 'individual' | 'business') => 
                  setEditForm({ ...editForm, accountType: value })
                }
              >
                <SelectTrigger id="edit-account-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mentor-status">Mentor Status</Label>
              <Select
                value={editForm.mentorStatus}
                onValueChange={(value: 'none' | 'pending_approval' | 'active' | 'suspended') => 
                  setEditForm({ ...editForm, mentorStatus: value })
                }
              >
                <SelectTrigger id="edit-mentor-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {editForm.role !== 'mentor' && editForm.mentorStatus !== 'none' ? (
                  <span className="text-amber-600 dark:text-amber-400">⚠️ Note: Set Role to "Mentor" first, then update status</span>
                ) : (
                  'Configure mentor status independently of user role'
                )}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={processingId === selectedUser?.id}>
              {processingId === selectedUser?.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
