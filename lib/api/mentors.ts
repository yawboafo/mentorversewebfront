import { apiClient } from './client';
import type { Mentor, MentorApplication, MentorDashboard } from './types';

export interface MentorsQuery {
  q?: string;
  tags?: string[];
}

export const mentorsApi = {
  async getMentors(query?: MentorsQuery): Promise<Mentor[]> {
    const params = new URLSearchParams();
    if (query?.q) params.append('q', query.q);
    if (query?.tags) query.tags.forEach(tag => params.append('tags', tag));
    
    const endpoint = `/mentors${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get<Mentor[] | { results: Mentor[] }>(endpoint);
    // Handle both array and paginated response formats
    return Array.isArray(response) ? response : (response.results || []);
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
