'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';

export function useRequireAuth(redirectTo: string = '/auth/login') {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only redirect once if user is not authenticated after loading completes
    if (!isLoading && !user && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push(redirectTo);
    }
    
    // Reset redirect flag when user becomes authenticated
    if (user) {
      hasRedirected.current = false;
    }
  }, [user, isLoading, router, redirectTo]);

  return { user, isLoading };
}

export function useRequireRole(allowedRoles: string[], redirectTo: string = '/dashboard') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, allowedRoles, redirectTo]);

  return { user, isLoading };
}
