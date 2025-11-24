const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

export class ApiException extends Error {
  status: number;
  errors?: Record<string, string[]>;
  data?: any;

  constructor(message: string, status: number, errors?: Record<string, string[]>, data?: any) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.data = data;
    this.name = 'ApiException';
  }
}

export const apiClient = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      // Log request details for debugging
      if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH' || options.method === 'DELETE') {
        console.log('📤 API Request:', {
          method: options.method,
          endpoint,
          url,
          body: options.body ? JSON.parse(options.body as string) : null
        });
      }
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.error('🚨 401 Unauthorized');
        console.error('Endpoint:', endpoint);
        
        // Only auto-redirect for endpoints that require auth
        // For optional auth endpoints (like checking purchases), just throw the error
        const optionalAuthEndpoints = ['/me/purchases', '/me/learning'];
        const isOptionalAuth = optionalAuthEndpoints.some(pattern => endpoint.includes(pattern));
        
        if (!isOptionalAuth && typeof window !== 'undefined') {
          const hadToken = !!localStorage.getItem('access_token');
          console.error('Had token before clearing:', hadToken);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/auth/login';
        }
        
        throw new ApiException('Unauthorized', 401);
      }

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw new ApiException(`Request failed with status ${response.status}`, response.status);
        }
        return {} as T;
      }

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API Error Response:', {
          endpoint,
          status: response.status,
          data,
          fullError: JSON.stringify(data, null, 2)
        });
        
        throw new ApiException(
          data.message || data.detail || 'Request failed',
          response.status,
          data.errors,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  },

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
