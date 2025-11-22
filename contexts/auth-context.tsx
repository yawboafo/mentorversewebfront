'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import type { User, LoginResponse } from '@/lib/api/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isMentor: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  socialLogin: (provider: string, intent: 'user' | 'mentor') => Promise<void>;
  handleAuthSuccess: (response: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const handleAuthSuccess = (response: LoginResponse) => {
    // Store tokens
    localStorage.setItem('access_token', response.access_token);
    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }

    // Store user
    setUser(response.user);

    // Redirect based on role and onboarding status
    redirectUser(response.user);
  };

  const redirectUser = (user: User) => {
    // Check onboarding status first
    if (!user.onboarding_completed) {
      router.push('/onboarding');
      return;
    }

    // Redirect based on role
    if (user.role === 'mentor') {
      router.push('/mentor/dashboard');
    } else if (user.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    handleAuthSuccess(response);
  };

  const register = async (data: any) => {
    const response = await authApi.register(data);
    handleAuthSuccess(response);
  };

  const socialLogin = async (provider: string, intent: 'user' | 'mentor') => {
    const authUrl = await authApi.getOAuthUrl(provider, intent);
    // Store intent for callback handling
    localStorage.setItem('oauth_intent', intent);
    // Redirect to provider
    window.location.href = authUrl.url;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('oauth_intent');
    setUser(null);
    router.push('/auth/login');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isMentor: user?.role === 'mentor',
    isLoading,
    login,
    register,
    socialLogin,
    handleAuthSuccess,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
