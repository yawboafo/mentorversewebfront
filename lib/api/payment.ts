import { apiClient } from './client';
import type { Purchase } from './types';

export interface PaymentQuery {
  page?: number;
  limit?: number;
}

export const paymentApi = {
  async getUserPurchases(query?: PaymentQuery): Promise<{ purchases: Purchase[]; total: number }> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    
    const endpoint = `/payments/purchases${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  async checkIfPurchased(contentId: string): Promise<{ purchased: boolean }> {
    return apiClient.get(`/payments/check/${contentId}`);
  },
};
