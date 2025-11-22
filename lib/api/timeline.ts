import { apiClient } from './client';

export interface TimelinePost {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  media_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTimelinePostRequest {
  content: string;
  media_urls?: string[];
}

export interface TimelineQuery {
  page?: number;
  limit?: number;
}

export const timelineApi = {
  async createPost(data: CreateTimelinePostRequest): Promise<TimelinePost> {
    return apiClient.post<TimelinePost>('/timeline', data);
  },

  async getFeed(query?: TimelineQuery): Promise<{ posts: TimelinePost[]; total: number; page: number; limit: number }> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    
    const endpoint = `/timeline${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  async getUserTimeline(userId: string, query?: TimelineQuery): Promise<{ posts: TimelinePost[]; total: number; page: number; limit: number }> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    
    const endpoint = `/users/${userId}/timeline${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  async deletePost(postId: string): Promise<void> {
    return apiClient.delete(`/timeline/${postId}`);
  },
};
