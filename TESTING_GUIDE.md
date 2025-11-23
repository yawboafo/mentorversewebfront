# Content Creation Feature - Testing Guide

## Prerequisites
- Backend API v2.5.0 running
- Authenticated as a mentor user
- Cloudinary credentials configured

## Testing Steps

### 1. Navigate to Content Creation
```
URL: /mentor/content/create
```
Expected: See "Create New Content" page with Step 1 form

### 2. Complete Step 1 - Basic Info
- Enter title: "Test Course - Web Development Fundamentals"
- Enter description: "Learn the basics of modern web development"
- Select Content Type: "Course"
- Select Format: "Video"
- Enter Target Audience: "Beginner developers"
- Enter Problem It Solves: "Helps beginners start their web dev journey"
- Click **Next**

Expected: Move to Step 2

### 3. Complete Step 2 - Content Details
- Add Learning Outcomes:
  - "Understand HTML fundamentals"
  - "Master CSS styling"
  - "Learn JavaScript basics"
- Check Delivery Modes:
  - ✅ Self-Paced
  - ✅ Online Live
- Enter Estimated Duration: "8 weeks"
- Enter Time Commitment: "5-7 hours/week"
- Add Tools:
  - "VS Code"
  - "Chrome DevTools"
- Enter Prerequisites: "Basic computer literacy"
- Click **Next**

Expected: Move to Step 3

### 4. Complete Step 3 - Pricing & Tags
- Enter Price: "99.99"
- Select Level: "Beginner"
- Add Tags:
  - "web-development"
  - "html"
  - "css"
  - "javascript"
- Review summary card
- Click **Save & Continue to Modules**

Expected:
- ✅ Toast: "Content created! Now add modules and resources."
- Move to Step 4
- See empty state: "No modules yet"

### 5. Create First Module
- Enter Module Title: "Introduction to HTML"
- Enter Module Description: "Learn HTML structure and basic tags"
- Click **Add Module**

Expected:
- ✅ Toast: "Module created!"
- Module appears in list
- Shows "0 resources" badge
- Module collapsed by default

### 6. Add Video Resource to Module
- Click module to expand
- Click **Add Resource**
- Select Resource Type: "Video"
- ✅ Check "Free Preview" (for demo purposes)
- Enter Title: "Welcome to HTML"
- Enter Description: "Introduction video covering HTML basics"
- Click **Choose File**
- Select a small video file (< 10MB for testing)
- Click **Add Resource**

Expected:
- Upload progress bar appears
- Progress updates: 0% → 25% → 50% → 75% → 100%
- ✅ Toast: "Resource added!"
- Resource appears in list with:
  - 📹 Video icon
  - File size (e.g., "5.2 MB")
  - Duration (if available)
  - "Free" badge

### 7. Add Document Resource
- Click **Add Resource** again
- Select Resource Type: "Document (PDF)"
- Enter Title: "HTML Cheat Sheet"
- Select a PDF file
- Click **Add Resource**

Expected:
- Upload progress shown
- Resource added with 📄 icon
- Shows file size

### 8. Add External Link Resource
- Click **Add Resource**
- Select Resource Type: "External Link"
- Enter Title: "MDN HTML Documentation"
- Enter URL: "https://developer.mozilla.org/en-US/docs/Web/HTML"
- Click **Add Resource**

Expected:
- No upload (instant)
- Resource added with 🔗 icon
- No file size shown

### 9. Create Second Module
- Scroll up to "Add Module" form
- Enter Title: "CSS Fundamentals"
- Enter Description: "Learn CSS selectors, properties, and layouts"
- Click **Add Module**

Expected:
- New module appears below first
- Numbered "2. CSS Fundamentals"
- Expandable

### 10. Test Edit Module
- Click ✏️ Edit icon on CSS module
- Change title to: "CSS Fundamentals & Styling"
- Click **Save**

Expected:
- ✅ Toast: "Module updated!"
- Title changes immediately

### 11. Add Audio Resource
- Expand CSS module
- Click **Add Resource**
- Select Type: "Audio"
- Enter Title: "CSS Podcast Episode"
- Select an audio file
- Click **Add Resource**

Expected:
- Upload with progress
- 🎵 icon shown
- Duration displayed

### 12. Test Delete Resource
- Click 🗑️ trash icon on any resource
- Click **OK** on confirmation

Expected:
- Confirmation dialog appears
- Resource removed from list
- ✅ Toast: "Resource deleted"

### 13. Test Delete Module
- Click 🗑️ trash icon on a module
- Click **OK** on "Delete this module and all its resources?"

Expected:
- Confirmation dialog
- Module and all resources deleted
- ✅ Toast: "Module deleted"

### 14. Attempt Early Publish (Should Fail)
- If you deleted all modules, try clicking **Publish Content**

Expected:
- ❌ Toast: "Please add at least one module before publishing"
- Stays on Step 4

### 15. Add Module & Resource for Publishing
- Add at least 1 module with 1 resource
- Click **Publish Content**

Expected:
- ✅ Toast: "Content published! 🎉"
- Redirect to `/mentor/dashboard` after 1.5 seconds
- Content appears in dashboard

## API Calls to Monitor

### Step 3 Submit
```
POST /content
{
  "title": "...",
  "description": "...",
  "status": "draft",
  ...
}

Response: { "id": "content-123", ... }
```

### Module Creation
```
POST /content/content-123/modules
{
  "title": "Introduction to HTML",
  "description": "...",
  "order": 1
}

Response: { "id": "module-456", ... }
```

### Resource Upload
```
POST /media/upload
FormData: { file: <video>, folder: "content-resources" }

Response: {
  "url": "https://res.cloudinary.com/...",
  "public_id": "...",
  "format": "mp4",
  "bytes": 5431245,
  "duration": 180.5
}

POST /modules/module-456/resources
{
  "title": "Welcome to HTML",
  "resourceType": "video",
  "url": "https://res.cloudinary.com/...",
  "fileSize": 5431245,
  "duration": 180.5,
  "isPreview": true
}
```

### Publish
```
PATCH /content/content-123
{
  "status": "published"
}
```

## Edge Cases to Test

1. **Upload Failure**
   - Try uploading a very large file (> 100MB)
   - Expected: Error toast with message

2. **Network Error**
   - Disconnect network, try creating module
   - Expected: Error toast

3. **Empty Module Title**
   - Try creating module without title
   - Expected: Toast: "Module title is required"

4. **Invalid URL for Link**
   - Add link resource with invalid URL
   - Expected: HTML5 validation error

5. **Navigate Back Through Steps**
   - Click "Previous" from Step 4 → 3 → 2 → 1
   - Expected: All form data preserved

6. **Page Refresh on Step 4**
   - Refresh page after creating modules
   - Expected: May lose module state (acceptable for MVP)

## Performance Benchmarks

- Small video upload (10MB): < 5 seconds
- PDF upload (2MB): < 2 seconds
- Link resource: Instant
- Module creation: < 500ms
- Page load: < 1 second

## Browser Compatibility

Test in:
- ✅ Chrome (latest)
- ✅ Safari (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)

## Mobile Testing

Test on:
- iPhone (Safari)
- Android (Chrome)

Expected: Responsive layout, touch-friendly buttons

## Accessibility Testing

- Tab through all form fields
- Use screen reader (VoiceOver/NVDA)
- Test keyboard-only navigation
- Verify ARIA labels

## Known Issues (Expected)

1. **No Drag-and-Drop**: Cannot reorder modules/resources yet
2. **No Preview**: Cannot preview uploaded files inline
3. **Progress Bar**: Only shows upload, not processing
4. **State Loss**: Refreshing Step 4 loses module state
5. **No Undo**: Deleted resources cannot be recovered

## Success Criteria

✅ All steps complete without errors
✅ Content saved as draft
✅ Modules created successfully
✅ All 6 resource types upload correctly
✅ Edit/delete operations work
✅ Validation prevents invalid publishes
✅ Content publishes successfully
✅ Appears in mentor dashboard

---

**Status**: Ready for Testing
**Last Updated**: 2025
