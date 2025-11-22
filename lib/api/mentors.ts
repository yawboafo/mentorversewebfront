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
    return apiClient.get<Mentor[]>(endpoint);
  },

  async getMentor(mentorId: string): Promise<Mentor> {
    return apiClient.get<Mentor>(`/mentors/${mentorId}`);
  },

  async applyToBecomeMentor(data: MentorApplication): Promise<void> {
    return apiClient.post('/mentor/apply', data);
  },

  async getMentorDashboard(): Promise<MentorDashboard> {
    return apiClient.get<MentorDashboard>('/mentor/dashboard');
  },
};
