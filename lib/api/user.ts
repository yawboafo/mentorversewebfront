import { apiClient } from './client';
import type { User } from './types';

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
}

export const userApi = {
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/me');
  },

  async updateUser(data: UpdateUserRequest): Promise<User> {
    return apiClient.patch<User>('/me', data);
  },

  async getUserById(userId: string): Promise<User> {
    return apiClient.get<User>(`/users/${userId}`);
  },
};
