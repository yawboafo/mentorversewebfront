# Messaging API Implementation Specification

## Overview
Implement mentor-mentee messaging system with conversations and messages.

## Database Schema

### Messages Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_read ON messages(read_at) WHERE read_at IS NULL;
```

### Conversations Table
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mentor_id, mentee_id)
);

CREATE INDEX idx_conversations_mentor ON conversations(mentor_id);
CREATE INDEX idx_conversations_mentee ON conversations(mentee_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
```

---

## API Endpoints

### 1. Get All Conversations
**Endpoint:** `GET /api/messages/conversations`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional, default: 50): Number of conversations to return
- `offset` (optional, default: 0): Pagination offset

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "conversation-uuid",
      "mentorId": "mentor-uuid",
      "menteeId": "mentee-uuid",
      "lastMessageAt": "2025-11-25T10:30:00Z",
      "lastMessage": "Thanks for the guidance!",
      "unreadCount": 3,
      "mentor": {
        "id": "mentor-uuid",
        "fullName": "John Mentor",
        "profilePictureUrl": "https://...",
        "areasOfExpertise": ["Software Engineering", "Product Management"]
      },
      "mentee": {
        "id": "mentee-uuid",
        "fullName": "Jane Mentee",
        "profilePictureUrl": "https://..."
      },
      "createdAt": "2025-11-20T08:00:00Z",
      "updatedAt": "2025-11-25T10:30:00Z"
    }
  ],
  "meta": {
    "total": 15,
    "limit": 50,
    "offset": 0
  }
}
```

**Business Logic:**
- Return conversations where user is either mentor or mentee
- Order by `last_message_at DESC` (most recent first)
- Calculate `unreadCount` as messages where `recipient_id = current_user` AND `read_at IS NULL`
- Include last message preview (content field from most recent message)
- Join with users table to get mentor and mentee details

---

### 2. Get or Create Conversation with Mentor
**Endpoint:** `GET /api/messages/conversations/:mentorId`

**Authentication:** Required

**Path Parameters:**
- `mentorId`: UUID of the mentor

**Response:** `200 OK`
```json
{
  "conversation": {
    "id": "conversation-uuid",
    "mentorId": "mentor-uuid",
    "menteeId": "current-user-uuid",
    "lastMessageAt": "2025-11-25T10:30:00Z",
    "unreadCount": 2,
    "mentor": {
      "id": "mentor-uuid",
      "fullName": "John Mentor",
      "profilePictureUrl": "https://...",
      "areasOfExpertise": ["Software Engineering"]
    },
    "mentee": {
      "id": "current-user-uuid",
      "fullName": "Current User",
      "profilePictureUrl": "https://..."
    },
    "createdAt": "2025-11-20T08:00:00Z",
    "updatedAt": "2025-11-25T10:30:00Z"
  },
  "messages": [
    {
      "id": "message-uuid-1",
      "conversationId": "conversation-uuid",
      "senderId": "current-user-uuid",
      "recipientId": "mentor-uuid",
      "content": "Hi! I'd like to ask about career transitions.",
      "readAt": "2025-11-25T09:00:00Z",
      "createdAt": "2025-11-25T08:55:00Z",
      "updatedAt": "2025-11-25T08:55:00Z"
    },
    {
      "id": "message-uuid-2",
      "conversationId": "conversation-uuid",
      "senderId": "mentor-uuid",
      "recipientId": "current-user-uuid",
      "content": "Sure! What would you like to know?",
      "readAt": null,
      "createdAt": "2025-11-25T09:15:00Z",
      "updatedAt": "2025-11-25T09:15:00Z"
    }
  ],
  "hasMore": false,
  "totalMessages": 2
}
```

**Business Logic:**
- Check if conversation exists between current user and mentor
  - If current user is mentor: `mentor_id = current_user AND mentee_id = mentorId`
  - If current user is mentee: `mentor_id = mentorId AND mentee_id = current_user`
- If not exists, create new conversation (empty messages array)
- Return up to 50 most recent messages (ordered by created_at ASC)
- Check messaging permissions via mentor access control
- **IMPORTANT:** Determine mentor/mentee roles correctly:
  - If `mentorId` param matches a mentor user → current user is mentee
  - If current user is a mentor and `mentorId` matches a mentee → current user is mentor

**Error Responses:**
- `403 Forbidden`: User doesn't have messaging access (no active subscription)
```json
{
  "error": "FORBIDDEN",
  "message": "You need an active subscription to message this mentor"
}
```
- `404 Not Found`: Mentor doesn't exist

---

### 3. Get Messages for Conversation
**Endpoint:** `GET /api/messages/conversations/:mentorId/messages`

**Authentication:** Required

**Path Parameters:**
- `mentorId`: UUID of the mentor (determines conversation)

**Query Parameters:**
- `limit` (optional, default: 50): Number of messages to return
- `offset` (optional, default: 0): Pagination offset
- `before` (optional): ISO timestamp - get messages before this time (for loading older messages)

**Response:** `200 OK`
```json
{
  "conversation": { /* same as above */ },
  "messages": [ /* array of messages */ ],
  "hasMore": true,
  "totalMessages": 127
}
```

**Business Logic:**
- Same conversation lookup logic as endpoint #2
- Order messages by `created_at ASC` (oldest first)
- Support pagination with `before` parameter for infinite scroll

---

### 4. Send Message
**Endpoint:** `POST /api/messages/conversations/:mentorId/messages`

**Authentication:** Required

**Path Parameters:**
- `mentorId`: UUID of the mentor

**Request Body:**
```json
{
  "content": "This is my message text"
}
```

**Validation:**
- `content`: Required, string, 1-10000 characters
- Trim whitespace
- Reject empty messages

**Response:** `201 Created`
```json
{
  "id": "new-message-uuid",
  "conversationId": "conversation-uuid",
  "senderId": "current-user-uuid",
  "recipientId": "mentor-uuid",
  "content": "This is my message text",
  "readAt": null,
  "createdAt": "2025-11-25T11:00:00Z",
  "updatedAt": "2025-11-25T11:00:00Z"
}
```

**Business Logic:**
1. Check messaging permissions (subscription required for paid mentors)
2. Check message limits (if mentor has `messageLimitPerPeriod` set)
   - Count messages sent by current user in current billing period
   - Reject if limit exceeded
3. Get or create conversation (same logic as endpoint #2)
4. Create message record
5. Update conversation `last_message_at` and `updated_at`
6. Return created message

**Error Responses:**
- `403 Forbidden`: No messaging access or limit exceeded
```json
{
  "error": "LIMIT_EXCEEDED",
  "message": "You've reached your message limit of 10 messages per month"
}
```
- `400 Bad Request`: Invalid content

---

### 5. Mark Messages as Read
**Endpoint:** `POST /api/messages/conversations/:mentorId/read`

**Authentication:** Required

**Path Parameters:**
- `mentorId`: UUID of the mentor

**Request Body:**
```json
{
  "messageIds": ["message-uuid-1", "message-uuid-2"]
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

**Business Logic:**
- Update `read_at` to current timestamp for specified messages
- Only mark messages where `recipient_id = current_user`
- Ignore already-read messages

---

### 6. Mark All Messages in Conversation as Read
**Endpoint:** `POST /api/messages/conversations/:mentorId/read-all`

**Authentication:** Required

**Path Parameters:**
- `mentorId`: UUID of the mentor

**Request Body:** `{}` (empty)

**Response:** `200 OK`
```json
{
  "success": true
}
```

**Business Logic:**
- Find conversation between current user and mentor
- Update `read_at` for all unread messages where `recipient_id = current_user`

---

## Permission Checks

### Access Control
Before allowing any messaging operation, verify:

1. **For Paid Mentors (accessType = 'PAID'):**
   - User must have active subscription to mentor
   - Check `paid_mentor_subscriptions` table:
     ```sql
     SELECT * FROM paid_mentor_subscriptions
     WHERE mentee_id = :current_user
     AND mentor_id = :mentor_id
     AND status = 'active'
     AND (expires_at IS NULL OR expires_at > NOW())
     ```

2. **For VIP Mentors (accessType = 'VIP'):**
   - Return 403 - VIP mentors don't allow messaging

3. **For Open Mentors (accessType = 'OPEN'):**
   - If `allowsMessaging = true`: Allow messaging
   - If `allowsMessaging = false`: Return 403

4. **Message Limits:**
   - If `messageLimitPerPeriod` is set, count messages in current period:
     ```sql
     SELECT COUNT(*) FROM messages
     WHERE sender_id = :current_user
     AND conversation_id = :conversation_id
     AND created_at >= :billing_period_start
     ```

### Permission Error Response
```json
{
  "error": "MESSAGING_DENIED",
  "message": "You need an active subscription to message this mentor",
  "details": {
    "accessType": "PAID",
    "allowsMessaging": true,
    "requiresSubscription": true
  }
}
```

---

## Implementation Notes

### TypeScript Types (Backend)
```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  id: string;
  mentorId: string;
  menteeId: string;
  lastMessageAt?: string;
  lastMessage?: string;
  unreadCount: number;
  mentor: {
    id: string;
    fullName: string;
    profilePictureUrl?: string;
    areasOfExpertise?: string[];
  };
  mentee: {
    id: string;
    fullName: string;
    profilePictureUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ConversationMessages {
  conversation: Conversation;
  messages: Message[];
  hasMore: boolean;
  totalMessages: number;
}
```

### Performance Optimization
- Use database indexes on conversation and message lookups
- Cache unread counts with Redis (optional)
- Consider pagination for large message histories
- Use database triggers to update `last_message_at` automatically

### Security
- Ensure users can only:
  - Read messages where they are sender OR recipient
  - Send messages in conversations where they are a participant
  - Mark their own received messages as read
- Validate all UUIDs to prevent injection
- Rate limit message sending (e.g., 10 messages per minute per user)

### Future Enhancements (Not Required Now)
- WebSocket support for real-time updates
- Message attachments (images, files)
- Typing indicators
- Message reactions/emojis
- Message editing/deletion
- Push notifications for new messages
- Message search functionality

---

## Testing Checklist

- [ ] Mentee can message subscribed mentor
- [ ] Mentor can reply to mentee
- [ ] Unread counts update correctly
- [ ] Read receipts work properly
- [ ] Message limits enforced correctly
- [ ] Pagination works for long conversations
- [ ] Access control blocks unauthorized messaging
- [ ] Conversation creation is idempotent (no duplicates)
- [ ] Messages ordered chronologically
- [ ] Last message preview updates in conversations list
- [ ] Both mentor and mentee see same conversation

---

## API Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | List all user's conversations |
| GET | `/api/messages/conversations/:mentorId` | Get/create conversation with mentor |
| GET | `/api/messages/conversations/:mentorId/messages` | Get messages (with pagination) |
| POST | `/api/messages/conversations/:mentorId/messages` | Send new message |
| POST | `/api/messages/conversations/:mentorId/read` | Mark specific messages as read |
| POST | `/api/messages/conversations/:mentorId/read-all` | Mark all conversation messages as read |

---

## Database Migration Script

```sql
-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_conversation UNIQUE(mentor_id, mentee_id)
);

CREATE INDEX idx_conversations_mentor ON conversations(mentor_id);
CREATE INDEX idx_conversations_mentee ON conversations(mentee_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC NULLS LAST);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_created ON messages(created_at ASC);
CREATE INDEX idx_messages_unread ON messages(recipient_id, read_at) WHERE read_at IS NULL;

-- Trigger to update conversation's last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();
```
