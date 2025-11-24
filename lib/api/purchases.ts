import { apiClient } from './client';

export interface Purchase {
  id: string;
  userId: string;
  contentId: string;
  amount: number;
  currency: string;
  baseCurrency: string;
  baseAmount: number;
  conversionRate: number;
  paymentProvider: string;
  paymentRef: string;
  status: 'pending' | 'paid' | 'failed';
  createdAt: string;
  content?: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
  };
}

export const purchasesApi = {
  /**
   * Get all purchases for the current user
   */
  async getMyPurchases(): Promise<Purchase[]> {
    return apiClient.get<Purchase[]>('/me/purchases');
  },

  /**
   * Get a specific purchase by reference
   */
  async getPurchaseByReference(reference: string): Promise<Purchase | null> {
    try {
      const purchases = await this.getMyPurchases();
      return purchases.find(p => p.id === reference) || null;
    } catch (error) {
      console.error('Failed to get purchase:', error);
      return null;
    }
  },

  /**
   * Check if user has purchased specific content
   */
  async hasPurchased(contentId: string): Promise<boolean> {
    try {
      const purchases = await this.getMyPurchases();
      return purchases.some(p => p.contentId === contentId && p.status === 'paid');
    } catch (error) {
      console.error('Failed to check purchase status:', error);
      return false;
    }
  },
};
