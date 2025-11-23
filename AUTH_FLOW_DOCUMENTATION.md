# Authentication Flow Documentation
## Registration → Login → Dashboard Journey

**Platform:** MentorVerse  
**Date:** November 23, 2025  
**Version:** 1.0  

---

## Table of Contents
1. [Overview](#overview)
2. [Registration Flow](#registration-flow)
3. [Login Flow](#login-flow)
4. [Post-Authentication Routing](#post-authentication-routing)
5. [Social Login Flow](#social-login-flow)
6. [API Reference](#api-reference)
7. [Error Handling](#error-handling)
8. [Implementation Examples](#implementation-examples)

---

## Overview

This document details the complete authentication journey from user registration through login to dashboard access, including all API endpoints consumed and data flows.

### Key Concepts
- **Access Token**: JWT token for API authentication (stored in localStorage)
- **Refresh Token**: Long-lived token for obtaining new access tokens
- **User Object**: Contains user profile, role, and onboarding status
- **Initial Route**: Destination after successful authentication

---

## Registration Flow

### Step 1: User Registration Form

#### UI Components
```
Registration Form
├── Full Name (text input)
├── Email (email input)
├── Password (password input)
├── Account Type (radio buttons)
│   ├── Individual
│   └── Business
├── Terms & Conditions (checkbox)
└── Submit Button
```

#### Form Validation
- **Full Name**: Required, minimum 2 characters
- **Email**: Required, valid email format
- **Password**: Required, minimum 8 characters, must contain:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
- **Account Type**: Required selection
- **Terms**: Must be accepted

### Step 2: API Call - Register User

#### Endpoint
```
POST /auth/register
```

#### Request Headers
```json
{
  "Content-Type": "application/json"
}
```

#### Request Body
```json
{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123",
  "account_type": "individual"
}
```

**Field Details:**
- `full_name` (string, required): User's full name
- `email` (string, required): Valid email address
- `password` (string, required): Minimum 8 characters
- `account_type` (string, required): Either "individual" or "business"

#### Response (Success - 201 Created)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "user": {
    "id": "usr_123456789",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "account_type": "individual",
    "role": "user",
    "onboarding_completed": false,
    "created_at": "2025-11-23T10:30:00Z",
    "signup_intent": "user",
    "mentor_status": "none"
  }
}
```

#### Response (Error - 400 Bad Request)
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Email already exists",
  "details": {
    "field": "email",
    "value": "john.doe@example.com"
  }
}
```

### Step 3: Store Authentication Data

After successful registration, the client must:

1. **Store Access Token**
```javascript
localStorage.setItem('access_token', response.access_token);
```

2. **Store Refresh Token** (optional, for token refresh)
```javascript
localStorage.setItem('refresh_token', response.refresh_token);
```

3. **Store User Object**
```javascript
localStorage.setItem('user', JSON.stringify(response.user));
```

### Step 4: Determine Initial Route

Based on the user object returned:

```javascript
function getInitialRoute(user) {
  // Check onboarding status
  if (!user.onboarding_completed) {
    return '/onboarding';
  }
  
  // Check role
  if (user.role === 'admin') {
    return '/admin';
  }
  
  if (user.role === 'mentor') {
    return '/mentor/dashboard';
  }
  
  // Default: normal user
  return '/dashboard';
}
```

For new registrations:
- `onboarding_completed` is **false** by default
- Route: **`/onboarding`**

### Step 5: Navigate to Onboarding

The user is redirected to complete their profile based on account type.

---

## Login Flow

### Step 1: User Login Form

#### UI Components
```
Login Form
├── Email (email input)
├── Password (password input)
├── Remember Me (checkbox, optional)
├── Submit Button
├── Forgot Password Link
└── Social Login Buttons
    ├── Continue with Google
    ├── Continue with Apple
    ├── Continue with Facebook
    └── Continue with LinkedIn
```

#### Form Validation
- **Email**: Required, valid email format
- **Password**: Required

### Step 2: API Call - Authenticate User

#### Endpoint
```
POST /auth/login
```

#### Request Headers
```json
{
  "Content-Type": "application/json"
}
```

#### Request Body
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

#### Response (Success - 200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "user": {
    "id": "usr_123456789",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "account_type": "individual",
    "role": "user",
    "onboarding_completed": true,
    "created_at": "2025-11-23T10:30:00Z",
    "signup_intent": "user",
    "mentor_status": "none"
  }
}
```

#### Response (Error - 401 Unauthorized)
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

### Step 3: Store Authentication Data

Same as registration:
1. Store access token in localStorage
2. Store refresh token in localStorage
3. Store user object in localStorage

### Step 4: Determine Dashboard Route

```javascript
function getPostLoginRoute(user) {
  // Admin users
  if (user.role === 'admin') {
    return '/admin';
  }
  
  // Mentor users
  if (user.role === 'mentor') {
    return '/mentor/dashboard';
  }
  
  // Users who applied to be mentors
  if (user.signup_intent === 'mentor') {
    if (user.mentor_status === 'pending_approval') {
      return '/mentor/pending';
    }
    if (user.mentor_status === 'none') {
      return '/mentor/apply';
    }
  }
  
  // Regular users
  if (!user.onboarding_completed) {
    return '/onboarding';
  }
  
  return '/dashboard';
}
```

### Step 5: Navigate to Dashboard

Based on the route determination logic:

**For Normal Users (role: "user", onboarding completed):**
- Route: **`/dashboard`**

**For Mentors:**
- Route: **`/mentor/dashboard`**

**For Admins:**
- Route: **`/admin`**

---

## Post-Authentication Routing

### Decision Tree

```
User Logs In
│
├─ role = "admin"
│  └─> /admin
│
├─ role = "mentor"
│  └─> /mentor/dashboard
│
└─ role = "user"
   │
   ├─ signup_intent = "mentor"
   │  │
   │  ├─ mentor_status = "pending_approval"
   │  │  └─> /mentor/pending
   │  │
   │  └─ mentor_status = "none"
   │     └─> /mentor/apply
   │
   ├─ onboarding_completed = false
   │  └─> /onboarding
   │
   └─ onboarding_completed = true
      └─> /dashboard
```

### Route Descriptions

#### `/dashboard` - User Dashboard
**Who sees this:** Regular users with completed onboarding

**API Calls on Load:**
```
GET /me/dashboard
```

**Response Structure:**
```json
{
  "stats": {
    "totalCourses": 5,
    "totalMentors": 3,
    "learningHours": 24,
    "completedCourses": 2
  },
  "continueLearning": [
    {
      "id": "crs_001",
      "title": "React Masterclass",
      "progress": 65,
      "thumbnail": "https://...",
      "mentor": "John Smith"
    }
  ],
  "suggestedContent": [
    {
      "id": "crs_002",
      "title": "TypeScript Advanced",
      "price": 79.99,
      "thumbnail": "https://...",
      "mentor": "Jane Doe"
    }
  ],
  "recentActivity": [
    {
      "type": "course_completed",
      "content_id": "crs_003",
      "timestamp": "2025-11-22T14:30:00Z"
    }
  ]
}
```

#### `/mentor/dashboard` - Mentor Dashboard
**Who sees this:** Users with role = "mentor"

**API Calls on Load:**
```
GET /mentor/dashboard
```

**Response Structure:**
```json
{
  "stats": {
    "totalRevenue": 2450.00,
    "totalStudents": 23,
    "totalPurchases": 45,
    "publishedContent": 8
  },
  "topContent": [
    {
      "id": "crs_001",
      "title": "React Masterclass",
      "sales": 12,
      "revenue": 850.00,
      "type": "video_course"
    }
  ],
  "recentPurchases": [
    {
      "content_id": "crs_001",
      "buyer": "John Doe",
      "amount": 79.99,
      "purchased_at": "2025-11-23T09:15:00Z"
    }
  ],
  "upcomingAppointments": []
}
```

#### `/admin` - Admin Panel
**Who sees this:** Users with role = "admin"

**API Calls on Load:**
```
GET /admin/stats
GET /admin/mentor-applications
```

#### `/onboarding` - Complete Profile
**Who sees this:** Users with onboarding_completed = false

**API Calls:**
```
POST /me/onboarding/individual (for individual accounts)
POST /me/onboarding/business (for business accounts)
```

---

## Social Login Flow

### Supported Providers
- Google
- Apple
- Facebook
- LinkedIn

### Step 1: Initiate OAuth Flow

#### Endpoint (Get OAuth URL)
```
POST /auth/oauth/{provider}/url
```

**Providers:** `google`, `apple`, `facebook`, `linkedin`

#### Request Headers
```json
{
  "Content-Type": "application/json"
}
```

#### Request Body
```json
{
  "redirect_uri": "https://app.mentorverse.com/auth/callback"
}
```

#### Response (200 OK)
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "state": "random_state_string_for_csrf_protection"
}
```

### Step 2: User Authorizes Application

1. Client opens `authorization_url` in webview or browser
2. User logs in with provider (Google/Apple/etc.)
3. User grants permissions
4. Provider redirects to `redirect_uri` with auth code

**Redirect Format:**
```
https://app.mentorverse.com/auth/callback?code=AUTH_CODE&state=STATE
```

### Step 3: Exchange Code for Tokens

#### Endpoint
```
POST /auth/oauth/{provider}/callback
```

#### Request Headers
```json
{
  "Content-Type": "application/json"
}
```

#### Request Body
```json
{
  "code": "AUTH_CODE_FROM_REDIRECT",
  "state": "STATE_FROM_STEP_1",
  "redirect_uri": "https://app.mentorverse.com/auth/callback"
}
```

#### Response (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "user": {
    "id": "usr_123456789",
    "email": "john.doe@gmail.com",
    "full_name": "John Doe",
    "account_type": "individual",
    "role": "user",
    "onboarding_completed": false,
    "created_at": "2025-11-23T10:30:00Z",
    "signup_intent": "user",
    "mentor_status": "none"
  }
}
```

**Note:** For first-time social login users, `onboarding_completed` will be false.

### Step 4: Store Tokens and Navigate

Same as email/password login:
1. Store tokens
2. Determine initial route
3. Navigate to dashboard or onboarding

---

## API Reference

### Authentication Endpoints

#### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "full_name": "string",
  "email": "string",
  "password": "string",
  "account_type": "individual" | "business"
}
```

**Success Response (201):**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "Bearer",
  "user": {User Object}
}
```

#### 2. Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "Bearer",
  "user": {User Object}
}
```

#### 3. Get Current User
```http
GET /me
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
  "id": "string",
  "email": "string",
  "full_name": "string",
  "account_type": "individual" | "business",
  "role": "user" | "mentor" | "admin",
  "onboarding_completed": boolean,
  "created_at": "string",
  "signup_intent": "user" | "mentor",
  "mentor_status": "none" | "pending_approval" | "active" | "suspended"
}
```

#### 4. Refresh Access Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "string"
}
```

**Success Response (200):**
```json
{
  "access_token": "string",
  "token_type": "Bearer"
}
```

#### 5. Logout
```http
POST /auth/logout
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### OAuth Endpoints

#### 6. Get OAuth Authorization URL
```http
POST /auth/oauth/{provider}/url
Content-Type: application/json

{
  "redirect_uri": "string"
}
```

**Providers:** google, apple, facebook, linkedin

**Success Response (200):**
```json
{
  "authorization_url": "string",
  "state": "string"
}
```

#### 7. OAuth Callback
```http
POST /auth/oauth/{provider}/callback
Content-Type: application/json

{
  "code": "string",
  "state": "string",
  "redirect_uri": "string"
}
```

**Success Response (200):**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "Bearer",
  "user": {User Object}
}
```

### Dashboard Endpoints

#### 8. Get User Dashboard
```http
GET /me/dashboard
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
  "stats": {
    "totalCourses": number,
    "totalMentors": number,
    "learningHours": number,
    "completedCourses": number
  },
  "continueLearning": Array<Course>,
  "suggestedContent": Array<Course>,
  "recentActivity": Array<Activity>
}
```

#### 9. Get Mentor Dashboard
```http
GET /mentor/dashboard
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
  "stats": {
    "totalRevenue": number,
    "totalStudents": number,
    "totalPurchases": number,
    "publishedContent": number
  },
  "topContent": Array<ContentPerformance>,
  "recentPurchases": Array<Purchase>,
  "upcomingAppointments": Array<Appointment>
}
```

---

## Error Handling

### Common Error Codes

#### 400 Bad Request
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "field": "email",
    "value": "invalid-email"
  }
}
```

**Causes:**
- Invalid email format
- Password too short
- Missing required fields
- Invalid account type

#### 401 Unauthorized
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

**Causes:**
- Wrong email/password combination
- Account doesn't exist
- Expired or invalid access token

#### 403 Forbidden
```json
{
  "error": "FORBIDDEN",
  "message": "You don't have permission to access this resource"
}
```

**Causes:**
- Trying to access admin routes without admin role
- Accessing mentor features without mentor role

#### 409 Conflict
```json
{
  "error": "USER_EXISTS",
  "message": "An account with this email already exists"
}
```

**Causes:**
- Email already registered
- Duplicate account creation attempt

#### 429 Too Many Requests
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many login attempts. Please try again in 15 minutes."
}
```

**Causes:**
- Multiple failed login attempts
- API rate limit exceeded

#### 500 Internal Server Error
```json
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred. Please try again."
}
```

### Error Handling Best Practices

1. **Display User-Friendly Messages**
```javascript
function handleAuthError(error) {
  const errorMessages = {
    'INVALID_CREDENTIALS': 'Invalid email or password',
    'USER_EXISTS': 'This email is already registered',
    'VALIDATION_ERROR': 'Please check your input and try again',
    'RATE_LIMIT_EXCEEDED': 'Too many attempts. Please try again later.',
  };
  
  return errorMessages[error.error] || 'Something went wrong. Please try again.';
}
```

2. **Retry Logic for Network Errors**
```javascript
async function apiCallWithRetry(apiCall, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1 || error.status < 500) {
        throw error;
      }
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

3. **Token Refresh on 401**
```javascript
async function handleApiCall(endpoint) {
  try {
    return await api.get(endpoint);
  } catch (error) {
    if (error.status === 401) {
      // Try to refresh token
      await refreshAccessToken();
      // Retry original request
      return await api.get(endpoint);
    }
    throw error;
  }
}
```

---

## Implementation Examples

### Complete Registration Flow (JavaScript)

```javascript
// 1. Registration Form Submission
async function handleRegistration(formData) {
  try {
    // Validate form data
    if (!validateForm(formData)) {
      throw new Error('Please fill all required fields');
    }
    
    // Show loading state
    setLoading(true);
    
    // API call
    const response = await fetch('https://api.mentorverse.com/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        account_type: formData.accountType,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const data = await response.json();
    
    // Store authentication data
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Determine initial route
    const initialRoute = getInitialRoute(data.user);
    
    // Navigate
    router.push(initialRoute);
    
  } catch (error) {
    console.error('Registration failed:', error);
    showErrorNotification(error.message);
  } finally {
    setLoading(false);
  }
}

function validateForm(formData) {
  if (!formData.fullName || formData.fullName.length < 2) {
    return false;
  }
  if (!isValidEmail(formData.email)) {
    return false;
  }
  if (!formData.password || formData.password.length < 8) {
    return false;
  }
  if (!formData.accountType) {
    return false;
  }
  return true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getInitialRoute(user) {
  if (user.role === 'admin') return '/admin';
  if (user.role === 'mentor') return '/mentor/dashboard';
  if (!user.onboarding_completed) return '/onboarding';
  return '/dashboard';
}
```

### Complete Login Flow (JavaScript)

```javascript
// 1. Login Form Submission
async function handleLogin(email, password) {
  try {
    // Show loading
    setLoading(true);
    
    // API call
    const response = await fetch('https://api.mentorverse.com/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const data = await response.json();
    
    // Store tokens
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Determine dashboard route
    const dashboardRoute = getPostLoginRoute(data.user);
    
    // Navigate to dashboard
    router.push(dashboardRoute);
    
    // Show success message
    showSuccessNotification('Welcome back!');
    
  } catch (error) {
    console.error('Login failed:', error);
    showErrorNotification(error.message || 'Invalid email or password');
  } finally {
    setLoading(false);
  }
}

function getPostLoginRoute(user) {
  if (user.role === 'admin') {
    return '/admin';
  }
  
  if (user.role === 'mentor') {
    return '/mentor/dashboard';
  }
  
  if (user.signup_intent === 'mentor') {
    if (user.mentor_status === 'pending_approval') {
      return '/mentor/pending';
    }
    if (user.mentor_status === 'none') {
      return '/mentor/apply';
    }
  }
  
  if (!user.onboarding_completed) {
    return '/onboarding';
  }
  
  return '/dashboard';
}
```

### Social Login Flow (JavaScript)

```javascript
// 1. Initiate Google OAuth
async function loginWithGoogle() {
  try {
    // Get OAuth URL
    const response = await fetch('https://api.mentorverse.com/auth/oauth/google/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        redirect_uri: window.location.origin + '/auth/callback',
      }),
    });
    
    const data = await response.json();
    
    // Store state for verification
    sessionStorage.setItem('oauth_state', data.state);
    
    // Redirect to Google
    window.location.href = data.authorization_url;
    
  } catch (error) {
    console.error('OAuth initiation failed:', error);
    showErrorNotification('Failed to connect with Google');
  }
}

// 2. Handle OAuth Callback
async function handleOAuthCallback() {
  try {
    // Get code and state from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    // Verify state
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid OAuth state');
    }
    
    // Exchange code for tokens
    const response = await fetch('https://api.mentorverse.com/auth/oauth/google/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state,
        redirect_uri: window.location.origin + '/auth/callback',
      }),
    });
    
    const data = await response.json();
    
    // Store tokens
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Clean up
    sessionStorage.removeItem('oauth_state');
    
    // Navigate to dashboard
    const dashboardRoute = getPostLoginRoute(data.user);
    router.push(dashboardRoute);
    
  } catch (error) {
    console.error('OAuth callback failed:', error);
    showErrorNotification('Authentication failed');
    router.push('/auth/login');
  }
}
```

### Dashboard Data Loading (JavaScript)

```javascript
// Load User Dashboard
async function loadUserDashboard() {
  try {
    setLoading(true);
    
    const accessToken = localStorage.getItem('access_token');
    
    const response = await fetch('https://api.mentorverse.com/me/dashboard', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to load dashboard');
    }
    
    const data = await response.json();
    
    // Update state with dashboard data
    setStats(data.stats);
    setContinueLearning(data.continueLearning);
    setSuggestedContent(data.suggestedContent);
    setRecentActivity(data.recentActivity);
    
  } catch (error) {
    console.error('Dashboard loading failed:', error);
    
    // If 401, try to refresh token
    if (error.status === 401) {
      await refreshToken();
      await loadUserDashboard(); // Retry
    } else {
      showErrorNotification('Failed to load dashboard');
    }
  } finally {
    setLoading(false);
  }
}

// Token Refresh
async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  
  const response = await fetch('https://api.mentorverse.com/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
}
```

---

## Security Considerations

### 1. Token Storage
- **Web:** Use `localStorage` for access tokens (acceptable for SPAs)
- **Mobile:** Use secure storage (Keychain/KeyStore)
- **Never** store tokens in cookies without HttpOnly flag

### 2. Password Security
- Minimum 8 characters
- Complexity requirements enforced
- Never send passwords over non-HTTPS connections

### 3. OAuth Security
- Always validate `state` parameter
- Use PKCE (Proof Key for Code Exchange) when possible
- Implement CSRF protection

### 4. API Security
- All API calls use HTTPS
- Access tokens included in Authorization header
- Tokens have expiration (typically 1 hour)
- Refresh tokens for long-term sessions

### 5. Client-Side Validation
- Validate all inputs before API calls
- Sanitize user inputs
- Show appropriate error messages
- Rate limiting on login attempts

---

## Conclusion

This document provides a complete reference for implementing authentication flows from registration through login to dashboard access. All API endpoints, request/response formats, and routing logic are documented for consistent implementation across web and mobile platforms.

For additional details on specific features, refer to:
- [FLUTTER_IMPLEMENTATION_BLUEPRINT.md](./FLUTTER_IMPLEMENTATION_BLUEPRINT.md) - Complete design system and UI patterns
- [API_INTEGRATION.md](./API_INTEGRATION.md) - Comprehensive API documentation
- [AUTH_IMPLEMENTATION.md](./AUTH_IMPLEMENTATION.md) - Technical auth implementation details

---

**Document Version:** 1.0  
**Last Updated:** November 23, 2025  
**Maintained by:** MentorVerse Engineering Team
