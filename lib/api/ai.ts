import { apiClient } from './client';
import type { AiSession, AiMessage, CreateSessionRequest, SendMessageRequest } from './types';

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

  async sendMessage(sessionId: string, data: SendMessageRequest): Promise<AiMessage> {
    return apiClient.post<AiMessage>(`/ai/chat/sessions/${sessionId}/messages`, data);
  },
};
