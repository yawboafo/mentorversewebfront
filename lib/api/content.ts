import { apiClient } from './client';
import type { Content, ContentFull, CheckoutRequest, CheckoutResponse } from './types';

export interface ContentQuery {
  q?: string;
  tags?: string[];
  content_type?: 'framework' | 'course';
  min_price?: number;
  max_price?: number;
  mentor_id?: string;
  page?: number;
  limit?: number;
}

export interface ContentResponse {
  data: Content[];
  total: number;
  page: number;
  limit: number;
}

export const contentApi = {
  async getContent(query?: ContentQuery): Promise<ContentResponse> {
    const params = new URLSearchParams();
    if (query?.q) params.append('q', query.q);
    if (query?.tags) query.tags.forEach(tag => params.append('tags', tag));
    if (query?.content_type) params.append('contentType', query.content_type); // Backend expects camelCase
    if (query?.min_price !== undefined) params.append('minPrice', query.min_price.toString());
    if (query?.max_price !== undefined) params.append('maxPrice', query.max_price.toString());
    if (query?.mentor_id) params.append('mentorId', query.mentor_id); // Backend expects camelCase
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    
    const endpoint = `/content${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('🔍 Fetching content with filters:', Object.fromEntries(params));
    const response = await apiClient.get<Content[] | ContentResponse>(endpoint);
    // Handle both array and paginated response formats
    if (Array.isArray(response)) {
      return {
        data: response,
        total: response.length,
        page: query?.page || 1,
        limit: query?.limit || response.length
      };
    }
    return response;
  },

  async getContentById(contentId: string): Promise<Content> {
    return apiClient.get<Content>(`/content/${contentId}`);
  },

  async getContentFull(contentId: string): Promise<ContentFull> {
    return apiClient.get<ContentFull>(`/content/${contentId}/full`);
  },

  async createContent(data: Partial<Content>): Promise<Content> {
    console.log('📤 Creating content with data:', JSON.stringify(data, null, 2));
    return apiClient.post<Content>('/content', data);
  },

  async updateContent(contentId: string, data: Partial<Content>): Promise<Content> {
    return apiClient.patch<Content>(`/content/${contentId}`, data);
  },

  async publishContent(contentId: string): Promise<void> {
    return apiClient.post(`/content/${contentId}/publish`);
  },

  async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    return apiClient.post<CheckoutResponse>('/payments/checkout', request);
  },

  /**
   * Check if the current user is enrolled in a specific content
   */
  async getEnrollmentStatus(contentId: string): Promise<{ isEnrolled: boolean; enrolledAt?: string }> {
    try {
      return await apiClient.get<{ isEnrolled: boolean; enrolledAt?: string }>(`/content/${contentId}/enrollment`);
    } catch (error) {
      // If 404 or unauthorized, user is not enrolled
      return { isEnrolled: false };
    }
  },

  /**
   * Get all content the current user has access to (enrolled courses)
   */
  async getMyEnrolledContent(): Promise<Content[]> {
    const response = await apiClient.get<Content[] | { data: Content[] }>('/users/me/content');
    // Handle both array and wrapped response formats
    if (Array.isArray(response)) {
      return response;
    }
    return response.data || [];
  },
};
