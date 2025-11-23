import { apiClient } from './client';
import type { Mentor, MentorApplication, MentorDashboard, MenteesResponse, UserMentorsResponse, SubscriptionStatus } from './types';

export interface MentorsQuery {
  q?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface MentorsResponse {
  data: Mentor[];
  total: number;
  page: number;
  limit: number;
}

export const mentorsApi = {
  async getMentors(query?: MentorsQuery): Promise<MentorsResponse> {
    const params = new URLSearchParams();
    if (query?.q) params.append('q', query.q);
    if (query?.tags) query.tags.forEach(tag => params.append('tags', tag));
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    
    const endpoint = `/mentors${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get<Mentor[] | MentorsResponse>(endpoint);
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

  async getMentor(mentorId: string): Promise<Mentor> {
    return apiClient.get<Mentor>(`/mentors/${mentorId}`);
  },

  async applyToBecomeMentor(data: MentorApplication): Promise<Mentor> {
    // Transform snake_case to camelCase for backend
    // Filter out empty social links
    const socialLinks: Record<string, string> = {};
    if (data.social_links) {
      Object.entries(data.social_links).forEach(([key, value]) => {
        if (value && value.trim()) {
          socialLinks[key] = value.trim();
        }
      });
    }

    const requestBody = {
      headline: data.headline.trim(),
      shortBio: data.short_bio.trim(),
      longBio: data.long_bio.trim(),
      areasOfExpertise: data.areas_of_expertise,
      experienceYears: Number(data.experience_years),
      languages: data.languages,
      socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : {}
    };
    
    console.log('📤 Mentor application request body:', requestBody);
    console.log('📊 Request validation:', {
      headlineLength: requestBody.headline.length,
      shortBioLength: requestBody.shortBio.length,
      longBioLength: requestBody.longBio.length,
      areasCount: requestBody.areasOfExpertise.length,
      languagesCount: requestBody.languages.length,
      experienceYears: requestBody.experienceYears
    });
    
    return apiClient.post<Mentor>('/mentor/apply', requestBody);
  },

  async getCurrentMentorProfile(): Promise<Mentor> {
    return apiClient.get<Mentor>('/mentor/me');
  },

  async updateCurrentMentorProfile(data: Partial<MentorApplication>): Promise<Mentor> {
    return apiClient.patch<Mentor>('/mentor/me', data);
  },

  async getMentorDashboard(): Promise<MentorDashboard> {
    return apiClient.get<MentorDashboard>('/mentor/dashboard');
  },

  async checkMentorApplicationStatus(): Promise<{ hasApplication: boolean; status: 'pending' | 'approved' | 'rejected' | null }> {
    try {
      const profile = await apiClient.get<Mentor>('/mentor/me');
      return { hasApplication: true, status: profile.status === 'active' ? 'approved' : 'pending' };
    } catch (err: any) {
      if (err.status === 404) {
        return { hasApplication: false, status: null };
      }
      throw err;
    }
  },

  // =============== MENTORSHIP API (v2.2.0) ===============
  
  /**
   * Get mentor's mentees (students who purchased their content)
   * @param query - Optional filters: page, limit, status, search
   */
  async getMentees(query?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'paused' | 'ended';
    search?: string;
  }): Promise<MenteesResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.status) params.append('status', query.status);
    if (query?.search) params.append('search', query.search);
    
    const endpoint = `/mentor/mentees${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get<MenteesResponse>(endpoint);
  },

  /**
   * Get current user's mentors (subscribed mentors)
   */
  async getMyMentors(): Promise<UserMentorsResponse> {
    return apiClient.get<UserMentorsResponse>('/me/subscriptions');
  },

  // =============== SUBSCRIPTION API ===============
  
  /**
   * Subscribe to a mentor
   * @param mentorId - Mentor user ID to subscribe to
   */
  async subscribeMentor(mentorId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/mentors/${mentorId}/subscribe`, {});
  },

  /**
   * Unsubscribe from a mentor
   * @param mentorId - Mentor user ID to unsubscribe from
   */
  async unsubscribeMentor(mentorId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/mentors/${mentorId}/unsubscribe`, {});
  },

  /**
   * Check subscription status with a mentor
   * @param mentorId - Mentor user ID
   */
  async checkSubscriptionStatus(mentorId: string): Promise<{ is_subscribed: boolean; subscribed_at?: string }> {
    return apiClient.get<{ is_subscribed: boolean; subscribed_at?: string }>(`/mentors/${mentorId}/subscription-status`);
  },
};
