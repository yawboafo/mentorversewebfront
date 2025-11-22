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
    console.log('getMentors endpoint:', endpoint);
    const response = await apiClient.get<Mentor[] | { data: Mentor[] }>(endpoint);
    console.log('getMentors raw response:', response);
    console.log('getMentors response type:', typeof response);
    console.log('getMentors is array:', Array.isArray(response));
    // Handle both array and paginated response formats
    const result = Array.isArray(response) ? response : (response.data || []);
    console.log('getMentors final result:', result);
    return result;
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
