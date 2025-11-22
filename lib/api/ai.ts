import { apiClient } from './client';
import type { AiSession, AiMessage, CreateSessionRequest, SendMessageRequest, CourseIdea, ContentDraft } from './types';

export const aiApi = {
  async getSessions(): Promise<AiSession[]> {
    return apiClient.get<AiSession[]>('/ai/chat/sessions');
  },

  async getSession(sessionId: string): Promise<AiSession> {
    return apiClient.get<AiSession>(`/ai/chat/sessions/${sessionId}`);
  },

  async createSession(data: CreateSessionRequest): Promise<AiSession> {
    return apiClient.post<AiSession>('/ai/chat/sessions', data);
  },

  async getMessages(sessionId: string): Promise<AiMessage[]> {
    return apiClient.get<AiMessage[]>(`/ai/chat/sessions/${sessionId}/messages`);
  },

  async sendMessage(sessionId: string, message: string): Promise<AiMessage> {
    return apiClient.post<AiMessage>(`/ai/chat/sessions/${sessionId}/messages`, { message });
  },

  async getSessionHistory(sessionId: string): Promise<{ messages: AiMessage[] }> {
    const messages = await this.getMessages(sessionId);
    return { messages };
  },

  // AI Content Builder endpoints
  async generateContentIdeas(data: {
    prompt: string;
    target_audience?: string;
    focus_areas?: string[];
  }): Promise<{ ideas: CourseIdea[] }> {
    return apiClient.post('/ai/content/ideas', data);
  },

  async generateContentDraft(data: {
    title: string;
    target_audience?: string;
    problem_it_solves?: string;
    outline?: string;
    delivery_modes?: string[];
    level?: string;
    content_type?: string;
  }): Promise<ContentDraft> {
    return apiClient.post('/ai/content/draft', data);
  },

  async refineContent(data: {
    content_id?: string;
    draft?: any;
    instructions: string;
    focus_fields?: string[];
  }): Promise<ContentDraft> {
    return apiClient.post('/ai/content/refine', data);
  },
};
