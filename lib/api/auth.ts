import { apiClient } from './client';
import type { LoginResponse, RegisterRequest, User } from './types';

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
    }
    
    return response;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);
    
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
    }
    
    return response;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiClient.post('/auth/reset-password', { token, password });
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/me');
  },

  async refresh(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', {
      refreshToken,
    });
    
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
    }
    
    return response;
  },

  async getOAuthUrl(provider: string, intent: 'user' | 'mentor'): Promise<{ url: string }> {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';
    return apiClient.get<{ url: string }>(`/auth/oauth/${provider}/url?intent=${intent}&redirect=${encodeURIComponent(redirectUrl)}`);
  },

  async handleOAuthCallback(code: string, state: string): Promise<LoginResponse> {
    // Extract provider from state or URL if needed
    // For now, we'll let the backend handle the routing
    const response = await apiClient.post<LoginResponse>('/auth/oauth/google/callback', {
      code,
      state,
    });
    
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
    }
    
    return response;
  },

  async logoutApi(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with local logout even if API call fails
    }
  },

  logout() {
    this.logoutApi(); // Fire and forget
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('oauth_intent');
    window.location.href = '/auth/login';
  },

  isAuthenticated(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('access_token');
  },
};
