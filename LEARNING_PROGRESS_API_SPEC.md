# Learning Progress API Specification

**Document Version:** 1.0  
**Date:** November 24, 2025  
**For:** Backend Team  
**From:** Frontend Team

---

## Executive Summary

The frontend has implemented a complete "Continue Learning" experience for MentorVerse, including:
- Enhanced post-purchase confirmation screen
- Dashboard section showing active courses with progress
- Course detail pages displaying learning progress
- Milestone celebrations and progress tracking

**All learning progress features are currently using MOCK data.** This document specifies the backend APIs needed to make these features fully functional.

---

## Frontend Implementation Overview

### 1. Components Implemented

| Component | Location | Purpose |
|-----------|----------|---------|
| **Payment Success Page** | `app/payment/success/page.tsx` | Premium post-purchase confirmation with course preview |
| **Continue Learning Widget** | `components/dashboard/continue-learning.tsx` | Dashboard section showing active courses |
| **Course Detail Enhancements** | `app/content/[id]/page.tsx` | Progress display and dynamic CTAs for purchased courses |
| **Progress UI Component** | `components/ui/progress.tsx` | Reusable progress bar component |
| **Learning API Client** | `lib/api/learning.ts` | Mock API layer (needs backend implementation) |

### 2. User Experience Flow

```
Purchase Course
    ↓
Payment Success Screen (with "Start Course" CTA)
    ↓
Dashboard (shows course in "Continue Learning" section)
    ↓
Click "Continue" or "Start Course"
    ↓
Course Detail Page (shows progress bar, next lesson, milestones)
    ↓
Access course content (progress tracked automatically)
    ↓
Dashboard updates with latest progress
```

---

## Required Backend APIs

All endpoints should follow existing authentication patterns (Bearer token in `Authorization` header).

### Authentication
- All endpoints require authenticated user
- Use existing JWT token validation
- Return 401 for unauthenticated requests
- Return 403 if user doesn't own the course

---

## API Endpoint Specifications

### 1. Get Active Courses

**Endpoint:** `GET /me/learning/active`

**Purpose:** Retrieve all in-progress courses for the dashboard "Continue Learning" section

**Authentication:** Required

**Query Parameters:** None

**Success Response (200):**
```json
{
  "courses": [
    {
      "id": "active_course_123",
      "title": "Building Modern Web Applications",
      "thumbnailUrl": "https://example.com/thumbnails/course1.jpg",
      "mentor": {
        "id": "mentor_456",
        "fullName": "Dr. Kofi Mensah",
        "avatarUrl": "https://example.com/avatars/mentor1.jpg"
      },
      "progress": {
        "percent": 45,
        "currentModuleName": "Module 3: Advanced React Patterns",
        "currentResourceName": "Lesson 3.2: Custom Hooks",
        "nextResourceName": "Lesson 3.3: Context API Deep Dive",
        "lastAccessedAt": "2025-11-23T14:30:00Z"
      },
      "estimatedDuration": "8 weeks",
      "contentId": "content_789"
    }
  ]
}
```

**Business Logic:**
- Return only courses where user has a purchase with `status='paid'`
- Exclude completed courses (100% progress)
- Sort by `lastAccessedAt` DESC (most recently accessed first)
- Include courses that haven't been started (0% progress) if purchased
- Limit to 10 most recent courses (can add pagination later)

**Frontend Usage:**
- Displayed on dashboard as course cards
- Shows progress bars, mentor info, next lesson
- "Continue" button links to course detail page

---

### 2. Get Course Progress

**Endpoint:** `GET /me/learning/courses/{contentId}/progress`

**Purpose:** Get detailed progress information for a specific course

**Authentication:** Required

**Path Parameters:**
- `contentId` (string, required): The course/content ID

**Success Response (200):**
```json
{
  "id": "progress_123",
  "userId": "user_456",
  "contentId": "content_789",
  "progressPercent": 45,
  "currentModuleId": "module_003",
  "currentResourceId": "resource_007",
  "lastAccessedAt": "2025-11-23T14:30:00Z",
  "startedAt": "2025-11-15T09:00:00Z",
  "completedAt": null,
  "totalModules": 8,
  "completedModules": 3,
  "totalResources": 32,
  "completedResources": 14,
  "timeSpentMinutes": 420
}
```

**Error Response (404):**
```json
{
  "error": "Progress not found",
  "message": "User has not started this course yet"
}
```

**Error Response (403):**
```json
{
  "error": "Not authorized",
  "message": "User does not have access to this course"
}
```

**Business Logic:**
- Verify user has purchased the course (status='paid')
- Calculate `progressPercent` as: `(completedResources / totalResources) * 100`
- Return 404 if no progress record exists (course not started yet)
- `totalModules` and `totalResources` should be calculated from course structure
- `timeSpentMinutes` tracks actual learning time spent on course

**Frontend Usage:**
- Displayed on course detail page as progress bar
- Shows completion statistics
- Used to determine CTA text ("Start Course" vs "Continue Learning")
- Triggers milestone celebrations at 25%, 50%, 75%

---

### 3. Start Course

**Endpoint:** `POST /me/learning/courses/{contentId}/start`

**Purpose:** Initialize progress tracking when user first accesses a purchased course

**Authentication:** Required

**Path Parameters:**
- `contentId` (string, required): The course/content ID

**Request Body:** None

**Success Response (201):**
```json
{
  "id": "progress_new_123",
  "userId": "user_456",
  "contentId": "content_789",
  "progressPercent": 0,
  "currentModuleId": null,
  "currentResourceId": null,
  "lastAccessedAt": "2025-11-24T10:00:00Z",
  "startedAt": "2025-11-24T10:00:00Z",
  "completedAt": null,
  "totalModules": 8,
  "completedModules": 0,
  "totalResources": 32,
  "completedResources": 0,
  "timeSpentMinutes": 0
}
```

**Error Response (400):**
```json
{
  "error": "Already started",
  "message": "Progress already exists for this course",
  "existingProgress": { /* existing progress object */ }
}
```

**Error Response (403):**
```json
{
  "error": "Not purchased",
  "message": "User has not purchased this course"
}
```

**Business Logic:**
- Verify user has purchased the course before creating progress
- Should be **idempotent** - if progress exists, return existing progress
- Count total modules and resources from course structure
- Set `startedAt` and `lastAccessedAt` to current timestamp
- Initialize all counters to 0

**Frontend Usage:**
- Called when user first clicks "Start Course" button
- Creates the progress tracking record
- Subsequent visits will use GET progress endpoint

---

### 4. Update Resource Progress

**Endpoint:** `PUT /me/learning/resources/{resourceId}/progress`

**Purpose:** Update progress for a specific resource (lesson/video/document)

**Authentication:** Required

**Path Parameters:**
- `resourceId` (string, required): The resource (lesson) ID

**Request Body:**
```json
{
  "progress": 85,
  "lastPosition": 1245,
  "timeSpent": 15
}
```

**Request Body Fields:**
- `progress` (integer, 0-100, required): Percentage complete for this resource
- `lastPosition` (integer, optional): For videos, the playback position in seconds
- `timeSpent` (integer, required): Minutes spent on this resource in this session

**Success Response (200):**
```json
{
  "resourceId": "resource_007",
  "completed": false,
  "progress": 85,
  "lastPosition": 1245,
  "updatedAt": "2025-11-24T10:30:00Z",
  "courseProgress": {
    "progressPercent": 46,
    "completedResources": 14,
    "totalResources": 32
  }
}
```

**Business Logic:**
- Update or create resource progress record
- Update parent course progress:
  - Set `lastAccessedAt` to current timestamp
  - Add `timeSpent` to `timeSpentMinutes`
  - Update `currentResourceId` if different
  - Recalculate `progressPercent`
- If progress reaches 100, trigger completion logic
- Track video position for resume functionality

**Frontend Usage:**
- Called periodically while user is watching video or reading content
- Saves user's position so they can resume later
- Tracks time spent for analytics and progress calculation

---

### 5. Complete Resource

**Endpoint:** `POST /me/learning/resources/{resourceId}/complete`

**Purpose:** Mark a resource (lesson) as completed

**Authentication:** Required

**Path Parameters:**
- `resourceId` (string, required): The resource ID to mark complete

**Request Body:** None

**Success Response (200):**
```json
{
  "resourceId": "resource_007",
  "completed": true,
  "completedAt": "2025-11-24T10:45:00Z",
  "courseProgress": {
    "progressPercent": 48,
    "completedResources": 15,
    "totalResources": 32,
    "nextResourceId": "resource_008",
    "nextResourceName": "Lesson 3.4: Performance Optimization"
  },
  "milestoneUnlocked": {
    "id": "milestone_789",
    "type": "progress_50",
    "message": "You're halfway there! 🚀"
  },
  "moduleCompleted": {
    "moduleId": "module_003",
    "moduleName": "Module 3: Advanced React Patterns"
  }
}
```

**Success Response (200 - No Milestone):**
```json
{
  "resourceId": "resource_007",
  "completed": true,
  "completedAt": "2025-11-24T10:45:00Z",
  "courseProgress": {
    "progressPercent": 35,
    "completedResources": 11,
    "totalResources": 32,
    "nextResourceId": "resource_008"
  }
}
```

**Business Logic:**
- Mark resource progress as `completed=true`
- Increment `completedResources` counter on course progress
- Recalculate `progressPercent`
- Check if all resources in current module are complete:
  - If yes, increment `completedModules`
  - Return `moduleCompleted` object
- Check for milestone achievements (25%, 50%, 75%, 100%):
  - If milestone reached, create milestone record
  - Return `milestoneUnlocked` object
- Calculate and return next resource to work on

**Frontend Usage:**
- Called when user finishes a lesson/video
- Shows milestone celebration if unlocked
- Updates UI with new progress percentage
- Displays next lesson recommendation

---

### 6. Get Milestones

**Endpoint:** `GET /me/learning/courses/{contentId}/milestones`

**Purpose:** Get achievement milestones for a course

**Authentication:** Required

**Path Parameters:**
- `contentId` (string, required): The course ID

**Query Parameters:**
- `unseen` (boolean, optional): If true, only return unseen milestones. Default: false

**Success Response (200):**
```json
{
  "milestones": [
    {
      "id": "milestone_123",
      "type": "progress_25",
      "achievedAt": "2025-11-20T15:00:00Z",
      "seen": true,
      "message": "You're 1/4 done! Keep going! 🎉"
    },
    {
      "id": "milestone_456",
      "type": "module_complete",
      "achievedAt": "2025-11-22T10:00:00Z",
      "seen": false,
      "message": "Module 2 complete! You've mastered React Fundamentals",
      "metadata": {
        "moduleId": "module_002",
        "moduleName": "React Fundamentals"
      }
    },
    {
      "id": "milestone_789",
      "type": "progress_50",
      "achievedAt": "2025-11-24T10:45:00Z",
      "seen": false,
      "message": "You're halfway there! 🚀"
    }
  ]
}
```

**Milestone Types:**
- `progress_25` - Reached 25% completion
- `progress_50` - Reached 50% completion  
- `progress_75` - Reached 75% completion
- `module_complete` - Completed a full module
- `course_complete` - Finished the entire course (100%)

**Business Logic:**
- Query milestones for the user and course
- Filter by `seen=false` if `unseen=true` query param
- Sort by `achievedAt` DESC (newest first)

**Frontend Usage:**
- Called when user accesses course detail page
- Displays celebration UI for unseen milestones
- After showing, frontend calls `mark-seen` endpoint

---

### 7. Mark Milestones as Seen

**Endpoint:** `POST /me/learning/milestones/mark-seen`

**Purpose:** Mark milestones as seen after displaying to user

**Authentication:** Required

**Request Body:**
```json
{
  "milestoneIds": ["milestone_456", "milestone_789"]
}
```

**Success Response (200):**
```json
{
  "markedCount": 2,
  "milestoneIds": ["milestone_456", "milestone_789"]
}
```

**Business Logic:**
- Update `seen=true` for all milestone IDs provided
- Verify milestones belong to the authenticated user
- Ignore milestone IDs that don't exist (don't error)

**Frontend Usage:**
- Called after showing milestone celebration UI
- Prevents showing same milestone again on refresh
- Batch operation for efficiency

---

## Database Schema Recommendations

### Table: `course_progress`

Tracks overall progress for each user-course combination.

```sql
CREATE TABLE course_progress (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  content_id VARCHAR(255) NOT NULL,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  current_module_id VARCHAR(255),
  current_resource_id VARCHAR(255),
  last_accessed_at TIMESTAMP NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  total_modules INTEGER DEFAULT 0,
  completed_modules INTEGER DEFAULT 0,
  total_resources INTEGER DEFAULT 0,
  completed_resources INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_content (user_id, content_id),
  INDEX idx_user_last_accessed (user_id, last_accessed_at),
  INDEX idx_content_progress (content_id, progress_percent)
);
```

### Table: `resource_progress`

Tracks progress for individual resources (lessons/videos/documents).

```sql
CREATE TABLE resource_progress (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  resource_id VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  last_position INTEGER DEFAULT 0 COMMENT 'Video playback position in seconds',
  time_spent_minutes INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES content_resources(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_resource (user_id, resource_id),
  INDEX idx_user_completed (user_id, completed),
  INDEX idx_resource_user (resource_id, user_id)
);
```

### Table: `milestones`

Tracks achievement milestones and celebrations.

```sql
CREATE TABLE milestones (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  content_id VARCHAR(255) NOT NULL,
  type ENUM('progress_25', 'progress_50', 'progress_75', 'module_complete', 'course_complete') NOT NULL,
  achieved_at TIMESTAMP NOT NULL,
  seen BOOLEAN DEFAULT FALSE,
  message TEXT NOT NULL,
  metadata JSON COMMENT 'Additional data like module info',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  INDEX idx_user_content_unseen (user_id, content_id, seen),
  INDEX idx_achieved_at (achieved_at)
);
```

---

## Implementation Notes

### Performance Considerations

1. **Caching:**
   - Cache `GET /me/learning/active` for 2-5 minutes
   - Cache `GET /me/learning/courses/{id}/progress` for 1-2 minutes
   - Invalidate cache on any PUT/POST to learning endpoints

2. **Database Queries:**
   - Use indexes on foreign keys and frequently queried fields
   - Consider denormalizing `total_modules` and `total_resources` for faster queries
   - Use database transactions for progress updates to ensure consistency

3. **Background Processing:**
   - Milestone detection can be async (queue-based)
   - Progress percentage recalculation for large courses may need optimization
   - Consider batch updates for time spent tracking

### Rate Limiting

- `PUT /me/learning/resources/{id}/progress`: 60 requests/minute per user
- Other endpoints: 30 requests/minute per user
- Prevent spam by implementing idempotency where appropriate

### Data Integrity

1. **Progress Calculations:**
   - Always recalculate `progressPercent` from actual counts
   - Don't trust frontend-provided percentages
   - Ensure `completedResources` never exceeds `totalResources`

2. **Milestone Creation:**
   - Check for duplicate milestones before creating
   - Use unique constraint on (user_id, content_id, type)
   - Only create milestone when crossing threshold (not on every update)

3. **Course Structure Changes:**
   - If mentor adds/removes modules or resources, recalculate totals
   - May need migration script to update existing progress records

### Security

- Always verify user owns the course via purchases table
- Validate resource belongs to the specified course
- Sanitize all user inputs (especially video position timestamps)
- Rate limit to prevent abuse

---

## Testing Checklist

### Unit Tests Needed

- [ ] Create course progress (happy path)
- [ ] Create course progress (already exists - idempotent)
- [ ] Create course progress (not purchased - should fail)
- [ ] Update resource progress (valid)
- [ ] Update resource progress (invalid resource ID)
- [ ] Complete resource (triggers 25% milestone)
- [ ] Complete resource (triggers 50% milestone)
- [ ] Complete resource (completes module)
- [ ] Complete resource (completes course - 100%)
- [ ] Get active courses (multiple courses, sorted correctly)
- [ ] Get active courses (empty - no purchases)
- [ ] Get milestones (seen and unseen)
- [ ] Mark milestones as seen (batch operation)

### Integration Tests Needed

- [ ] Full learning flow: purchase → start → progress → complete
- [ ] Multiple users don't interfere with each other's progress
- [ ] Progress updates reflect in active courses list
- [ ] Milestone appears after crossing threshold
- [ ] Video resume from last position works correctly

### Load Tests

- [ ] 100 concurrent users updating progress
- [ ] Large course with 50+ modules and 200+ resources
- [ ] Milestone detection doesn't slow down completion endpoint

---

## Migration Path

### Phase 1: Core Functionality (MVP)
1. Implement `course_progress` table
2. Implement `POST /start` endpoint
3. Implement `GET /courses/{id}/progress` endpoint
4. Implement `GET /active` endpoint

**Frontend Impact:** Dashboard and course pages will show real progress data

### Phase 2: Resource Tracking
1. Implement `resource_progress` table  
2. Implement `PUT /resources/{id}/progress` endpoint
3. Implement `POST /resources/{id}/complete` endpoint

**Frontend Impact:** Actual lesson-by-lesson tracking, resume functionality

### Phase 3: Gamification
1. Implement `milestones` table
2. Add milestone detection logic to completion endpoint
3. Implement `GET /milestones` endpoint
4. Implement `POST /milestones/mark-seen` endpoint

**Frontend Impact:** Milestone celebrations and achievements

---

## API Response Codes Summary

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, or POST operation |
| 201 | Created | Successfully created new progress record |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User doesn't own the course |
| 404 | Not Found | Resource or progress not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

---

## Questions & Support

**Frontend Contact:** [Your Team]  
**API Documentation Location:** `/lib/api/learning.ts` (currently mocked)  
**Deployment Timeline:** TBD by backend team

### Common Questions

**Q: Can users have progress on courses they haven't purchased?**  
A: No. Always verify purchase status before creating/updating progress.

**Q: What happens if a mentor adds new modules to an existing course?**  
A: You'll need to recalculate `total_modules` and `total_resources` for existing progress records.

**Q: Should progress be deleted if a purchase is refunded?**  
A: Business decision needed. Options: soft delete, archive, or keep for re-purchase.

**Q: How accurate should time tracking be?**  
A: Frontend sends incremental updates (e.g., every 5 minutes while active). Sum these for total time.

**Q: Can users skip ahead in sequential courses?**  
A: Business logic decision. Progress API doesn't enforce order; that's course structure logic.

---

## Appendix: Frontend Code References

- **Mock API Layer:** `/lib/api/learning.ts`
- **Continue Learning Component:** `/components/dashboard/continue-learning.tsx`
- **Payment Success:** `/app/payment/success/page.tsx`
- **Course Detail:** `/app/content/[id]/page.tsx`
- **Dashboard Integration:** `/app/dashboard/page.tsx`

All code contains `// TODO: Replace with real API call` comments where mocks should be replaced.

---

**Document Status:** Ready for Backend Implementation  
**Last Updated:** November 24, 2025  
**Version:** 1.0
