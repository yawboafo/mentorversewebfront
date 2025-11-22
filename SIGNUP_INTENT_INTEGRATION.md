# Signup Intent & Mentor Status Integration

## Summary
Successfully integrated backend API's new `signupIntent` and `mentorStatus` fields to provide proper mentor flow routing without frontend workarounds.

## Changes Made

### 1. Type Definitions (`lib/api/types.ts`)
- ✅ Added `SignupIntent` type: `'user' | 'mentor'`
- ✅ Added `MentorStatus` type: `'none' | 'pending_approval' | 'active' | 'suspended'`
- ✅ Updated `User` interface with optional fields:
  - `signup_intent?: SignupIntent`
  - `mentor_status?: MentorStatus`
- ✅ Updated `BackendUser` interface with camelCase equivalents
- ✅ Updated `transformLoginResponse()` to include new fields

### 2. Auth API (`lib/api/auth.ts`)
- ✅ Updated `register()` to accept optional `signup_intent` parameter
- ✅ Updated all backend response types to include new fields
- ✅ Updated `transformBackendResponse()` to map new fields
- ✅ Updated `getCurrentUser()` to return new fields
- ✅ Cleaned up `logout()` - removed `oauth_intent` localStorage

### 3. Mentor Registration (`app/mentor/join/page.tsx`)
- ✅ Pass `signup_intent: 'mentor'` in registration call
- ✅ Removed `localStorage.setItem('mentor_registration', 'true')`

### 4. User Registration (`app/auth/register/page.tsx`)
- ✅ Pass `signup_intent: 'user'` in registration call

### 5. Login Flow (`app/auth/login/page.tsx`)
- ✅ Completely refactored routing logic to use new fields
- ✅ Removed all `localStorage.getItem('mentor_registration')` checks
- ✅ Removed all `mentorsApi.checkMentorApplicationStatus()` calls
- ✅ New simplified routing:
  1. **Admin** → `/admin`
  2. **Approved Mentor** (`role === 'mentor'`) → `/mentor/dashboard`
  3. **Mentor Intent, Pending** (`signup_intent === 'mentor' && mentor_status === 'pending_approval'`) → `/mentor/pending`
  4. **Mentor Intent, No Application** (`signup_intent === 'mentor' && mentor_status === 'none'`) → `/mentor/apply`
  5. **User, No Onboarding** → `/onboarding`
  6. **User, Onboarded** → `/dashboard`

### 6. OAuth Callback (`app/auth/callback/page.tsx`)
- ✅ Updated both direct token flow and code/state flow
- ✅ Removed all localStorage checks for `oauth_intent` and `mentor_registration`
- ✅ Removed all `mentorsApi.checkMentorApplicationStatus()` calls
- ✅ Use same simplified routing as login flow

## Benefits

### Before (Workarounds)
- ❌ Used localStorage flags (`mentor_registration`)
- ❌ Made extra API calls (`checkMentorApplicationStatus()`)
- ❌ Race conditions between localStorage and API state
- ❌ Complex nested conditionals
- ❌ State could get out of sync

### After (Proper State Management)
- ✅ Single source of truth (backend API)
- ✅ Definitive state in every auth response
- ✅ No extra API calls needed
- ✅ Clean, linear routing logic
- ✅ State always in sync with backend

## User Journey States

The integration properly supports all 5 documented user journey states:

1. **Regular User Signup** (`signup_intent: 'user'`)
   - Onboarding incomplete → `/onboarding`
   - Onboarding complete → `/dashboard`

2. **Mentor Signup, No Application** (`signup_intent: 'mentor'`, `mentor_status: 'none'`)
   - Login → `/mentor/apply`

3. **Mentor Application Pending** (`signup_intent: 'mentor'`, `mentor_status: 'pending_approval'`)
   - Login → `/mentor/pending`

4. **Approved Mentor** (`role: 'mentor'`, `mentor_status: 'active'`)
   - Login → `/mentor/dashboard`

5. **Admin** (`role: 'admin'`)
   - Login → `/admin`

## Testing Checklist

- [ ] Regular user signup → onboarding flow
- [ ] Mentor signup → application flow
- [ ] Mentor application submission → pending state
- [ ] Approved mentor login → mentor dashboard
- [ ] Admin login → admin panel
- [ ] OAuth with user intent
- [ ] OAuth with mentor intent
- [ ] Page refresh persistence (no localStorage needed)
- [ ] Direct browser navigation to protected routes

## Code Removed

- All `localStorage.setItem('mentor_registration', 'true')`
- All `localStorage.getItem('mentor_registration')`
- All `localStorage.setItem('oauth_intent', 'mentor')`
- All `localStorage.getItem('oauth_intent')`
- All `mentorsApi.checkMentorApplicationStatus()` calls in auth flows
- ~100 lines of complex conditional logic

## Deployment

- **Commit**: e6d5299
- **Production URL**: https://mentorversewebfront-hnwvk8p15-me-m.vercel.app
- **Build**: ✅ All 28 routes compiled successfully
- **Status**: ✅ Live

## Notes

- Backend now returns `signupIntent` and `mentorStatus` in all auth responses
- Frontend no longer needs to track mentor state locally
- All routing decisions based on definitive backend state
- Clean separation: registration sets intent, application changes status
