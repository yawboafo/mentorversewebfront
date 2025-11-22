import { apiClient } from './client';
import type { Content, ContentFull, CheckoutRequest, CheckoutResponse } from './types';

export interface ContentQuery {
  q?: string;
  tags?: string[];
  content_type?: 'framework' | 'course';
  min_price?: number;
  max_price?: number;
  mentor_id?: string;
}

export const contentApi = {
  async getContent(query?: ContentQuery): Promise<Content[]> {
    const params = new URLSearchParams();
    if (query?.q) params.append('q', query.q);
    if (query?.tags) query.tags.forEach(tag => params.append('tags', tag));
    if (query?.content_type) params.append('content_type', query.content_type);
    if (query?.min_price !== undefined) params.append('min_price', query.min_price.toString());
    if (query?.max_price !== undefined) params.append('max_price', query.max_price.toString());
    if (query?.mentor_id) params.append('mentor_id', query.mentor_id);
    
    const endpoint = `/content${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get<Content[] | { results: Content[] }>(endpoint);
    // Handle both array and paginated response formats
    return Array.isArray(response) ? response : (response.results || []);
  },

  async getContentById(contentId: string): Promise<Content> {
    return apiClient.get<Content>(`/content/${contentId}`);
  },

  async getContentFull(contentId: string): Promise<ContentFull> {
    return apiClient.get<ContentFull>(`/content/${contentId}/full`);
  },

  async createContent(data: Partial<Content>): Promise<Content> {
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
};
