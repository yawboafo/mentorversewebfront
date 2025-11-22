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

  async getOAuthUrl(provider: string, intent: 'user' | 'mentor'): Promise<{ url: string }> {
    return apiClient.get<{ url: string }>(`/auth/oauth/${provider}/url?intent=${intent}`);
  },

  async handleOAuthCallback(code: string, state: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/oauth/callback', {
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

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/auth/login';
  },

  isAuthenticated(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('access_token');
  },
};
