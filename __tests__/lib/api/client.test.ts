import { apiClient, ApiException } from '@/lib/api/client';

describe('API Client', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('request method', () => {
    it('should make a successful GET request', async () => {
      const mockData = { id: '1', name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      } as Response);

      const result = await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/test',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should include Authorization header when token is present', async () => {
      const token = 'test-token';
      localStorage.setItem('access_token', token);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      } as Response);

      await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`,
          }),
        })
      );
    });

    it('should handle 401 Unauthorized and clear tokens', async () => {
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('refresh_token', 'refresh');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Unauthorized' }),
      } as Response);

      await expect(apiClient.get('/test')).rejects.toThrow(ApiException);
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });

    it('should throw ApiException on error response', async () => {
      const errorData = {
        message: 'Validation failed',
        errors: { email: ['Email is required'] },
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => errorData,
      } as Response);

      try {
        await apiClient.get('/test');
        fail('Should have thrown ApiException');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException);
        expect((error as ApiException).status).toBe(400);
        expect((error as ApiException).message).toBe('Validation failed');
        expect((error as ApiException).errors).toEqual(errorData.errors);
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.get('/test')).rejects.toThrow('Network error');
    });

    it('should handle non-JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
      } as Response);

      const result = await apiClient.get('/test');
      expect(result).toEqual({});
    });
  });

  describe('HTTP methods', () => {
    it('should make POST request with body', async () => {
      const postData = { name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: '1', ...postData }),
      } as Response);

      await apiClient.post('/test', postData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );
    });

    it('should make PATCH request', async () => {
      const patchData = { name: 'Updated' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => patchData,
      } as Response);

      await apiClient.patch('/test/1', patchData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/test/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(patchData),
        })
      );
    });

    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      } as Response);

      await apiClient.delete('/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/test/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});
