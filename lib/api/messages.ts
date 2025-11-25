import { apiClient } from './client';
import type { 
  Conversation, 
  ConversationMessages, 
  Message, 
  SendMessageRequest,
  ConversationsListResponse 
} from './types';

/**
 * API Client for Mentor-Mentee Messaging
 */
class MessagesApi {
  /**
   * Get all conversations for the current user
   */
  async getConversations(params?: { limit?: number; offset?: number }): Promise<ConversationsListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<ConversationsListResponse>(`/messages/conversations${query}`);
  }

  /**
   * Get or create a conversation with a specific mentor
   */
  async getConversation(mentorId: string): Promise<ConversationMessages> {
    return apiClient.get<ConversationMessages>(`/messages/conversations/${mentorId}`);
  }

  /**
   * Get messages for a specific conversation
   */
  async getMessages(
    mentorId: string, 
    params?: { limit?: number; offset?: number; before?: string }
  ): Promise<ConversationMessages> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.before) queryParams.append('before', params.before);
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<ConversationMessages>(`/messages/conversations/${mentorId}/messages${query}`);
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(mentorId: string, content: string): Promise<Message> {
    return apiClient.post<Message>(`/messages/conversations/${mentorId}/messages`, { content });
  }

  /**
   * Mark messages as read
   */
  async markAsRead(mentorId: string, messageIds: string[]): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(`/messages/conversations/${mentorId}/read`, { messageIds });
  }

  /**
   * Mark all messages in a conversation as read
   */
  async markConversationAsRead(mentorId: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(`/messages/conversations/${mentorId}/read-all`, {});
  }
}

export const messagesApi = new MessagesApi();
