import { apiClient } from './client';
import type { MentorApplicationAdmin, Content } from './types';

export const adminApi = {
  async getMentorApplications(): Promise<MentorApplicationAdmin[]> {
    return apiClient.get<MentorApplicationAdmin[]>('/admin/mentor-applications');
  },

  async approveMentorApplication(mentorId: string): Promise<void> {
    return apiClient.post(`/admin/mentor-applications/${mentorId}/approve`);
  },

  async rejectMentorApplication(mentorId: string): Promise<void> {
    return apiClient.post(`/admin/mentor-applications/${mentorId}/reject`);
  },

  async updateContentStatus(contentId: string, status: 'published' | 'archived'): Promise<Content> {
    return apiClient.patch<Content>(`/admin/content/${contentId}`, { status });
  },
};
