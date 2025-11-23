# Frontend Design & Implementation Blueprint for Flutter Mobile Team

## MentorVerse Web App → Mobile App Translation Guide

**Date:** November 22, 2025  
**Version:** 1.0  
**Platform:** Next.js 16.0.3 → Flutter Mobile  
**Goal:** 1:1 recreation of web UX and feature set

---

## 1. DESIGN SYSTEM

### A. Color Palette

#### Primary Brand Colors
```dart
// Light Mode
const Color primary = Color(0xFF8B5CF6);        // Purple (oklch(0.6 0.24 275))
const Color primaryForeground = Color(0xFFFFFFFF); // White
const Color secondary = Color(0xFFEC4899);      // Pink-purple (oklch(0.75 0.2 330))
const Color accent = Color(0xFF3B82F6);         // Blue (oklch(0.65 0.25 230))
const Color accentForeground = Color(0xFFFFFFFF); // White

// Background & Surfaces
const Color background = Color(0xFFFCFCFC);     // Off-white (oklch(0.99 0.005 90))
const Color foreground = Color(0xFF1F2937);     // Dark text (oklch(0.2 0.01 270))
const Color card = Color(0xFFFFFFFF);           // Pure white
const Color cardForeground = Color(0xFF1F2937); // Dark text

// Neutrals
const Color muted = Color(0xFFF5F5F4);          // Light gray (oklch(0.96 0.01 270))
const Color mutedForeground = Color(0xFF78716C); // Medium gray (oklch(0.5 0.02 270))
const Color border = Color(0xFFECECEC);         // Light border (oklch(0.92 0.01 270))
const Color input = Color(0xFFECECEC);          // Input border

// Functional
const Color destructive = Color(0xFFEF4444);    // Red (oklch(0.6 0.25 20))
const Color ring = Color(0xFF8B5CF6);           // Focus ring (purple)
```

#### Dark Mode Colors
```dart
const Color backgroundDark = Color(0xFF0F0F23);  // Very dark purple
const Color foregroundDark = Color(0xFFF9FAFB);  // Near white
const Color cardDark = Color(0xFF1F2937);        // Dark card
const Color mutedDark = Color(0xFF374151);       // Dark muted
const Color borderDark = Color(0xFF4B5563);      // Dark border
```

#### Gen-Z Brand Gradients
```dart
// Primary gradient (purple → pink)
const LinearGradient primaryGradient = LinearGradient(
  colors: [Color(0xFF8B5CF6), Color(0xFFEC4899)],
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
);

// Hero gradient (purple → pink → orange)
const LinearGradient heroGradient = LinearGradient(
  colors: [
    Color(0xFF8B5CF6), // Purple
    Color(0xFFEC4899), // Pink
    Color(0xFFF59E0B), // Orange
  ],
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
);
```

### B. Typography

#### Font Families
```dart
// Primary: Geist Sans (Google Fonts equivalent: Inter or similar)
const TextStyle primaryFont = TextStyle(
  fontFamily: 'Inter', // Use Inter as Geist Sans equivalent
  fontWeight: FontWeight.w400,
);

// Monospace: Geist Mono
const TextStyle monoFont = TextStyle(
  fontFamily: 'JetBrains Mono', // Or 'Fira Code'
  fontWeight: FontWeight.w400,
);
```

#### Text Scale (Mobile Optimized)
```dart
// Headings
const TextStyle h1 = TextStyle(
  fontSize: 32, // 2rem on mobile
  fontWeight: FontWeight.w700,
  height: 1.2,
);

const TextStyle h2 = TextStyle(
  fontSize: 24, // 1.5rem
  fontWeight: FontWeight.w600,
  height: 1.3,
);

const TextStyle h3 = TextStyle(
  fontSize: 20, // 1.25rem
  fontWeight: FontWeight.w600,
  height: 1.4,
);

// Body
const TextStyle bodyLarge = TextStyle(
  fontSize: 16, // 1rem
  fontWeight: FontWeight.w400,
  height: 1.5,
);

const TextStyle body = TextStyle(
  fontSize: 14, // 0.875rem
  fontWeight: FontWeight.w400,
  height: 1.5,
);

// Small
const TextStyle caption = TextStyle(
  fontSize: 12, // 0.75rem
  fontWeight: FontWeight.w400,
  height: 1.4,
);

const TextStyle label = TextStyle(
  fontSize: 14, // 0.875rem
  fontWeight: FontWeight.w500,
  height: 1.4,
);
```

### C. Spacing & Layout

#### Spacing Scale (8px base)
```dart
const double spacing = 8.0;

class Spacing {
  static const xs = spacing * 0.5;    // 4px
  static const sm = spacing * 1;      // 8px
  static const md = spacing * 1.5;    // 12px
  static const lg = spacing * 2;      // 16px
  static const xl = spacing * 3;      // 24px
  static const xxl = spacing * 4;     // 32px
  static const xxxl = spacing * 6;    // 48px
}
```

#### Border Radius Scale
```dart
class BorderRadius {
  static const sm = Radius.circular(4);   // 4px
  static const md = Radius.circular(6);   // 6px
  static const lg = Radius.circular(8);   // 8px (rounded-md)
  static const xl = Radius.circular(12);  // 12px
  static const xxl = Radius.circular(16); // 16px
  static const xxxl = Radius.circular(20); // 20px (base radius)
  static const xxxxl = Radius.circular(24); // 24px (radius-xl)
}
```

#### Container Widths
```dart
class ContainerWidth {
  static const mobile = 375.0;    // iPhone width
  static const tablet = 768.0;    // Tablet breakpoint
  static const desktop = 1024.0;  // Desktop breakpoint
  static const maxWidth = 1280.0; // max-w-7xl
}
```

#### Shadows
```dart
class Shadows {
  static const xs = BoxShadow(
    color: Color(0x0D000000), // 5% black
    offset: Offset(0, 1),
    blurRadius: 2,
  );
  
  static const sm = BoxShadow(
    color: Color(0x14000000), // 8% black
    offset: Offset(0, 1),
    blurRadius: 3,
  );
  
  static const md = BoxShadow(
    color: Color(0x1A000000), // 10% black
    offset: Offset(0, 4),
    blurRadius: 6,
  );
  
  static const lg = BoxShadow(
    color: Color(0x1F000000), // 12% black
    offset: Offset(0, 10),
    blurRadius: 15,
  );
  
  static const xl = BoxShadow(
    color: Color(0x24000000), // 14% black
    offset: Offset(0, 20),
    blurRadius: 25,
  );
}
```

### D. Component Patterns

#### Buttons
```dart
enum ButtonVariant { primary, secondary, outline, ghost, destructive }
enum ButtonSize { sm, md, lg, icon }

class AppButton extends StatelessWidget {
  final ButtonVariant variant;
  final ButtonSize size;
  final VoidCallback? onPressed;
  final Widget child;
  final bool isLoading;
  
  // Implementation with proper styling for each variant
  // Primary: purple gradient background
  // Secondary: pink-purple background
  // Outline: border with transparent bg
  // Ghost: transparent with hover bg
  // Destructive: red background
}
```

#### Cards
```dart
class AppCard extends StatelessWidget {
  final Widget? header;
  final Widget? title;
  final Widget? subtitle;
  final Widget? action;
  final Widget content;
  final Widget? footer;
  
  // Structure:
  // - Rounded corners (20px)
  // - White background with subtle shadow
  // - Padding: 24px all around
  // - Header: optional title/subtitle/action row
  // - Content: main content area
  // - Footer: optional footer actions
}
```

#### Inputs
```dart
class AppTextField extends StatelessWidget {
  final String? label;
  final String? hint;
  final TextEditingController controller;
  final bool obscureText;
  final String? errorText;
  final TextInputType keyboardType;
  
  // Styling:
  // - Height: 36px (h-9)
  // - Border: light gray, rounded 6px
  // - Padding: 12px horizontal
  // - Focus: purple ring (3px)
  // - Error: red border and text
}
```

#### Badges/Chips
```dart
class AppBadge extends StatelessWidget {
  final String text;
  final BadgeVariant variant; // primary, secondary, outline, destructive
  
  // Styling:
  // - Rounded full (pill shape)
  // - Small padding (8px horizontal, 2px vertical)
  // - Font: 12px medium
  // - Colors match button variants
}
```

#### Modals/Dialogs
```dart
class AppDialog extends StatelessWidget {
  final String? title;
  final String? description;
  final Widget content;
  final List<Widget> actions;
  
  // Features:
  // - Centered overlay with blur
  // - Max width: 512px (max-w-lg)
  // - Rounded corners: 8px
  // - Close button (X) top-right
  // - Fade in/out animations
}
```

---

## 2. NAVIGATION & APP STRUCTURE

### Public Routes (Not Logged In)
```
/
├── Home Page
│   ├── Hero section (gradient background)
│   ├── Featured mentors (6-col grid)
│   ├── Features grid (3-col)
│   └── Content carousel
│
├── /mentors
│   ├── Mentor browse grid (responsive 1-4 cols)
│   ├── Search bar + filters
│   └── Pagination
│
├── /content
│   ├── Course/content grid (4-col max)
│   ├── Search + type filters
│   └── Content cards with badges
│
├── /auth/login
│   └── Login form + social buttons
│
└── /auth/register
    └── Register form + social buttons
```

### Authenticated Routes (By Role)

#### Normal User (Mentee)
```
/dashboard
├── Stats cards (3-col: courses, mentors, progress)
├── Continue learning section
├── Suggested content
└── Quick action cards

/dashboard/mentors
├── My subscribed mentors list
├── Book appointment buttons
└── Mentor cards with status

/mentors
├── Browse all mentors
├── Subscribe buttons
└── Mentor detail pages

/content
├── Browse all courses
├── Purchase buttons
└── Course detail pages

/ai/chat
├── Chat interface
├── Session history sidebar
└── AI mentor conversations

/mentor/join (if not mentor intent)
└── Become mentor application
```

#### Mentor Role
```
/mentor/dashboard
├── Revenue stats (4-col grid)
├── Top content performance
├── Recent purchases
└── Quick create buttons

/mentor/mentees
├── Student list (full-width cards)
├── Search functionality
├── Student details + purchased content
└── Pagination (20 per page)

/mentor/content
├── My published courses
├── Edit/delete actions
└── Performance metrics

/mentor/content/create
├── Manual course creation form
└── Step-by-step wizard

/mentor/content/ai-builder
├── AI course generation
├── Idea input → draft output
└── Refine workflow

/mentors (browse)
└── Same as public, but can subscribe too
```

#### Admin Role
```
/admin
├── User management
├── Mentor applications (pending/approved)
├── Content moderation
├── System stats
└── Revenue analytics

/admin/mentor-applications
├── Pending applications list
├── Approve/reject actions
└── Application details modal
```

### Navigation Header Behavior

#### Not Logged In
- Logo (links to /)
- Desktop: Mentors, Courses, Login (ghost), Sign Up (primary)
- Mobile: Hamburger menu with same links

#### Logged In - User Role
- Logo (links to /dashboard)
- Desktop: Dashboard, My Mentors, Browse Mentors, Courses, AI Mentor, Become Mentor
- User dropdown: My Dashboard, My Mentors, Profile, Settings, Logout

#### Logged In - Mentor Role
- Logo (links to /mentor/dashboard)
- Desktop: My Dashboard, My Mentees, My Content, Create, Browse Mentors, AI Mentor
- User dropdown: Mentor Dashboard, My Mentees, Create Content, Profile, Settings, Logout

#### Logged In - Admin Role
- Logo (links to /admin)
- Desktop: Dashboard, Mentors, Courses, AI Mentor, Admin
- User dropdown: Admin Panel, Profile, Settings, Logout

### Mobile Navigation
- Bottom tab bar for main sections
- Hamburger menu for secondary actions
- User avatar → dropdown for account actions

---

## 3. AUTH & ROLE LOGIC

### Token Storage
```dart
// Store in secure storage (flutter_secure_storage)
class AuthStorage {
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user';
  
  // Methods to get/set/clear tokens
}
```

### User State Structure
```dart
class User {
  final String id;
  final String email;
  final String fullName;
  final String accountType; // 'individual' | 'business'
  final String role; // 'user' | 'mentor' | 'admin'
  final bool onboardingCompleted;
  final String createdAt;
  final String? signupIntent; // 'user' | 'mentor'
  final String? mentorStatus; // 'none' | 'pending_approval' | 'active' | 'suspended'
  
  // Constructor and fromJson/toJson methods
}
```

### Authentication State
```dart
class AuthState {
  final User? user;
  final bool isLoading;
  final bool isAuthenticated;
  
  // Computed properties
  bool get isAdmin => user?.role == 'admin';
  bool get isMentor => user?.role == 'mentor';
  bool get isUser => user?.role == 'user';
  bool get needsOnboarding => user?.onboardingCompleted == false;
}
```

### Post-Login Routing Logic
```dart
String getInitialRoute(User user) {
  if (user.role == 'admin') {
    return '/admin';
  }
  
  if (user.role == 'mentor') {
    return '/mentor/dashboard';
  }
  
  // Normal user logic
  if (user.mentorStatus == 'pending_approval') {
    return '/mentor/pending';
  }
  
  if (user.signupIntent == 'mentor' && user.mentorStatus == 'none') {
    return '/mentor/apply';
  }
  
  if (!user.onboardingCompleted) {
    return '/onboarding';
  }
  
  return '/dashboard';
}
```

### Social Login Flow
```dart
// OAuth providers: Google, Apple, Facebook, LinkedIn
class SocialLoginService {
  Future<void> loginWithGoogle() async {
    // 1. Get OAuth URL from backend: POST /auth/oauth/google/url
    // 2. Open webview or external browser
    // 3. Handle redirect with auth code
    // 4. Exchange code for tokens: POST /auth/oauth/google/callback
    // 5. Store tokens and fetch user data
    // 6. Navigate to initial route
  }
  
  // Same pattern for Apple, Facebook, LinkedIn
}
```

### Auth Context/Provider
```dart
class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isLoading = true;
  
  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;
  
  Future<void> refreshUser() async {
    // Check for stored token
    // If exists, fetch /me endpoint
    // Update _user and notify listeners
  }
  
  Future<void> logout() async {
    // Clear stored tokens
    // Clear _user
    // Navigate to login
  }
}
```

---

## 4. SCREEN-BY-SCREEN UX & DATA FLOWS

### A. Login & Register

#### Purpose
- Authenticate existing users
- Create new accounts
- Support social login

#### Layout
```
┌─────────────────────────────────┐
│         MentorVerse             │ ← Logo
│                                 │
│ ┌─────────────────────────────┐ │
│ │        Welcome Back         │ │ ← Title
│ │                             │ │
│ │ Email                       │ │ ← Input field
│ │ [input field]               │ │
│ │                             │ │
│ │ Password                    │ │ ← Input field
│ │ [input field]               │ │
│ │                             │ │
│ │ [ ] Remember me             │ │ ← Checkbox
│ │                             │ │
│ │ [Login Button]              │ │ ← Primary button
│ │                             │ │
│ │ ────── or ──────            │ │ ← Divider
│ │                             │ │
│ │ [Continue with Google]      │ │ ← Social buttons
│ │ [Continue with Apple]       │ │
│ │ [Continue with Facebook]    │ │
│ │ [Continue with LinkedIn]    │ │
│ │                             │ │
│ │ Don't have account? Sign up │ │ ← Link to register
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### Key Interactions
- Email/password validation on blur
- Login button shows loading spinner
- Social buttons open OAuth flow
- Error messages below inputs
- Success → navigate to initial route

#### API Endpoints
- `POST /auth/login` - Email/password login
- `POST /auth/oauth/{provider}/url` - Get OAuth URL
- `POST /auth/oauth/{provider}/callback` - Exchange code for tokens

#### Validation Rules
- Email: Required, valid email format
- Password: Required, minimum 8 characters
- Error states: Red border + error text below input

### B. Onboarding (Individual + Business)

#### Purpose
- Collect user profile information
- Set learning/business goals
- Complete account setup

#### Individual Flow (3 Steps)
```
Step 1: Personal Info
├── Bio (textarea)
├── Goals (multi-select chips)
├── Primary focus (dropdown)
├── Current challenges (textarea)
└── Experience level (radio buttons)

Step 2: Preferences
├── Learning interests (multi-select)
├── Preferred content types (multi-select)
├── Time commitment (slider)
└── Notification preferences

Step 3: Complete
├── Summary of selections
├── Profile preview
└── Finish button
```

#### Business Flow (3 Steps)
```
Step 1: Company Info
├── Business name
├── Industry (dropdown)
├── Company size (dropdown)
├── Website (optional)
└── Description

Step 2: Business Goals
├── Main challenge (textarea)
├── Monthly revenue (dropdown)
├── Team size learning (number)
└── Growth objectives

Step 3: Complete
├── Business profile summary
├── Team setup options
└── Finish button
```

#### Progress Tracking
- Step indicator (1/2/3 circles)
- Progress bar at top
- Back/Next buttons
- Skip optional fields

#### API Endpoints
- `POST /me/onboarding/individual` - Individual onboarding
- `POST /me/onboarding/business` - Business onboarding
- `GET /me` - Fetch current user data

### C. User Dashboard

#### Purpose
- Overview of user's learning journey
- Quick access to content and mentors
- Progress tracking

#### Layout
```
┌─────────────────────────────────┐
│         My Dashboard            │ ← Header
│                                 │
│ ┌─┬─┬─┐                         │ ← Stats cards (3-col)
│ │ │ │ │                         │
│ │ │ │ │  Courses: 5             │
│ │ │ │ │  Mentors: 3             │
│ │ │ │ │  Hours: 24              │
│ └─┴─┴─┘                         │
│                                 │
│ Continue Learning               │ ← Section
│ ┌─────────────────────────────┐ │
│ │ [Course Card] [Card] [Card] │ │ ← 3-col grid
│ └─────────────────────────────┘ │
│                                 │
│ Suggested for You              │ ← Section
│ ┌─────────────────────────────┐ │
│ │ [Course Card] [Card] [Card] │ │ ← 3-col grid
│ └─────────────────────────────┘ │
│                                 │
│ Quick Actions                  │ ← Section
│ ┌─┬─┬─┐                         │ ← 3-col grid
│ │ │ │ │                         │
│ │ │ │ │  Browse Mentors        │
│ │ │ │ │  Find Courses          │
│ │ │ │ │  AI Mentor             │
│ └─┴─┴─┘                         │
└─────────────────────────────────┘
```

#### Data Sources
- `GET /me/dashboard` - Stats and recommendations
- Response structure:
```json
{
  "stats": {
    "totalCourses": 5,
    "totalMentors": 3,
    "learningHours": 24
  },
  "continueLearning": [...],
  "suggestedContent": [...],
  "recentActivity": [...]
}
```

### D. Mentor List & Detail

#### Mentor Cards (Browse Page)
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │         [Avatar]            │ │ ← 48px circle
│ │                             │ │
│ │ John Smith                  │ │ ← Name
│ │ Senior Developer            │ │ ← Headline
│ │                             │ │
│ │ [React] [TypeScript] [Node] │ │ ← Expertise tags
│ │                             │ │
│ │ 8 years experience          │ │ ← Footer
│ │                             │ │
│ │ [Subscribe Button]          │ │ ← CTA
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### Mentor Detail Page
```
Hero Section:
├── Gradient banner (64px)
├── Large avatar (overlapping)
├── Name + headline + badges
├── Subscribe/Book appointment buttons

Content Sections:
├── Intro video (16:9 aspect)
├── About text
├── Expertise badges
├── Achievements
├── Published courses grid
```

#### Subscribe Logic
- Not logged in → "Login to Subscribe" (redirects to login)
- Not subscribed → "Subscribe to Mentor" button
- Subscribed → "Subscribed" badge + "Book Appointment" button

#### API Endpoints
- `GET /mentors` - List mentors (with pagination)
- `GET /mentors/{id}` - Mentor details
- `POST /mentors/{id}/subscribe` - Subscribe
- `GET /mentors/{id}/subscription-status` - Check subscription

### E. Course List & Detail

#### Course Cards
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │      [Course Image]         │ │ ← 48px height
│ │ [Play Icon]                 │ │ ← Video indicator
│ │                             │ │
│ │ $49                         │ │ ← Price badge (top-right)
│ │ Video Course                │ │ ← Type badge (top-left)
│ │                             │ │
│ │ React Masterclass           │ │ ← Title
│ │ by John Smith               │ │ ← Mentor name
│ │                             │ │
│ │ Learn React from scratch... │ │ ← Description (2 lines)
│ │                             │ │
│ │ [Beginner] [2h] [4.8★]      │ │ ← Tags + duration + rating
│ │                             │ │
│ │ [Purchase Button]           │ │ ← CTA
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### Course Detail Page
```
Hero:
├── Cover image (full width)
├── Title + mentor + badges
├── Price + purchase button

Content:
├── Course description
├── Learning objectives
├── Course outline (accordion)
├── Reviews section
├── Related courses
```

#### Purchase Flow
- Click "Purchase" → Opens checkout modal/page
- External payment processing
- Success → Access granted

#### API Endpoints
- `GET /content` - List courses
- `GET /content/{id}` - Course details
- `GET /content/{id}/full` - Full course content
- `POST /payments/checkout` - Initiate purchase

### F. AI Chat

#### Layout
```
┌─────────────────┬───────────────┐
│ Sessions        │ Chat Area     │ ← 1:3 ratio
│ ├─────────────┤ │               │
│ [Session 1]   │ │ [Messages]    │
│ [Session 2]   │ │               │
│ [+ New]       │ │ [Input Bar]   │
│               │ │               │
└─────────────────┴───────────────┘
```

#### Message Bubbles
```
Bot Message:
┌─────────────────────────────────┐
│ 🤖 [Avatar]                     │
│                                 │
│ Hello! How can I help you      │
│ learn today?                   │
└─────────────────────────────────┘

User Message:
┌─────────────────────────────────┐
│                           [You] │
│                                 │
│ I want to learn React          │
└─────────────────────────────────┘
```

#### API Endpoints
- `GET /ai/chat/sessions` - List chat sessions
- `POST /ai/chat/sessions` - Create new session
- `GET /ai/chat/sessions/{id}/messages` - Get messages
- `POST /ai/chat/sessions/{id}/messages` - Send message

### G. Mentor Dashboard

#### Stats Overview
```
┌─┬─┬─┬─┐
│ │ │ │ │  $2,450 Revenue
│ │ │ │ │  23 Students
│ │ │ │ │  45 Purchases
│ │ │ │ │  8 Courses
└─┴─┴─┴─┘
```

#### Content Performance
```
Top Content:
├── Course 1: $850 revenue, 12 purchases
├── Course 2: $620 revenue, 8 purchases
├── Course 3: $420 revenue, 6 purchases
```

#### Quick Actions
- Create Manual Course
- Use AI Builder (featured)

#### API Endpoints
- `GET /mentor/dashboard` - Dashboard stats
- `GET /mentor/content` - My courses

### H. AI Course Builder

#### Step 1: Course Ideas
```
What course do you want to create?

Topic: [Input field]
Target Audience: [Dropdown]
Course Length: [Dropdown]
Learning Objectives: [Textarea]

[Generate Course Button]
```

#### Step 2: Draft Review
```
Generated Course Outline:

Title: React for Beginners
Description: [Generated text]
Modules:
1. Introduction to React
2. Components and Props
3. State Management
4. Hooks

[Edit Draft] [Save Course] [Regenerate]
```

#### Step 3: Refine
```
Refine your course:

[Accordion sections for each module]
├── Module 1: Introduction
│   ├── Lesson 1: What is React?
│   ├── Lesson 2: Setting up environment
│   └── [Add lesson]

[Save Changes] [Publish Course]
```

### I. My Mentors (User View)

#### Layout
```
My Mentors (3)

┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ [Avatar] John Smith         │ │
│ │ Senior Developer            │ │
│ │                             │ │
│ │ [Active]                    │ │ ← Status badge
│ │ Joined: Jan 15, 2025       │ │
│ │                             │ │
│ │ [Book Appointment]          │ │ ← Primary button
│ │ [View Profile]              │ │ ← Outline button
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### API Endpoints
- `GET /me/subscriptions` - My subscribed mentors

### J. My Mentees (Mentor View)

#### Layout
```
My Students (23)

Search: [Input field]

┌─────────────────────────────────┐
│ John Doe                       │ │
│ john@example.com               │ │
│ Individual • Active            │ │ ← Badges
│ Joined: Jan 10, 2025           │ │
│                                 │ │
│ Purchased Content:             │ │
│ • React Masterclass ($49)      │ │
│ • Advanced TypeScript ($79)    │ │
│                                 │ │
│ Last Activity: 2 days ago      │ │
└─────────────────────────────────┘
```

#### API Endpoints
- `GET /mentor/mentees` - My students list

---

## 5. SUBSCRIPTIONS & MENTOR–MENTEE RELATIONSHIP UI

### Subscribe Button States

#### Not Authenticated
```
[Login to Subscribe] ← Redirects to /auth/login?redirect=/mentors/{id}
```

#### Not Subscribed
```
[Subscribe to this Mentor] ← Primary button with UserPlus icon
Loading: [Loading spinner] Checking...
```

#### Subscribed
```
[Subscribed ✓] ← Disabled badge (green checkmark)
[Book Appointment] ← Primary purple button
[Unsubscribe] ← Text link (muted red)
```

### My Mentors Page (User)

#### Card Layout
- Avatar (32x32px) with ring border
- Name + headline
- Status badge (Active/Paused/Ended)
- Country flag + location
- Bio excerpt (2 lines)
- Stats: courses count + joined date
- Action buttons: Book Appointment (primary) + View Profile (outline)

#### Empty State
```
No mentors yet!

[Illustration icon]
Discover amazing mentors and start your learning journey.

[Browse Mentors Button]
```

### My Mentees Page (Mentor)

#### Student Cards
- Avatar (24x24px)
- Name + email
- Account type + status badges
- Join date
- Purchased content list (in gray box)
- Last activity timestamp

#### Search & Filter
- Search by name/email
- Filter by status (active/paused/ended)
- Pagination (20 per page)

### Appointment Booking Modal

#### Current Implementation (UI Only)
```
Book Appointment with John Smith

📅 Preview Feature - Coming Soon!

Date: [Date picker - today minimum]
Time: [Time picker]
Appointment Type: [Dropdown]
├── Video Call
├── Phone Call
├── In-Person
└── Messaging

Message: [Textarea - required]
What would you like to discuss?

[Cancel] [Book Appointment]
```

#### Form Validation
- All fields required
- Date cannot be past
- Submit logs data to console (no API call yet)
- Shows success toast + closes modal

#### Future API Structure
```json
{
  "mentor_id": "uuid",
  "date": "2025-11-22",
  "time": "14:00",
  "appointment_type": "video_call",
  "message": "Discussion topics...",
  "requested_at": "2025-11-22T10:30:00Z"
}
```

---

## 6. STATE MANAGEMENT & API PATTERNS

### State Management Approach

#### Provider Pattern (Similar to React Context)
```dart
// AuthProvider - manages user authentication state
class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isLoading = true;
  
  // Getters
  User? get user => _user;
  bool get isAuthenticated => _user != null;
  
  // Actions
  Future<void> login(String email, String password) async {
    // API call, store tokens, update user
    notifyListeners();
  }
  
  Future<void> logout() async {
    // Clear tokens, reset user
    notifyListeners();
  }
}

// ContentProvider - manages content/courses state
class ContentProvider extends ChangeNotifier {
  List<Course> _courses = [];
  bool _isLoading = false;
  
  // CRUD operations with API calls
  Future<void> loadCourses() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final response = await api.getCourses();
      _courses = response.data;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
```

#### API Client Structure
```dart
class ApiClient {
  final Dio _dio;
  
  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://api.mentorverse.com',
      connectTimeout: Duration(seconds: 10),
      receiveTimeout: Duration(seconds: 10),
    ));
    
    // Add interceptors for auth tokens
    _dio.interceptors.add(AuthInterceptor());
  }
  
  // Generic request methods
  Future<T> get<T>(String path, {Map<String, dynamic>? query}) async {
    final response = await _dio.get(path, queryParameters: query);
    return response.data as T;
  }
  
  Future<T> post<T>(String path, {dynamic data}) async {
    final response = await _dio.post(path, data: data);
    return response.data as T;
  }
}
```

### Loading & Error States

#### Skeleton Loading
```dart
class CourseCardSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          Container(
            height: 120,
            color: Colors.grey[300],
          ),
          Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(height: 16, color: Colors.grey[300]),
                SizedBox(height: 8),
                Container(height: 14, width: 100, color: Colors.grey[300]),
                SizedBox(height: 12),
                Row(
                  children: List.generate(3, (index) => 
                    Container(
                      height: 24, 
                      width: 60, 
                      margin: EdgeInsets.only(right: 8),
                      color: Colors.grey[300]
                    )
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

#### Error Handling
```dart
class ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 48, color: Colors.red),
          SizedBox(height: 16),
          Text(message, textAlign: TextAlign.center),
          SizedBox(height: 16),
          ElevatedButton(
            onPressed: onRetry,
            child: Text('Try Again'),
          ),
        ],
      ),
    );
  }
}
```

### Data Refetching Patterns

#### After Authentication
```dart
// In AuthProvider.login()
Future<void> login() async {
  // ... login API call
  
  // Refetch user-specific data
  await contentProvider.loadMyCourses();
  await mentorsProvider.loadMyMentors();
  await dashboardProvider.loadStats();
}
```

#### After Content Creation
```dart
// In ContentProvider.createCourse()
Future<void> createCourse(CourseData data) async {
  final newCourse = await api.createCourse(data);
  
  // Add to local list
  _courses.insert(0, newCourse);
  
  // Refetch dashboard stats
  await dashboardProvider.refreshStats();
  
  notifyListeners();
}
```

#### After Subscription Changes
```dart
// In MentorsProvider.subscribe()
Future<void> subscribeToMentor(String mentorId) async {
  await api.subscribeMentor(mentorId);
  
  // Update local mentor status
  final mentor = _mentors.firstWhere((m) => m.id == mentorId);
  mentor.isSubscribed = true;
  
  // Refetch my mentors list
  await loadMyMentors();
  
  notifyListeners();
}
```

### API Response Structures

#### Common Pagination Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

#### Error Response
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Email is required",
  "details": {
    "field": "email",
    "value": null
  }
}
```

#### Success Response
```json
{
  "message": "Course created successfully",
  "data": { ... }
}
```

---

## 7. MOBILE ADAPTATION GUIDANCE

### Layout Adjustments

#### Single Column Lists
- **Web**: Mentor grid (2-6 columns)
- **Mobile**: Single column list with larger cards
- **Web**: Course grid (4 columns max)
- **Mobile**: Vertical scroll list

#### Hero Sections
- **Web**: Full-width with side content
- **Mobile**: Stacked layout (image → text → buttons)

#### Navigation
- **Web**: Horizontal navbar + dropdown
- **Mobile**: Bottom tab bar + drawer menu

### Component Scaling

#### Cards
- **Web**: Compact (hover effects, multiple per row)
- **Mobile**: Larger touch targets (48px+ height), single column

#### Buttons
- **Web**: Smaller (36-40px height)
- **Mobile**: Larger (48px+ height) for touch

#### Inputs
- **Web**: Standard size
- **Mobile**: Larger with proper keyboard types

### Content Prioritization

#### Essential vs Optional
- **Essential on mobile**: Core actions, primary content
- **Optional on mobile**: Secondary links, extra details

#### Information Hierarchy
- **Web**: Side-by-side layouts
- **Mobile**: Vertical stacking with clear sections

### Interaction Patterns

#### Hover → Tap
- **Web**: Hover states for discovery
- **Mobile**: Tap states with visual feedback

#### Multi-select → Stepper
- **Web**: Multi-select dropdowns
- **Mobile**: Step-by-step selection flows

### Performance Considerations

#### Image Loading
- **Web**: Multiple images per view
- **Mobile**: Lazy loading, smaller images

#### List Virtualization
- **Web**: Standard lists
- **Mobile**: Virtualized lists for large datasets

### Specific Screen Adaptations

#### Mentor Detail Page
```
Mobile Layout:
├── Hero image (full width)
├── Avatar overlapping image
├── Name + headline + badges
├── Subscribe button (full width)
├── Book appointment button (if subscribed)
├── About section
├── Courses list (vertical scroll)
```

#### Dashboard
```
Mobile Layout:
├── Stats cards (horizontal scroll)
├── Continue learning (horizontal scroll)
├── Quick actions (2x2 grid)
├── Recent activity (vertical list)
```

#### Course List
```
Mobile Layout:
├── Search bar (sticky top)
├── Filter chips (horizontal scroll)
├── Course cards (full width, stacked)
├── Load more button
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Foundation
- [ ] Set up Flutter project with navigation
- [ ] Implement design system (colors, typography, components)
- [ ] Create API client with Dio
- [ ] Implement auth flow (login/register/social)
- [ ] Set up state management (Provider pattern)

### Phase 2: Core Screens
- [ ] Home page (public)
- [ ] Authentication screens
- [ ] Onboarding flow
- [ ] User dashboard
- [ ] Mentor browse + detail

### Phase 3: Content & Learning
- [ ] Course browse + detail
- [ ] AI chat interface
- [ ] Purchase/checkout flow
- [ ] Content consumption

### Phase 4: Mentor Features
- [ ] Mentor dashboard
- [ ] Course creation (manual + AI)
- [ ] My mentees management
- [ ] Revenue/analytics

### Phase 5: Advanced Features
- [ ] Subscription system
- [ ] Appointment booking (when API ready)
- [ ] Admin panel
- [ ] Push notifications

---

**This document provides the complete blueprint for recreating MentorVerse on Flutter mobile with 1:1 feature parity and design consistency. The web app's UX patterns, API integrations, and business logic are all documented for seamless mobile implementation.**