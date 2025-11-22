import { authApi } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';

jest.mock('@/lib/api/client');

describe('Auth API', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const mockResponse = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        user: {
          id: '1',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'user',
          account_type: 'individual',
          onboarding_completed: true,
          created_at: '2025-01-01',
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authApi.login('test@example.com', 'password');

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
      expect(localStorage.getItem('access_token')).toBe('access-token');
      expect(localStorage.getItem('refresh_token')).toBe('refresh-token');
      expect(result).toEqual(mockResponse);
    });

    it('should handle login without refresh token', async () => {
      const mockResponse = {
        access_token: 'access-token',
        token_type: 'Bearer',
        user: {
          id: '1',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'user',
          account_type: 'individual',
          onboarding_completed: true,
          created_at: '2025-01-01',
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      await authApi.login('test@example.com', 'password');

      expect(localStorage.getItem('access_token')).toBe('access-token');
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        user: {
          id: '1',
          email: 'new@example.com',
          full_name: 'New User',
          role: 'user',
          account_type: 'individual',
          onboarding_completed: false,
          created_at: '2025-01-01',
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authApi.register({
        full_name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        account_type: 'individual',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', {
        full_name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        account_type: 'individual',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        user: {
          id: '1',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'user',
          account_type: 'individual',
          onboarding_completed: true,
          created_at: '2025-01-01',
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authApi.refresh('old-refresh-token');

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'old-refresh-token',
      });
      expect(localStorage.getItem('access_token')).toBe('new-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password request', async () => {
      const mockResponse = { message: 'Reset email sent' };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authApi.forgotPassword('test@example.com');

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockResponse = { message: 'Password reset successfully' };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authApi.resetPassword('reset-token', 'newpassword123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'reset-token',
        password: 'newpassword123',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getOAuthUrl', () => {
    it('should get OAuth URL with redirect', async () => {
      const mockResponse = { url: 'https://oauth.provider.com/auth' };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await authApi.getOAuthUrl('google', 'user');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/auth/oauth/google/url?intent=user&redirect=')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should support mentor intent', async () => {
      const mockResponse = { url: 'https://oauth.provider.com/auth' };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      await authApi.getOAuthUrl('linkedin', 'mentor');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/auth/oauth/linkedin/url?intent=mentor')
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user',
        account_type: 'individual',
        onboarding_completed: true,
        created_at: '2025-01-01',
      };

      mockApiClient.get.mockResolvedValueOnce(mockUser);

      const result = await authApi.getCurrentUser();

      expect(mockApiClient.get).toHaveBeenCalledWith('/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should clear tokens and redirect to login', () => {
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('refresh_token', 'refresh');
      localStorage.setItem('oauth_intent', 'user');

      authApi.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('oauth_intent')).toBeNull();
      // window.location.href is set but jsdom doesn't fully support navigation
      // so we just check that tokens were cleared
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('access_token', 'token');

      const result = authApi.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no token', () => {
      const result = authApi.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});
