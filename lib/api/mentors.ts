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
};
