'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';

export function useRequireAuth(redirectTo: string = '/auth/login') {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    console.log('🔒 useRequireAuth - isLoading:', isLoading, 'user:', user?.email || 'none', 'hasRedirected:', hasRedirected.current);
    
    // Only redirect once if user is not authenticated after loading completes
    if (!isLoading && !user && !hasRedirected.current) {
      console.log('❌ No user found after loading, redirecting to:', redirectTo);
      hasRedirected.current = true;
      router.push(redirectTo);
    }
    
    // Reset redirect flag when user becomes authenticated
    if (user) {
      console.log('✅ User authenticated, resetting redirect flag');
      hasRedirected.current = false;
    }
  }, [user, isLoading, router, redirectTo]);

  return { user, isLoading };
}

export function useRequireRole(allowedRoles: string[], redirectTo: string = '/dashboard') {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    console.log('🔐 useRequireRole - isLoading:', isLoading, 'user:', user?.email || 'none', 'role:', user?.role, 'allowed:', allowedRoles);
    
    if (!isLoading && user && !allowedRoles.includes(user.role) && !hasRedirected.current) {
      console.log('❌ Role', user.role, 'not in allowed roles', allowedRoles, '- redirecting to:', redirectTo);
      hasRedirected.current = true;
      router.replace(redirectTo);
    }
    
    // Reset flag if user changes
    if (user && allowedRoles.includes(user.role)) {
      hasRedirected.current = false;
    }
  }, [user, isLoading, router, allowedRoles, redirectTo]);

  return { user, isLoading };
}
