import { apiClient } from './client';
import type { Content, ContentFull, CheckoutRequest, CheckoutResponse } from './types';
import { purchasesApi } from './purchases';

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
    console.log('💳 Checkout request:', JSON.stringify(request, null, 2));
    return apiClient.post<CheckoutResponse>('/payments/checkout', request);
  },

  /**
   * Get all content the current user has access to (enrolled/purchased courses)
   * Works by fetching purchases and then getting content details for each
   */
  async getMyEnrolledContent(): Promise<Content[]> {
    try {
      // Get all purchases
      const purchases = await purchasesApi.getMyPurchases();
      
      // Filter for paid purchases only
      const paidPurchases = purchases.filter(p => p.status === 'paid');
      
      // Fetch content details for each purchase
      const contentPromises = paidPurchases.map(purchase => 
        this.getContentById(purchase.contentId).catch(() => null)
      );
      
      const contents = await Promise.all(contentPromises);
      
      // Filter out any failed fetches (null values)
      return contents.filter((c): c is Content => c !== null);
    } catch (error) {
      console.error('Failed to fetch enrolled content:', error);
      return [];
    }
  },
};
