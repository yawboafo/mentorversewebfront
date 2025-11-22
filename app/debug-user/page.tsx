'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DebugUserPage() {
  const { user } = useAuth();
  const router = useRouter();

  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>User Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Auth Context User:</h3>
            <pre className="bg-slate-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">LocalStorage User:</h3>
            <pre className="bg-slate-100 p-4 rounded overflow-x-auto text-sm">
              {storedUser || 'null'}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Has Access Token:</h3>
            <p className="text-sm">{storedToken ? 'Yes ✅' : 'No ❌'}</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button onClick={() => router.push('/mentor/apply')} variant="outline">
              Go to Mentor Apply
            </Button>
            <Button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/auth/login';
              }} 
              variant="destructive"
            >
              Clear Storage & Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
