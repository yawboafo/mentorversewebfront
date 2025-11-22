# Subscription & Appointment Flow - Testing Checklist

## ✅ Test Environment
- **Dev Server**: Running at http://localhost:3000
- **Status**: ✅ No compilation errors
- **Date**: November 22, 2025

---

## 🧪 Test Scenarios

### 1. Navigation Links (All User Roles)

#### Test 1.1: Regular User (Mentee) Navigation
- [ ] Log in as a regular user
- [ ] Check navbar shows "My Mentors" link
- [ ] Click "My Mentors" → should navigate to `/dashboard/mentors`
- [ ] Open user dropdown menu
- [ ] Verify "My Mentors" appears in dropdown
- [ ] Verify "Browse Mentors" (renamed from "Mentors")

#### Test 1.2: Mentor Navigation
- [ ] Log in as a mentor
- [ ] Check navbar shows "My Mentees" link
- [ ] Click "My Mentees" → should navigate to `/mentor/mentees`
- [ ] Open mentor dropdown menu
- [ ] Verify "My Mentees" appears in dropdown
- [ ] Verify "Browse Mentors" appears (not just "Mentors")
- [ ] Verify "Become a Mentor" is NOT shown for mentors

---

### 2. Subscription Flow - Logged Out User

#### Test 2.1: Subscribe Redirect (Not Authenticated)
- [ ] Log out (if logged in)
- [ ] Navigate to any mentor profile: `/mentors/{mentor-id}`
- [ ] Verify button shows "Login to Subscribe"
- [ ] Click "Login to Subscribe" button
- [ ] Should redirect to `/auth/login?redirect=/mentors/{mentor-id}`
- [ ] Log in with valid credentials
- [ ] Should redirect back to mentor profile
- [ ] Button should now show "Subscribe to this Mentor"

---

### 3. Subscription Flow - Logged In User

#### Test 3.1: Check Subscription Status
- [ ] Log in as a regular user
- [ ] Navigate to a mentor profile you're NOT subscribed to
- [ ] Watch for loading state: "Checking..." with spinner
- [ ] After loading, button should show "Subscribe to this Mentor"

#### Test 3.2: Subscribe to Mentor
- [ ] Click "Subscribe to this Mentor" button
- [ ] Watch for loading spinner on button
- [ ] Should see success toast: "You're now subscribed to {mentor name}! 🎉"
- [ ] Button changes to badge: "Subscribed ✓" (disabled)
- [ ] New button appears: "Book Appointment" (purple gradient)
- [ ] "Unsubscribe" link appears below

#### Test 3.3: Unsubscribe from Mentor
- [ ] While subscribed, click "Unsubscribe" link
- [ ] Should see loading state
- [ ] Button reverts to "Subscribe to this Mentor"
- [ ] "Book Appointment" button disappears
- [ ] Can re-subscribe if desired

---

### 4. Appointment Booking Modal - From Mentor Profile

#### Test 4.1: Open Modal from Mentor Detail Page
- [ ] Be subscribed to a mentor
- [ ] Click "Book Appointment" button
- [ ] Modal opens with title "Book Appointment with {mentor name}"
- [ ] See purple banner: "📅 Preview Feature - Coming Soon!"

#### Test 4.2: Fill Out Appointment Form
- [ ] **Date Field**: 
  - [ ] Should not allow dates before today
  - [ ] Select a future date
- [ ] **Time Field**: 
  - [ ] Select a time (e.g., "14:00")
- [ ] **Appointment Type**: 
  - [ ] Open dropdown
  - [ ] Verify options: Video Call, Phone Call, In-Person, Messaging
  - [ ] Select one (e.g., "Video Call")
- [ ] **Message Field**: 
  - [ ] Type a message (e.g., "I'd like to discuss career growth strategies")
  - [ ] Verify textarea accepts multi-line text

#### Test 4.3: Form Validation
- [ ] Try to submit with empty date → should prevent submission
- [ ] Try to submit with empty time → should prevent submission
- [ ] Try to submit without appointment type → should prevent submission
- [ ] Try to submit with empty message → should prevent submission
- [ ] Fill all fields → "Book Appointment" button should be enabled

#### Test 4.4: Submit Appointment Request
- [ ] Fill out all required fields
- [ ] Click "Book Appointment" button
- [ ] Should see loading state on button
- [ ] Check browser console (F12 → Console)
- [ ] Should see log: `📅 Appointment request data (ready for API):`
- [ ] Verify logged data includes:
  ```json
  {
    "mentor_id": "...",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "appointment_type": "video_call|phone_call|in_person|messaging",
    "message": "your message",
    "requested_at": "ISO timestamp"
  }
  ```
- [ ] Should see toast: "Appointment request feature is coming soon! 🚀"
- [ ] Modal should close automatically

#### Test 4.5: Cancel/Close Modal
- [ ] Open modal again
- [ ] Click "Cancel" button → modal closes without submission
- [ ] Open modal again
- [ ] Click outside the modal (backdrop) → modal closes
- [ ] Open modal again
- [ ] Press ESC key → modal closes

---

### 5. Appointment Booking Modal - From My Mentors Page

#### Test 5.1: Navigate to My Mentors
- [ ] Log in as regular user with subscriptions
- [ ] Click "My Mentors" in navbar or `/dashboard/mentors`
- [ ] Should see list of subscribed mentors
- [ ] Each mentor card shows:
  - [ ] Mentor name, bio, expertise
  - [ ] Status badge (Active/Paused/Ended)
  - [ ] "Book Appointment" button (purple gradient)
  - [ ] "View Profile" link

#### Test 5.2: Book from My Mentors Page
- [ ] Click "Book Appointment" on any mentor card
- [ ] Modal opens with correct mentor name
- [ ] Fill out form completely
- [ ] Submit → check console for data
- [ ] Should see success toast
- [ ] Modal closes

#### Test 5.3: Multiple Mentors
- [ ] If you have multiple mentors, test booking with different mentors
- [ ] Each modal should show correct mentor name
- [ ] Each submission should log correct mentor_id

---

### 6. API Integration Points (Backend Ready)

#### Test 6.1: Subscription API Calls
- [ ] Open browser DevTools → Network tab
- [ ] Subscribe to a mentor
- [ ] Verify POST request to `/api/mentors/{id}/subscribe`
- [ ] Check response status: should be 200/201
- [ ] Unsubscribe
- [ ] Verify POST request to `/api/mentors/{id}/unsubscribe`

#### Test 6.2: Subscription Status Check
- [ ] Navigate to mentor profile
- [ ] Check Network tab for GET request to `/api/mentors/{id}/subscription-status`
- [ ] Verify response includes `is_subscribed` boolean
- [ ] If subscribed, should include `subscribed_at` timestamp

#### Test 6.3: Appointment API (Not Yet Called)
- [ ] Submit appointment booking
- [ ] Check Network tab → should NOT see any appointment API call
- [ ] Only console.log should appear
- [ ] This confirms UI-only implementation as requested

---

### 7. Mobile Responsiveness

#### Test 7.1: Mobile Navigation
- [ ] Resize browser to mobile width (< 768px)
- [ ] Open hamburger menu
- [ ] For regular user:
  - [ ] Verify "My Mentors" appears in mobile menu
- [ ] For mentor:
  - [ ] Verify "My Mentees" appears in mobile menu

#### Test 7.2: Mobile Modal
- [ ] On mobile view, open appointment modal
- [ ] Verify modal is responsive
- [ ] Date/time pickers work on touch
- [ ] Form is easily scrollable
- [ ] Buttons are touch-friendly

---

### 8. Edge Cases & Error Handling

#### Test 8.1: Network Errors
- [ ] Open DevTools → Network tab → Set throttling to "Offline"
- [ ] Try to subscribe → should show error toast
- [ ] Try to check subscription status → should handle gracefully

#### Test 8.2: Invalid Mentor ID
- [ ] Navigate to `/mentors/invalid-id-12345`
- [ ] Should show error or redirect (depending on backend implementation)

#### Test 8.3: Double Subscription
- [ ] Subscribe to a mentor
- [ ] Refresh page
- [ ] Button should still show "Subscribed" (status persists)
- [ ] Try clicking subscribe button again (shouldn't be possible - it's disabled)

#### Test 8.4: Session Expiry
- [ ] Log in and subscribe to mentor
- [ ] Clear auth token from localStorage/cookies
- [ ] Refresh page
- [ ] Should redirect to login or show "Login to Subscribe"

---

## 📊 Test Results Summary

### Files Modified
- ✅ `lib/api/types.ts` - Added SubscriptionStatus interface
- ✅ `lib/api/mentors.ts` - Added 3 subscription methods
- ✅ `components/book-appointment-modal.tsx` - New modal component (219 lines)
- ✅ `app/mentors/[id]/page.tsx` - Subscription logic + modal integration
- ✅ `app/dashboard/mentors/page.tsx` - Added appointment buttons
- ✅ `components/navbar.tsx` - Role-based navigation links

### Compilation Status
- ✅ No TypeScript errors
- ✅ No lint errors
- ✅ Dev server running successfully

### API Endpoints Used
- ✅ POST `/api/mentors/{id}/subscribe`
- ✅ POST `/api/mentors/{id}/unsubscribe`
- ✅ GET `/api/mentors/{id}/subscription-status`
- ⏳ Appointment API (not implemented - UI only)

---

## 🐛 Bug Report Template

If you find any issues during testing, document them here:

```
### Bug #X: [Brief Description]
**Severity**: High/Medium/Low
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:

**Actual Behavior**:

**Screenshots/Console Logs**:

**Environment**:
- Browser: 
- User Role: 
- Mentor ID: 
```

---

## ✅ Final Checklist

Before marking as complete:
- [ ] All navigation links work correctly
- [ ] Subscription flow works (subscribe/unsubscribe)
- [ ] Appointment modal opens and validates correctly
- [ ] Console logs appointment data properly
- [ ] No API call for appointments (as required)
- [ ] Mobile responsive design works
- [ ] No console errors (except intentional logs)
- [ ] Toast notifications appear correctly

---

## 🚀 Next Steps (After Testing)

1. **If tests pass**:
   - Mark todo #8 as completed
   - Commit changes with message: `feat: Add mentor subscription and appointment booking UI`
   - Push to GitHub
   - Deploy to production

2. **If bugs found**:
   - Document bugs in template above
   - Fix critical issues
   - Re-test affected areas
   - Then proceed to commit/deploy

3. **Future API Integration**:
   - When appointment API is ready
   - Update `BookAppointmentModal.tsx`
   - Replace console.log with actual API call
   - Add error handling for API responses

---

**Happy Testing! 🎉**
