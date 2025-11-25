import { apiClient } from './client';
import {
  MentorSettings,
  MentorSettingsResponse,
  MentorAccessStatus,
  SubscribeResponse,
  PaidMentorSubscription,
  PaidSubscriptionsListResponse,
  PaidSubscriptionStatus,
} from './types';

export const mentorSubscriptionsApi = {
  /**
   * Get mentor's own settings (mentor-only)
   */
  async getMentorSettings(): Promise<MentorSettingsResponse> {
    return apiClient.get<MentorSettingsResponse>('/mentor/me/settings');
  },

  /**
   * Update mentor's settings (mentor-only)
   */
  async updateMentorSettings(
    settings: Partial<MentorSettings>
  ): Promise<MentorSettingsResponse> {
    return apiClient.post<MentorSettingsResponse>('/mentor/me/settings', settings);
  },

  /**
   * Get public mentor settings
   */
  async getPublicMentorSettings(mentorId: string): Promise<MentorSettingsResponse> {
    return apiClient.get<MentorSettingsResponse>(`/mentors/${mentorId}/settings`);
  },

  /**
   * Check access permissions for a mentor
   */
  async checkMentorAccess(mentorId: string): Promise<{ success: boolean; data: MentorAccessStatus }> {
    return apiClient.get<{ success: boolean; data: MentorAccessStatus }>(`/mentors/${mentorId}/access`);
  },

  /**
   * Subscribe to a paid mentor
   */
  async subscribeToPaidMentor(mentorId: string): Promise<SubscribeResponse> {
    return apiClient.post<SubscribeResponse>(`/mentors/${mentorId}/subscribe-paid`);
  },

  /**
   * Cancel a paid subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; subscription: PaidMentorSubscription; message: string }> {
    return apiClient.post<{ success: boolean; subscription: PaidMentorSubscription; message: string }>(
      `/subscriptions/${subscriptionId}/cancel`
    );
  },

  /**
   * Get user's paid subscriptions
   */
  async getMyPaidSubscriptions(filters?: {
    status?: PaidSubscriptionStatus;
    limit?: number;
    offset?: number;
  }): Promise<PaidSubscriptionsListResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    return apiClient.get<PaidSubscriptionsListResponse>(
      `/me/paid-subscriptions${queryString ? `?${queryString}` : ''}`
    );
  },

  /**
   * Get mentor's paid subscribers (mentor-only)
   */
  async getMentorPaidSubscribers(filters?: {
    status?: PaidSubscriptionStatus;
    limit?: number;
    offset?: number;
  }): Promise<PaidSubscriptionsListResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    return apiClient.get<PaidSubscriptionsListResponse>(
      `/mentor/paid-subscribers${queryString ? `?${queryString}` : ''}`
    );
  },

  /**
   * Check subscription status for a specific mentor
   */
  async checkSubscriptionStatus(mentorId: string): Promise<{
    success: boolean;
    hasActiveSubscription: boolean;
    subscription: PaidMentorSubscription | null;
  }> {
    return apiClient.get<{
      success: boolean;
      hasActiveSubscription: boolean;
      subscription: PaidMentorSubscription | null;
    }>(`/mentors/${mentorId}/subscription-status`);
  },
};
