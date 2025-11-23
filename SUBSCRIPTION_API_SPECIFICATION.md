# Subscription API Specification
## Backend Implementation Guide

**Platform:** MentorVerse  
**Date:** November 23, 2025  
**Version:** 1.0  
**Purpose:** API specification for mentor subscription functionality

---

## Table of Contents
1. [Overview](#overview)
2. [Data Model](#data-model)
3. [API Endpoints](#api-endpoints)
4. [Database Schema](#database-schema)
5. [Business Rules](#business-rules)
6. [Error Handling](#error-handling)
7. [Implementation Notes](#implementation-notes)

---

## Overview

The subscription system allows users to subscribe to mentors, enabling them to:
- Book appointments with mentors
- Access mentor's exclusive content
- Receive updates and notifications from mentors
- Build ongoing mentorship relationships

### Key Features
- Users can subscribe to multiple mentors
- Mentors can have multiple subscribers
- Subscription tracking with timestamps
- Active/paused/ended subscription states

---

## Data Model

### Subscription Object

```json
{
  "id": "sub_123456789",
  "user_id": "usr_123456789",
  "mentor_id": "usr_987654321",
  "status": "active",
  "subscribed_at": "2025-11-20T10:30:00Z",
  "unsubscribed_at": null,
  "created_at": "2025-11-20T10:30:00Z",
  "updated_at": "2025-11-20T10:30:00Z"
}
```

**Field Descriptions:**
- `id` (string): Unique subscription identifier
- `user_id` (string): ID of the user who subscribed
- `mentor_id` (string): ID of the mentor being subscribed to
- `status` (enum): Current subscription status
  - `active`: Subscription is active
  - `paused`: Subscription temporarily paused
  - `ended`: Subscription has ended
- `subscribed_at` (timestamp): When subscription started
- `unsubscribed_at` (timestamp, nullable): When user unsubscribed
- `created_at` (timestamp): Record creation time
- `updated_at` (timestamp): Last update time

---

## API Endpoints

### 1. Get User's Subscriptions

**Endpoint:** `GET /me/subscriptions`  
**Authentication:** Required (Bearer token)  
**Description:** Retrieve all mentors the current user is subscribed to

#### Request
```http
GET /me/subscriptions HTTP/1.1
Host: api.mentorverse.com
Authorization: Bearer {access_token}
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status (active, paused, ended) |
| limit | integer | No | Number of results per page (default: 20) |
| offset | integer | No | Pagination offset (default: 0) |

#### Response (200 OK)
```json
{
  "data": [
    {
      "id": "54924a48-e3fd-44d0-8dd4-09a229d0e47b",
      "user": {
        "id": "54924a48-e3fd-44d0-8dd4-09a229d0e47b",
        "fullName": "Dr. Sarah Johnson",
        "email": "sarah.johnson@example.com",
        "profilePhoto": "https://storage.mentorverse.com/avatars/sarah.jpg"
      },
      "bio": "Senior Software Architect with 15+ years of experience...",
      "expertise": ["React", "Node.js", "System Design", "Career Coaching"],
      "yearsOfExperience": 15,
      "hourlyRate": 150.00,
      "rating": 4.8,
      "totalReviews": 127,
      "totalStudents": 45,
      "availability": "available",
      "subscribedAt": "2025-11-20T10:30:00Z",
      "subscriptionStatus": "active"
    },
    {
      "id": "abc123-def456-ghi789",
      "user": {
        "id": "abc123-def456-ghi789",
        "fullName": "Michael Chen",
        "email": "michael.chen@example.com",
        "profilePhoto": "https://storage.mentorverse.com/avatars/michael.jpg"
      },
      "bio": "Product Manager turned entrepreneur...",
      "expertise": ["Product Management", "Startups", "Leadership"],
      "yearsOfExperience": 10,
      "hourlyRate": 120.00,
      "rating": 4.9,
      "totalReviews": 89,
      "totalStudents": 32,
      "availability": "available",
      "subscribedAt": "2025-11-15T14:20:00Z",
      "subscriptionStatus": "active"
    }
  ],
  "meta": {
    "total": 2,
    "limit": 20,
    "offset": 0
  }
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired access token"
}
```

**500 Internal Server Error**
```json
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred"
}
```

---

### 2. Subscribe to a Mentor

**Endpoint:** `POST /mentors/{mentorId}/subscribe`  
**Authentication:** Required (Bearer token)  
**Description:** Subscribe the current user to a specific mentor

#### Request
```http
POST /mentors/54924a48-e3fd-44d0-8dd4-09a229d0e47b/subscribe HTTP/1.1
Host: api.mentorverse.com
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mentorId | string | Yes | The unique ID of the mentor |

#### Request Body
```json
{}
```
*No body required - subscription is created for authenticated user*

#### Response (201 Created)
```json
{
  "message": "Successfully subscribed to mentor",
  "subscription": {
    "id": "sub_987654321",
    "mentorId": "54924a48-e3fd-44d0-8dd4-09a229d0e47b",
    "userId": "usr_123456789",
    "status": "active",
    "subscribedAt": "2025-11-23T10:30:00Z"
  },
  "mentor": {
    "id": "54924a48-e3fd-44d0-8dd4-09a229d0e47b",
    "fullName": "Dr. Sarah Johnson",
    "profilePhoto": "https://storage.mentorverse.com/avatars/sarah.jpg",
    "expertise": ["React", "Node.js", "System Design"]
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "error": "ALREADY_SUBSCRIBED",
  "message": "You are already subscribed to this mentor"
}
```

**400 Bad Request**
```json
{
  "error": "CANNOT_SUBSCRIBE_TO_SELF",
  "message": "You cannot subscribe to yourself"
}
```

**404 Not Found**
```json
{
  "error": "MENTOR_NOT_FOUND",
  "message": "The specified mentor does not exist"
}
```

**401 Unauthorized**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

---

### 3. Unsubscribe from a Mentor

**Endpoint:** `POST /mentors/{mentorId}/unsubscribe`  
**Authentication:** Required (Bearer token)  
**Description:** Unsubscribe the current user from a specific mentor

#### Request
```http
POST /mentors/54924a48-e3fd-44d0-8dd4-09a229d0e47b/unsubscribe HTTP/1.1
Host: api.mentorverse.com
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mentorId | string | Yes | The unique ID of the mentor |

#### Request Body
```json
{}
```

#### Response (200 OK)
```json
{
  "message": "Successfully unsubscribed from mentor",
  "subscription": {
    "id": "sub_987654321",
    "mentorId": "54924a48-e3fd-44d0-8dd4-09a229d0e47b",
    "userId": "usr_123456789",
    "status": "ended",
    "subscribedAt": "2025-11-20T10:30:00Z",
    "unsubscribedAt": "2025-11-23T15:45:00Z"
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "error": "NOT_SUBSCRIBED",
  "message": "You are not subscribed to this mentor"
}
```

**404 Not Found**
```json
{
  "error": "MENTOR_NOT_FOUND",
  "message": "The specified mentor does not exist"
}
```

**401 Unauthorized**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

---

### 4. Check Subscription Status

**Endpoint:** `GET /mentors/{mentorId}/subscription-status`  
**Authentication:** Required (Bearer token)  
**Description:** Check if the current user is subscribed to a specific mentor

#### Request
```http
GET /mentors/54924a48-e3fd-44d0-8dd4-09a229d0e47b/subscription-status HTTP/1.1
Host: api.mentorverse.com
Authorization: Bearer {access_token}
```

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mentorId | string | Yes | The unique ID of the mentor |

#### Response (200 OK) - Subscribed
```json
{
  "is_subscribed": true,
  "subscription": {
    "id": "sub_987654321",
    "status": "active",
    "subscribed_at": "2025-11-20T10:30:00Z"
  }
}
```

#### Response (200 OK) - Not Subscribed
```json
{
  "is_subscribed": false,
  "subscription": null
}
```

#### Error Responses

**404 Not Found**
```json
{
  "error": "MENTOR_NOT_FOUND",
  "message": "The specified mentor does not exist"
}
```

**401 Unauthorized**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

---

### 5. Get Mentor's Subscribers (Mentor Only)

**Endpoint:** `GET /mentor/subscribers`  
**Authentication:** Required (Bearer token + Mentor role)  
**Description:** Get list of users subscribed to the authenticated mentor

#### Request
```http
GET /mentor/subscribers HTTP/1.1
Host: api.mentorverse.com
Authorization: Bearer {access_token}
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status (active, paused, ended) |
| limit | integer | No | Number of results per page (default: 20) |
| offset | integer | No | Pagination offset (default: 0) |

#### Response (200 OK)
```json
{
  "data": [
    {
      "id": "usr_123456789",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "profilePhoto": "https://storage.mentorverse.com/avatars/john.jpg",
      "subscription": {
        "id": "sub_987654321",
        "status": "active",
        "subscribedAt": "2025-11-20T10:30:00Z"
      }
    },
    {
      "id": "usr_111222333",
      "fullName": "Jane Smith",
      "email": "jane.smith@example.com",
      "profilePhoto": "https://storage.mentorverse.com/avatars/jane.jpg",
      "subscription": {
        "id": "sub_444555666",
        "status": "active",
        "subscribedAt": "2025-11-18T09:15:00Z"
      }
    }
  ],
  "meta": {
    "total": 45,
    "limit": 20,
    "offset": 0
  }
}
```

#### Error Responses

**403 Forbidden**
```json
{
  "error": "FORBIDDEN",
  "message": "Only mentors can access this endpoint"
}
```

---

## Database Schema

### subscriptions Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_mentor_subscription UNIQUE(user_id, mentor_id),
  CONSTRAINT check_status CHECK (status IN ('active', 'paused', 'ended')),
  CONSTRAINT check_not_self_subscription CHECK (user_id != mentor_id),
  
  -- Indexes
  INDEX idx_subscriptions_user_id (user_id),
  INDEX idx_subscriptions_mentor_id (mentor_id),
  INDEX idx_subscriptions_status (status),
  INDEX idx_subscriptions_subscribed_at (subscribed_at)
);
```

### Key Constraints
1. **Unique Constraint**: A user can only have one subscription record per mentor
2. **Self-Subscription Check**: Prevents users from subscribing to themselves
3. **Cascade Delete**: Subscriptions are deleted if user or mentor is deleted
4. **Status Values**: Only 'active', 'paused', or 'ended' allowed

### Indexes
- `user_id`: Fast lookup of user's subscriptions
- `mentor_id`: Fast lookup of mentor's subscribers
- `status`: Efficient filtering by subscription status
- `subscribed_at`: Chronological ordering

---

## Business Rules

### Subscription Creation
1. **Authentication Required**: User must be logged in
2. **No Self-Subscription**: Users cannot subscribe to themselves
3. **Mentor Must Exist**: Target mentor must be a valid user with mentor role
4. **No Duplicates**: Check if subscription already exists before creating
5. **Automatic Status**: New subscriptions start with 'active' status

### Subscription Cancellation
1. **Must Be Subscribed**: Can only unsubscribe from existing subscriptions
2. **Status Update**: Change status to 'ended' rather than deleting record
3. **Timestamp**: Record `unsubscribed_at` timestamp
4. **History Preservation**: Keep subscription records for analytics

### Subscription Status
1. **Active**: User can book appointments and access content
2. **Paused**: Temporary pause (future feature)
3. **Ended**: Subscription terminated

### Access Control
1. Users can view their own subscriptions
2. Mentors can view their own subscribers
3. Admins can view all subscriptions
4. Users cannot view other users' subscriptions

---

## Error Handling

### Standard Error Response Format
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    // Optional additional context
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid authentication token |
| FORBIDDEN | 403 | User lacks required permissions |
| MENTOR_NOT_FOUND | 404 | Specified mentor does not exist |
| NOT_FOUND | 404 | Resource not found |
| ALREADY_SUBSCRIBED | 400 | User is already subscribed to this mentor |
| NOT_SUBSCRIBED | 400 | User is not subscribed to this mentor |
| CANNOT_SUBSCRIBE_TO_SELF | 400 | User attempted to subscribe to themselves |
| INVALID_MENTOR_ID | 400 | Mentor ID format is invalid |
| VALIDATION_ERROR | 400 | Request validation failed |
| INTERNAL_ERROR | 500 | Unexpected server error |

---

## Implementation Notes

### 1. Performance Considerations

**Query Optimization**
- Use database indexes on foreign keys
- Implement pagination for list endpoints
- Consider caching frequent queries (user's subscription list)
- Use JOIN operations efficiently when fetching mentor details

**Example Optimized Query**
```sql
SELECT 
  s.id,
  s.status,
  s.subscribed_at,
  m.id as mentor_id,
  u.full_name,
  u.email,
  u.profile_photo,
  mp.bio,
  mp.expertise,
  mp.years_of_experience,
  mp.hourly_rate,
  mp.rating,
  mp.total_reviews
FROM subscriptions s
JOIN users u ON u.id = s.mentor_id
JOIN mentor_profiles mp ON mp.user_id = s.mentor_id
WHERE s.user_id = $1 
  AND s.status = 'active'
ORDER BY s.subscribed_at DESC
LIMIT $2 OFFSET $3;
```

### 2. Validation Rules

**Mentor ID Validation**
```python
# Pseudo-code
def validate_mentor_id(mentor_id):
    # Check UUID format
    if not is_valid_uuid(mentor_id):
        raise ValidationError("Invalid mentor ID format")
    
    # Check mentor exists
    mentor = db.query(User).filter(
        User.id == mentor_id,
        User.role == 'mentor'
    ).first()
    
    if not mentor:
        raise NotFoundError("Mentor not found")
    
    return mentor
```

**Self-Subscription Check**
```python
def check_self_subscription(user_id, mentor_id):
    if user_id == mentor_id:
        raise ValidationError("Cannot subscribe to yourself")
```

### 3. Transaction Handling

Wrap subscription operations in database transactions:

```python
# Pseudo-code
@db.transaction
def subscribe_to_mentor(user_id, mentor_id):
    # Check if already subscribed
    existing = db.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.mentor_id == mentor_id,
        Subscription.status == 'active'
    ).first()
    
    if existing:
        raise AlreadySubscribedError()
    
    # Create new subscription
    subscription = Subscription(
        user_id=user_id,
        mentor_id=mentor_id,
        status='active',
        subscribed_at=now()
    )
    db.add(subscription)
    db.commit()
    
    # Trigger notifications (async)
    send_subscription_notification(mentor_id, user_id)
    
    return subscription
```

### 4. Notification Integration

**On Subscribe**
- Send email to mentor: "You have a new subscriber"
- Send in-app notification to mentor
- Update mentor's subscriber count

**On Unsubscribe**
- Send email to mentor: "A user has unsubscribed"
- Update mentor's subscriber count

### 5. Analytics Events

Track the following events for analytics:

```json
{
  "event": "subscription.created",
  "timestamp": "2025-11-23T10:30:00Z",
  "data": {
    "user_id": "usr_123456789",
    "mentor_id": "54924a48-e3fd-44d0-8dd4-09a229d0e47b",
    "subscription_id": "sub_987654321"
  }
}
```

```json
{
  "event": "subscription.ended",
  "timestamp": "2025-11-23T15:45:00Z",
  "data": {
    "user_id": "usr_123456789",
    "mentor_id": "54924a48-e3fd-44d0-8dd4-09a229d0e47b",
    "subscription_id": "sub_987654321",
    "duration_days": 3
  }
}
```

### 6. Testing Checklist

**Unit Tests**
- [ ] Validate subscription creation
- [ ] Validate duplicate prevention
- [ ] Validate self-subscription prevention
- [ ] Validate unsubscribe logic
- [ ] Validate status checks

**Integration Tests**
- [ ] Subscribe to mentor (happy path)
- [ ] Subscribe when already subscribed (error)
- [ ] Subscribe to non-existent mentor (error)
- [ ] Subscribe to self (error)
- [ ] Unsubscribe from mentor (happy path)
- [ ] Unsubscribe when not subscribed (error)
- [ ] Check subscription status (subscribed)
- [ ] Check subscription status (not subscribed)
- [ ] Get user's subscriptions (empty list)
- [ ] Get user's subscriptions (with data)
- [ ] Get mentor's subscribers (mentor only)
- [ ] Get mentor's subscribers (non-mentor error)

**Performance Tests**
- [ ] List 1000+ subscriptions with pagination
- [ ] Concurrent subscribe/unsubscribe operations
- [ ] Database query performance benchmarks

### 7. Security Considerations

**Authentication**
- All endpoints require valid JWT token
- Token must not be expired
- User must exist in database

**Authorization**
- Users can only subscribe/unsubscribe themselves
- Users can only view their own subscriptions
- Mentors can only view their own subscribers
- Prevent privilege escalation attempts

**Input Validation**
- Sanitize all user inputs
- Validate UUID formats
- Prevent SQL injection (use parameterized queries)
- Rate limit subscription operations (prevent spam)

**Rate Limiting**
```
Subscribe/Unsubscribe: 10 requests per minute per user
List Subscriptions: 30 requests per minute per user
Check Status: 60 requests per minute per user
```

---

## Implementation Priority

### Phase 1: Core Functionality (MVP)
1. ✅ Database schema creation
2. ✅ POST /mentors/{id}/subscribe
3. ✅ POST /mentors/{id}/unsubscribe
4. ✅ GET /mentors/{id}/subscription-status
5. ✅ GET /me/subscriptions

### Phase 2: Enhanced Features
1. GET /mentor/subscribers (mentor view)
2. Notification system integration
3. Analytics event tracking
4. Email notifications

### Phase 3: Advanced Features
1. Subscription pause/resume functionality
2. Subscription analytics dashboard
3. Bulk subscription operations
4. Subscription recommendations

---

## API Testing Examples

### Using cURL

**Subscribe to Mentor**
```bash
curl -X POST https://api.mentorverse.com/mentors/54924a48-e3fd-44d0-8dd4-09a229d0e47b/subscribe \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Get My Subscriptions**
```bash
curl -X GET https://api.mentorverse.com/me/subscriptions \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Check Subscription Status**
```bash
curl -X GET https://api.mentorverse.com/mentors/54924a48-e3fd-44d0-8dd4-09a229d0e47b/subscription-status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Unsubscribe from Mentor**
```bash
curl -X POST https://api.mentorverse.com/mentors/54924a48-e3fd-44d0-8dd4-09a229d0e47b/unsubscribe \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

---

## Changelog

### Version 1.0 (2025-11-23)
- Initial specification
- Defined 4 core endpoints
- Database schema design
- Business rules documentation
- Error handling specifications

---

## Related Documents

- [AUTH_FLOW_DOCUMENTATION.md](./AUTH_FLOW_DOCUMENTATION.md) - Authentication flows and user management
- [FLUTTER_IMPLEMENTATION_BLUEPRINT.md](./FLUTTER_IMPLEMENTATION_BLUEPRINT.md) - Frontend UI patterns
- API_INTEGRATION.md - Complete API documentation

---

**Document Version:** 1.0  
**Last Updated:** November 23, 2025  
**Maintained by:** MentorVerse Engineering Team  
**Contact:** engineering@mentorverse.com
