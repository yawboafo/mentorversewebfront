# MentorVerse Frontend - Implementation Guide

## ✅ Completed Features

### Core Infrastructure
- ✅ Next.js 14 with App Router and TypeScript
- ✅ Tailwind CSS + shadcn/ui components
- ✅ Centralized API client with JWT auth
- ✅ Auth context and protected route hooks
- ✅ Root layout with navbar and footer
- ✅ Environment configuration (.env.local)

### Pages Implemented
- ✅ Landing page (/)
- ✅ Authentication pages (/auth/login, /auth/register, /auth/forgot-password, /auth/reset-password)
- ✅ Onboarding flow (/onboarding) - Multi-step for individuals & businesses
- ✅ User dashboard (/dashboard)
- ✅ Mentors browsing (/mentors)
- ✅ Mentor detail page (/mentors/[id])
- ✅ Content browsing (/content)
- ✅ Content detail page placeholder (/content/[id])
- ✅ AI chat placeholder (/ai/chat)
- ✅ Mentor application placeholder (/mentor/apply)
- ✅ Mentor dashboard placeholder (/mentor/dashboard)
- ✅ Admin panel placeholder (/admin)

### API Integration Layer
- ✅ Auth API (login, register, forgot/reset password, current user)
- ✅ Onboarding API (individual & business)
- ✅ Dashboard API
- ✅ Mentors API (list, detail, apply, dashboard)
- ✅ Content API (list, detail, full, create, update, publish, checkout)
- ✅ AI Chat API (sessions, messages)
- ✅ Admin API (mentor applications, content moderation)

## 🚧 Pages That Need Full Implementation

The following pages have placeholder implementations and need to be fully built out:

### 1. Content Detail Page (`/app/content/[id]/page.tsx`)

**What to implement:**
- Fetch content details using `contentApi.getContentById()`
- Display full content information:
  - Title, description, mentor name
  - Price and currency
  - Target audience, problem it solves
  - Learning outcomes
  - Delivery modes (badges)
  - Prerequisites, duration, time commitment
  - Support model
- Check if user has purchased (call `/content/{id}/full` to verify access)
- Purchase button:
  - Call `contentApi.checkout({ content_id })`
  - Handle checkout response (redirect to `checkout_url`)
- If already purchased, show "Open Course" button linking to `/content/[id]/view`

**Example structure:**
```tsx
const [content, setContent] = useState<Content>();
const [hasPurchased, setHasPurchased] = useState(false);

useEffect(() => {
  // Fetch content details
  // Try to fetch full content to check access
  // Set hasPurchased if successful
}, []);

const handlePurchase = async () => {
  const response = await contentApi.checkout({ content_id });
  window.location.href = response.checkout_url;
};
```

### 2. Content View Page (`/app/content/[id]/view/page.tsx`)

**What to implement:**
- Protected page (requires auth + purchase)
- Fetch full content using `contentApi.getContentFull()`
- Display outline as collapsible sections:
  - Modules with title and description
  - Activities within each module
  - Resources (links to materials)
- "Ask AI about this course" button:
  - Create AI session with `context_type: 'content_specific'` and `related_content_ids: [contentId]`
  - Redirect to `/ai/chat/[sessionId]`

**Example structure:**
```tsx
const [contentFull, setContentFull] = useState<ContentFull>();

// Use Accordion component for modules
{contentFull?.outline.map((module, idx) => (
  <AccordionItem key={idx}>
    <AccordionTrigger>{module.title}</AccordionTrigger>
    <AccordionContent>
      {/* Render activities and resources */}
    </AccordionContent>
  </AccordionItem>
))}
```

### 3. AI Chat Session Page (`/app/ai/chat/[sessionId]/page.tsx`)

**What to implement:**
- Fetch session details using `aiApi.getSession(sessionId)`
- Fetch messages using `aiApi.getMessages(sessionId)`
- Display messages in chat format (user vs AI)
- Input field at bottom to send messages
- Call `aiApi.sendMessage(sessionId, { content })` on submit
- Show loading indicator while waiting for AI response
- Display suggested content sidebar if AI returns `meta.suggested_content`

**Example structure:**
```tsx
const [messages, setMessages] = useState<AiMessage[]>([]);
const [input, setInput] = useState('');
const [isSending, setIsSending] = useState(false);

const handleSend = async () => {
  setIsSending(true);
  const newMessage = await aiApi.sendMessage(sessionId, { content: input });
  setMessages([...messages, newMessage]);
  setInput('');
  setIsSending(false);
};
```

### 4. Mentor Application Form (`/app/mentor/apply/page.tsx`)

**What to implement:**
- Form fields from `MentorApplication` type:
  - headline (text)
  - short_bio (textarea, 150 chars)
  - long_bio (textarea)
  - areas_of_expertise (multi-select or chips input)
  - experience_years (number)
  - languages (multi-select)
  - social_links (dynamic key-value pairs)
- Submit to `mentorsApi.applyToBecomeMentor(data)`
- Show success message: "Your application is pending approval"
- Redirect to dashboard after submission

### 5. Mentor Dashboard (`/app/mentor/dashboard/page.tsx`)

**What to implement:**
- Fetch dashboard data using `mentorsApi.getMentorDashboard()`
- Display stats:
  - total_sales
  - total_purchases
- Show top performing content (top_content)
- Show recent purchases (recent_purchases)
- "Create new course/framework" button linking to `/mentor/content/new`
- List existing content with edit links

### 6. Create Content Page (`/app/mentor/content/new/page.tsx`)

**What to implement:**
- Multi-step wizard form:
  - **Step 1 - Basics:**
    - title, description, content_type, format
  - **Step 2 - Audience & Outcomes:**
    - target_audience, problem_it_solves, learning_outcomes (array)
  - **Step 3 - Delivery & Structure:**
    - delivery_modes (multi-select)
    - estimated_duration, max_participants, location
    - tools (multi-select)
    - prerequisites, required_time_per_week, support_model
    - outline (dynamic module builder with activities and resources)
  - **Step 4 - Pricing & AI:**
    - price, currency
    - ai_context (textarea)
- Submit to `contentApi.createContent(data)`
- Optionally publish immediately using `contentApi.publishContent(id)`

### 7. Edit Content Page (`/app/mentor/content/[id]/edit/page.tsx`)

**What to implement:**
- Same form as create content page
- Pre-fill with existing data from `contentApi.getContentById()`
- Submit using `contentApi.updateContent(id, data)`

### 8. Admin Mentor Applications (`/app/admin/mentors/page.tsx`)

**What to implement:**
- Fetch applications using `adminApi.getMentorApplications()`
- Show list of pending mentors with:
  - Full name, email, headline
  - Experience, areas of expertise
  - Application date
- Approve button: `adminApi.approveMentorApplication(mentorId)`
- Reject button: `adminApi.rejectMentorApplication(mentorId)`
- Show success toast on action

### 9. Admin Content Moderation (`/app/admin/content/page.tsx`)

**What to implement:**
- Fetch all content using `contentApi.getContent()`
- Show content list with status badges
- Archive button for each: `adminApi.updateContentStatus(id, 'archived')`

### 10. AI Chat List (`/app/ai/chat/page.tsx`)

**What to implement:**
- Fetch sessions using `aiApi.getSessions()`
- Display list of recent sessions with:
  - Context type
  - Last message preview
  - Created date
  - Link to `/ai/chat/[sessionId]`
- "New Session" button:
  - Create session with `aiApi.createSession({ context_type: 'general' })`
  - Redirect to new session

## 📝 Quick Implementation Tips

### TypeScript Types
All types are defined in `lib/api/types.ts`. Import what you need:
```tsx
import { Content, Mentor, AiSession } from '@/lib/api/types';
```

### API Calls
All API functions are in `lib/api/`. Import and use:
```tsx
import { contentApi } from '@/lib/api';

const content = await contentApi.getContent();
```

### Protected Routes
Use the hook for pages that require authentication:
```tsx
import { useRequireAuth } from '@/hooks/use-require-auth';

const { user, isLoading } = useRequireAuth();
```

For role-based protection:
```tsx
import { useRequireRole } from '@/hooks/use-require-auth';

const { user, isLoading } = useRequireRole(['mentor', 'admin']);
```

### Toast Notifications
```tsx
import { toast } from 'sonner';

toast.success('Operation successful!');
toast.error('Something went wrong');
```

### Loading States
Use the Skeleton component from shadcn/ui:
```tsx
import { Skeleton } from '@/components/ui/skeleton';

{isLoading ? <Skeleton className="h-20 w-full" /> : <ActualContent />}
```

## 🔧 Testing Your Implementation

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test authentication flow:**
   - Register a new account
   - Log in
   - Complete onboarding
   - Check dashboard

3. **Test API integration:**
   - Open browser DevTools > Network tab
   - Verify API calls are made to correct endpoints
   - Check Authorization headers include Bearer token

4. **Test error handling:**
   - Try invalid login
   - Test with network disconnected
   - Verify error messages display

## 🚀 Next Steps

1. **Replace API URL placeholder** in `.env.local` with your actual backend URL
2. **Implement remaining pages** from the list above
3. **Add form validation** using react-hook-form or similar
4. **Add React Query** for better caching and loading states
5. **Test thoroughly** with real backend API
6. **Deploy** to Vercel or your preferred platform

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## 🆘 Getting Help

If you encounter issues:
1. Check browser console for errors
2. Verify API URL in `.env.local`
3. Check Network tab for failed requests
4. Ensure backend API is running
5. Verify CORS is configured on backend

Good luck building MentorVerse! 🎉
