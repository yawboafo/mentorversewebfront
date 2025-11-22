# MentorVerse Frontend

A full-featured web frontend for MentorVerse - an AI-powered mentorship and learning platform built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## 🚀 Features

✅ **Authentication & Onboarding**
- User registration and login with JWT authentication
- Password reset flow
- Multi-step onboarding for individuals and businesses
- Role-based access control (User, Mentor, Admin)

✅ **User Experience**
- Personalized dashboard with stats and recommendations
- Browse and search mentors
- Browse and filter content (courses & frameworks)
- Purchase and access content
- AI mentor assistant for general and content-specific help

✅ **Mentor Features**
- Apply to become a mentor
- Mentor dashboard with sales analytics
- Create and publish courses/frameworks
- Edit existing content

✅ **Admin Features**
- Approve/reject mentor applications
- Moderate content

✅ **Modern UI/UX**
- Responsive design for all devices
- Clean, accessible interface with shadcn/ui
- Loading states and error handling
- Toast notifications

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **HTTP Client**: Fetch API
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📦 Installation

1. **Install dependencies**:

```bash
npm install
```

2. **Configure environment variables**:

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Replace with your actual backend API URL.

3. **Run the development server**:

```bash
npm run dev
```

4. **Open http://localhost:3000**

## 🌍 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | ✅ Yes |

Example `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Example production:
```
NEXT_PUBLIC_API_URL=https://api.mentorverse.com/api
```

## 📁 Project Structure

```
mentorversewebfront/
├── app/                      # Next.js App Router
│   ├── auth/                 # Authentication pages
│   ├── onboarding/           # Onboarding flow
│   ├── dashboard/            # User dashboard
│   ├── mentors/             # Mentor browsing
│   ├── content/             # Content browsing
│   ├── ai/                  # AI chat
│   ├── mentor/              # Mentor-specific
│   ├── admin/               # Admin panel
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── navbar.tsx
│   └── footer.tsx
├── hooks/                   # Custom hooks
│   ├── use-auth.tsx
│   └── use-require-auth.tsx
├── lib/                     # Utilities
│   └── api/                 # API client
│       ├── client.ts
│       ├── types.ts
│       ├── auth.ts
│       ├── mentors.ts
│       ├── content.ts
│       └── ai.ts
└── .env.local              # Environment variables
```

## 🔐 Authentication Flow

1. User logs in at `/auth/login`
2. Backend returns JWT tokens
3. Tokens stored in localStorage
4. All requests include `Authorization: Bearer <token>`
5. On 401, user redirected to login

## 🗺️ Routes

### Public Routes
- `/` - Landing page
- `/auth/login` - Login
- `/auth/register` - Registration
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset

### Protected Routes
- `/onboarding` - Onboarding flow
- `/dashboard` - User dashboard
- `/mentors` - Browse mentors
- `/mentors/[id]` - Mentor profile
- `/content` - Browse content
- `/content/[id]` - Content details
- `/content/[id]/view` - View purchased content
- `/ai/chat` - AI sessions
- `/ai/chat/[sessionId]` - AI conversation

### Mentor Routes
- `/mentor/apply` - Apply to be mentor
- `/mentor/dashboard` - Mentor dashboard
- `/mentor/content/new` - Create content
- `/mentor/content/[id]/edit` - Edit content

### Admin Routes
- `/admin` - Admin overview
- `/admin/mentors` - Review applications
- `/admin/content` - Moderate content

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Adding shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

### API Integration

All API calls go through `lib/api/client.ts` which handles:
- JWT token management
- Authorization headers
- Error handling
- Automatic redirects

Example API call:
```typescript
import { authApi } from '@/lib/api/auth';

const user = await authApi.getCurrentUser();
```

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL`
4. Deploy!

### Build for Production

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

**API Connection Issues**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running
- Verify CORS is enabled

**Authentication Issues**
- Clear localStorage
- Check token in Network tab
- Verify backend `/me` endpoint

**Build Errors**
- Delete `.next` and `node_modules`
- Run `npm install`
- Run `npm run build`

## 📚 API Endpoints

The frontend integrates with these backend endpoints:

**Auth**
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /me`

**Mentors**
- `GET /mentors`
- `GET /mentors/{mentor_id}`
- `POST /mentor/apply`
- `GET /mentor/dashboard`

**Content**
- `GET /content`
- `GET /content/{id}`
- `GET /content/{id}/full`
- `POST /content`
- `PATCH /content/{id}`
- `POST /content/{id}/publish`
- `POST /payments/checkout`

**AI**
- `GET /ai/chat/sessions`
- `POST /ai/chat/sessions`
- `GET /ai/chat/sessions/{session_id}/messages`
- `POST /ai/chat/sessions/{session_id}/messages`

**Admin**
- `GET /admin/mentor-applications`
- `POST /admin/mentor-applications/{mentor_id}/approve`
- `POST /admin/mentor-applications/{mentor_id}/reject`
- `PATCH /admin/content/{id}`

## 🎨 Customization

### Theme Colors

Edit `app/globals.css`:

```css
:root {
  --primary: ...;
  --secondary: ...;
}
```

## 📝 License

[Your License]

## 🙋 Support

- Email: support@mentorverse.com
- Docs: https://docs.mentorverse.com

---

Built with ❤️ using Next.js and shadcn/ui
