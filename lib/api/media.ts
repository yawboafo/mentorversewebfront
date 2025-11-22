import { apiClient } from './client';

export interface UploadResponse {
  url: string;
  public_id: string;
}

export const mediaApi = {
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Note: For file uploads, we need to override the Content-Type header
    // The apiClient automatically sets 'Content-Type': 'application/json'
    // We need to let the browser set the correct multipart/form-data boundary
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Failed to upload image');
    }

    return response.json();
  },
};
