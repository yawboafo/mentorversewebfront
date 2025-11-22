'use client';

// Placeholder for admin panel
// Full implementation includes mentor application reviews and content moderation

import { Card } from '@/components/ui/card';
import { useRequireRole } from '@/hooks/use-require-auth';
import { Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { user, isLoading } = useRequireRole(['admin']);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-bold mb-2">Mentor Applications</h2>
          <p className="text-muted-foreground mb-4">
            Review and approve pending mentor applications
          </p>
          <Button asChild>
            <Link href="/admin/mentors">Review Applications</Link>
          </Button>
        </Card>
        
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-bold mb-2">Content Moderation</h2>
          <p className="text-muted-foreground mb-4">
            Moderate and manage platform content
          </p>
          <Button asChild>
            <Link href="/admin/content">Manage Content</Link>
          </Button>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-bold mb-2">User Management</h2>
          <p className="text-muted-foreground mb-4">
            Manage users, roles, and permissions
          </p>
          <Button asChild>
            <Link href="/admin/users">Manage Users</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
