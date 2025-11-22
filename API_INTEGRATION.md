# Frontend API Integration

This document describes the frontend API client implementation that connects to the MentorVerse backend.

## Configuration

The API base URL is configured via environment variable:

```env
NEXT_PUBLIC_API_URL=https://mentorverseapi-production.up.railway.app
```

For local development:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## API Client

All API calls go through `lib/api/client.ts` which provides:

- **Automatic token injection** - JWT access token added to all authenticated requests
- **Error handling** - Standardized error responses with `ApiException`
- **Token refresh** - Automatic logout on 401 Unauthorized
- **Type safety** - Full TypeScript support for all endpoints

## Available APIs

### Authentication (`lib/api/auth.ts`)

```typescript
import { authApi } from '@/lib/api';

// Email/Password Auth
await authApi.login(email, password);
await authApi.register({ full_name, email, password, account_type });
await authApi.forgotPassword(email);
await authApi.resetPassword(token, password);
await authApi.refresh(refreshToken);

// OAuth Social Login
const { url } = await authApi.getOAuthUrl('google', 'user');
window.location.href = url; // Redirect to OAuth provider

// OAuth Callback (handled automatically by /auth/callback page)
await authApi.handleOAuthCallback(code, state);

// User Info
const user = await authApi.getCurrentUser();

// Logout
authApi.logout();

// Check Auth Status
const isAuth = authApi.isAuthenticated();
```

**Supported OAuth Providers:**
- `google` - Google OAuth
- `apple` - Sign in with Apple
- `facebook` - Facebook Login
- `linkedin` - LinkedIn OAuth

**Intent Types:**
- `user` - Regular user signup
- `mentor` - Mentor signup (redirects to mentor onboarding)

### User Management (`lib/api/user.ts`)

```typescript
import { userApi } from '@/lib/api';

// Get current user
const user = await userApi.getCurrentUser();

// Update profile
await userApi.updateUser({ full_name: 'New Name' });

// Get user by ID
const user = await userApi.getUserById(userId);
```

### Onboarding (`lib/api/onboarding.ts`)

```typescript
import { onboardingApi } from '@/lib/api';

// Individual onboarding
await onboardingApi.submitIndividual({
  goals: ['career', 'business'],
  primary_focus: 'career',
  current_challenges: 'Need guidance',
  experience_level: 'intermediate',
});

// Business onboarding
await onboardingApi.submitBusiness({
  business_name: 'Tech Corp',
  industry: 'Technology',
  company_size: '50-200',
  description: 'Software company',
  main_challenge: 'Scaling',
  location: 'San Francisco',
});
```

### Mentors (`lib/api/mentors.ts`)

```typescript
import { mentorsApi } from '@/lib/api';

// List mentors
const mentors = await mentorsApi.getMentors({
  q: 'software',
  tags: ['career', 'technology'],
});

// Get mentor details
const mentor = await mentorsApi.getMentor(mentorId);

// Apply to become mentor
const mentor = await mentorsApi.applyToBecomeMentor({
  headline: 'Senior Software Engineer',
  short_bio: 'Helping developers grow',
  long_bio: 'Full biography...',
  areas_of_expertise: ['Software Development', 'Career Growth'],
  experience_years: 10,
  languages: ['English', 'Spanish'],
  social_links: { linkedin: 'url', twitter: 'url' },
});

// Get current mentor profile
const profile = await mentorsApi.getCurrentMentorProfile();

// Update mentor profile
await mentorsApi.updateCurrentMentorProfile({
  headline: 'Updated headline',
});

// Get mentor dashboard
const dashboard = await mentorsApi.getMentorDashboard();
```

### Content (`lib/api/content.ts`)

```typescript
import { contentApi } from '@/lib/api';

// List content
const content = await contentApi.getContent({
  q: 'react',
  tags: ['web development'],
  content_type: 'course',
  min_price: 10,
  max_price: 100,
  mentor_id: 'uuid',
});

// Get content by ID
const item = await contentApi.getContentById(contentId);

// Get full content (requires purchase)
const fullContent = await contentApi.getContentFull(contentId);

// Create content (mentor only)
const newContent = await contentApi.createContent({
  title: 'React Masterclass',
  description: 'Learn React from scratch',
  content_type: 'course',
  // ... other fields
});

// Update content
await contentApi.updateContent(contentId, { title: 'New Title' });

// Publish content
await contentApi.publishContent(contentId);

// Checkout (creates Stripe session)
const { checkout_url } = await contentApi.checkout({ content_id: contentId });
window.location.href = checkout_url;
```

### Dashboard (`lib/api/dashboard.ts`)

```typescript
import { dashboardApi } from '@/lib/api';

// Get user dashboard
const dashboard = await dashboardApi.getDashboard();
// Returns: { user, purchased_content_count, recent_content, suggested_content, recent_ai_sessions }
```

### AI Chat (`lib/api/ai.ts`)

```typescript
import { aiApi } from '@/lib/api';

// List sessions
const sessions = await aiApi.getSessions();

// Get session
const session = await aiApi.getSession(sessionId);

// Create session
const session = await aiApi.createSession({
  context_type: 'content_specific',
  related_content_ids: ['uuid1', 'uuid2'],
});

// Get messages
const messages = await aiApi.getMessages(sessionId);

// Send message
const response = await aiApi.sendMessage(sessionId, {
  content: 'How do I get started?',
});
```

### Timeline (`lib/api/timeline.ts`)

```typescript
import { timelineApi } from '@/lib/api';

// Create post
const post = await timelineApi.createPost({
  content: 'My first post!',
  media_urls: ['https://...'],
});

// Get feed (paginated)
const { posts, total, page, limit } = await timelineApi.getFeed({
  page: 1,
  limit: 20,
});

// Get user timeline
const timeline = await timelineApi.getUserTimeline(userId, {
  page: 1,
  limit: 20,
});

// Delete post
await timelineApi.deletePost(postId);
```

### Media Upload (`lib/api/media.ts`)

```typescript
import { mediaApi } from '@/lib/api';

// Upload image
const { url, public_id } = await mediaApi.uploadImage(file);
```

### Payments (`lib/api/payment.ts`)

```typescript
import { paymentApi } from '@/lib/api';

// Get user purchases
const { purchases, total } = await paymentApi.getUserPurchases({
  page: 1,
  limit: 20,
});

// Check if content purchased
const { purchased } = await paymentApi.checkIfPurchased(contentId);
```

### Admin (`lib/api/admin.ts`)

```typescript
import { adminApi } from '@/lib/api';

// Get mentor applications
const applications = await adminApi.getMentorApplications();

// Approve application
await adminApi.approveMentorApplication(mentorId);

// Reject application
await adminApi.rejectMentorApplication(mentorId);

// Update content status
await adminApi.updateContentStatus(contentId, 'published');
```

## Error Handling

All API calls throw `ApiException` on error:

```typescript
import { ApiException } from '@/lib/api';

try {
  await authApi.login(email, password);
} catch (error) {
  if (error instanceof ApiException) {
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('Validation errors:', error.errors);
  }
}
```

## Authentication Flow

### Email/Password Login

1. Call `authApi.login(email, password)`
2. Tokens stored in localStorage automatically
3. Redirect based on `user.role` and `user.onboarding_completed`

### Social Login

1. Call `authApi.getOAuthUrl(provider, intent)`
2. Redirect user to returned URL
3. User authenticates with provider
4. Provider redirects to `/auth/callback?access_token=...`
5. Callback page stores tokens and redirects to dashboard

### Token Management

- Access token: Stored in `localStorage.getItem('access_token')`
- Refresh token: Stored in `localStorage.getItem('refresh_token')`
- Automatic logout on 401 Unauthorized
- Use `authApi.refresh(refreshToken)` to get new access token

## Type Definitions

All types are defined in `lib/api/types.ts`:

```typescript
import type { 
  User,
  LoginResponse,
  Mentor,
  Content,
  AiSession,
  // ... many more
} from '@/lib/api';
```

## Best Practices

1. **Always use the typed APIs** - Don't call fetch directly
2. **Handle errors gracefully** - Wrap API calls in try/catch
3. **Check authentication** - Use `authApi.isAuthenticated()` before protected operations
4. **Use React hooks** - Consider creating custom hooks for common API patterns
5. **Loading states** - Show loaders while API calls are in progress
6. **Optimistic updates** - Update UI before API response for better UX

## Example: Custom Hook

```typescript
import { useState, useEffect } from 'react';
import { mentorsApi, Mentor } from '@/lib/api';

export function useMentors() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const data = await mentorsApi.getMentors();
        setMentors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mentors');
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  return { mentors, loading, error };
}
```

## OAuth Configuration

For OAuth to work, you need to configure redirect URIs in each provider:

**Google Cloud Console:**
- Authorized redirect URI: `https://mentorverseapi-production.up.railway.app/auth/oauth/google/callback`

**Apple Developer:**
- Return URL: `https://mentorverseapi-production.up.railway.app/auth/oauth/apple/callback`

**Facebook Developers:**
- Valid OAuth Redirect URI: `https://mentorverseapi-production.up.railway.app/auth/oauth/facebook/callback`

**LinkedIn Developers:**
- Authorized redirect URL: `https://mentorverseapi-production.up.railway.app/auth/oauth/linkedin/callback`

## Backend API Documentation

For complete backend API documentation, see:
https://github.com/yawboafo/mentorverseapi/blob/main/API_DOCUMENTATION.md
