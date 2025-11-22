import { apiClient } from './client';
import type { LoginResponse, RegisterRequest, User, transformLoginResponse, SignupIntent, MentorStatus } from './types';

// Define backend response type (camelCase)
interface BackendLoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    accountType: 'individual' | 'business';
    role: 'user' | 'mentor' | 'admin';
    onboardingCompleted?: boolean;
    createdAt: string;
    signupIntent?: SignupIntent;
    mentorStatus?: MentorStatus;
  };
}

// Helper to transform backend response to frontend format
function transformBackendResponse(backend: BackendLoginResponse): LoginResponse {
  return {
    access_token: backend.accessToken,
    refresh_token: backend.refreshToken,
    token_type: 'Bearer',
    user: {
      id: backend.user.id,
      email: backend.user.email,
      full_name: backend.user.fullName,
      account_type: backend.user.accountType,
      role: backend.user.role,
      onboarding_completed: backend.user.onboardingCompleted ?? false,
      created_at: backend.user.createdAt,
      signup_intent: backend.user.signupIntent,
      mentor_status: backend.user.mentorStatus,
    },
  };
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const backendResponse = await apiClient.post<BackendLoginResponse>('/auth/login', {
      email,
      password,
    });
    
    const response = transformBackendResponse(backendResponse);
    
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      // Store user data for immediate access
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  async register(data: RegisterRequest & { signup_intent?: SignupIntent }): Promise<LoginResponse> {
    console.log('📝 Registering with data:', data);
    
    // Transform snake_case to camelCase for backend API
    const requestBody = {
      fullName: data.full_name,
      email: data.email,
      password: data.password,
      accountType: data.account_type,
      signupIntent: data.signup_intent,
    };
    
    console.log('📤 Sending to API:', requestBody);
    const backendResponse = await apiClient.post<BackendLoginResponse>('/auth/register', requestBody);
    console.log('✅ Registration response received:', backendResponse);
    console.log('📦 Backend user object:', {
      email: backendResponse.user.email,
      role: backendResponse.user.role,
      signupIntent: backendResponse.user.signupIntent,
      mentorStatus: backendResponse.user.mentorStatus,
    });
    
    const response = transformBackendResponse(backendResponse);
    console.log('🔄 Transformed response user:', {
      email: response.user.email,
      role: response.user.role,
      signup_intent: response.user.signup_intent,
      mentor_status: response.user.mentor_status,
    });
    
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      // Store user data for immediate access
      const userToStore = JSON.stringify(response.user);
      console.log('💾 Storing user in localStorage:', userToStore);
      localStorage.setItem('user', userToStore);
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
    // Backend returns camelCase
    interface BackendUser {
      id: string;
      email: string;
      fullName: string;
      accountType: 'individual' | 'business';
      role: 'user' | 'mentor' | 'admin';
      onboardingCompleted?: boolean;
      createdAt: string;
      avatarUrl?: string;
      country?: string;
      signupIntent?: SignupIntent;
      mentorStatus?: MentorStatus;
    }
    
    const backendUser = await apiClient.get<BackendUser>('/me');
    
    // Transform to frontend format (snake_case)
    return {
      id: backendUser.id,
      email: backendUser.email,
      full_name: backendUser.fullName,
      account_type: backendUser.accountType,
      role: backendUser.role,
      onboarding_completed: backendUser.onboardingCompleted ?? false,
      created_at: backendUser.createdAt,
      signup_intent: backendUser.signupIntent,
      mentor_status: backendUser.mentorStatus,
    };
  },

  async refresh(refreshToken: string): Promise<LoginResponse> {
    const backendResponse = await apiClient.post<BackendLoginResponse>('/auth/refresh', {
      refreshToken,
    });
    
    const response = transformBackendResponse(backendResponse);
    
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      // Store user data for immediate access
      localStorage.setItem('user', JSON.stringify(response.user));
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
      // Store user data for immediate access
      localStorage.setItem('user', JSON.stringify(response.user));
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
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  },

  isAuthenticated(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('access_token');
  },
};
