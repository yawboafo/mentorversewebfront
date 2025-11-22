import { apiClient } from './client';
import type { Mentor, MentorApplication, MentorDashboard } from './types';

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
    return apiClient.post<Mentor>('/mentor/apply', data);
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
};
