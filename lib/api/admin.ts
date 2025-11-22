import { apiClient } from './client';
import type { MentorApplicationAdmin, Content } from './types';

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'mentor' | 'admin';
  accountType: 'individual' | 'business';
  onboardingCompleted: boolean;
  createdAt: string;
  avatarUrl?: string;
  country?: string;
}

interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  role?: 'user' | 'mentor' | 'admin';
  accountType?: 'individual' | 'business';
}

export const adminApi = {
  // Mentor Applications (Pending)
  async getMentorApplications(): Promise<MentorApplicationAdmin[]> {
    return apiClient.get<MentorApplicationAdmin[]>('/admin/mentor-applications');
  },

  async approveMentorApplication(mentorId: string): Promise<void> {
    return apiClient.post(`/admin/mentor-applications/${mentorId}/approve`);
  },

  async rejectMentorApplication(mentorId: string): Promise<void> {
    return apiClient.post(`/admin/mentor-applications/${mentorId}/reject`);
  },

  // All Mentors Management
  async getAllMentors(params?: { page?: number; limit?: number; status?: string }): Promise<{ data: MentorApplicationAdmin[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    return apiClient.get<{ data: MentorApplicationAdmin[]; total: number; page: number; limit: number }>(
      `/admin/mentors${queryString ? `?${queryString}` : ''}`
    );
  },

  async suspendMentor(mentorId: string): Promise<void> {
    return apiClient.post(`/admin/mentors/${mentorId}/suspend`);
  },

  async unsuspendMentor(mentorId: string): Promise<void> {
    return apiClient.post(`/admin/mentors/${mentorId}/unsuspend`);
  },

  async deleteMentor(mentorId: string): Promise<void> {
    return apiClient.delete(`/admin/mentors/${mentorId}`);
  },

  // Content Management
  async updateContentStatus(contentId: string, status: 'published' | 'archived'): Promise<Content> {
    return apiClient.patch<Content>(`/admin/content/${contentId}`, { status });
  },

  async deleteContent(contentId: string): Promise<void> {
    return apiClient.delete(`/admin/content/${contentId}`);
  },

  // User Management
  async getUsers(params?: { page?: number; limit?: number; role?: string }): Promise<{ data: AdminUser[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    
    const queryString = queryParams.toString();
    return apiClient.get<{ data: AdminUser[]; total: number; page: number; limit: number }>(
      `/admin/users${queryString ? `?${queryString}` : ''}`
    );
  },

  async getUser(userId: string): Promise<AdminUser> {
    return apiClient.get<AdminUser>(`/admin/users/${userId}`);
  },

  async updateUser(userId: string, data: UpdateUserRequest): Promise<AdminUser> {
    return apiClient.patch<AdminUser>(`/admin/users/${userId}`, data);
  },

  async deleteUser(userId: string): Promise<void> {
    return apiClient.delete(`/admin/users/${userId}`);
  },

  async suspendUser(userId: string): Promise<AdminUser> {
    return apiClient.post<AdminUser>(`/admin/users/${userId}/suspend`);
  },

  async unsuspendUser(userId: string): Promise<AdminUser> {
    return apiClient.post<AdminUser>(`/admin/users/${userId}/unsuspend`);
  },
};
