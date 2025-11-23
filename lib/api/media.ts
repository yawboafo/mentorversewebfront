import { apiClient } from './client';

export interface UploadResponse {
  url: string;
  public_id: string;
  resource_type?: string; // image, video, raw (for documents/files)
  format?: string;
  width?: number;
  height?: number;
  duration?: number; // For video/audio
  bytes?: number; // File size
  thumbnail_url?: string;
}

export interface UploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: Record<string, any>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const mediaApi = {
  /**
   * Upload an image file to Cloudinary
   */
  async uploadImage(file: File, options?: UploadOptions): Promise<UploadResponse> {
    return this.uploadFile(file, { ...options, resourceType: 'image' });
  },

  /**
   * Upload a video file to Cloudinary
   * Supports: MP4, MOV, AVI, WebM, etc.
   */
  async uploadVideo(file: File, options?: UploadOptions): Promise<UploadResponse> {
    return this.uploadFile(file, { ...options, resourceType: 'video' });
  },

  /**
   * Upload an audio file to Cloudinary
   * Supports: MP3, WAV, OGG, etc.
   */
  async uploadAudio(file: File, options?: UploadOptions): Promise<UploadResponse> {
    return this.uploadFile(file, { ...options, resourceType: 'video' }); // Cloudinary treats audio as video
  },

  /**
   * Upload a document/file to Cloudinary
   * Supports: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, etc.
   */
  async uploadDocument(file: File, options?: UploadOptions): Promise<UploadResponse> {
    return this.uploadFile(file, { ...options, resourceType: 'raw' });
  },

  /**
   * Generic file upload method
   * Auto-detects resource type if not specified
   */
  async uploadFile(file: File, options?: UploadOptions): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Add optional parameters
    if (options?.folder) formData.append('folder', options.folder);
    if (options?.resourceType) formData.append('resource_type', options.resourceType);
    if (options?.transformation) formData.append('transformation', JSON.stringify(options.transformation));

    // Note: For file uploads, we need to override the Content-Type header
    // The apiClient automatically sets 'Content-Type': 'application/json'
    // We need to let the browser set the correct multipart/form-data boundary
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Failed to upload file');
    }

    return response.json();
  },

  /**
   * Delete a file from Cloudinary by public_id
   */
  async deleteFile(publicId: string): Promise<void> {
    return apiClient.delete(`/media/${publicId}`);
  },
};
