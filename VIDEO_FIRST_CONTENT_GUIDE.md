# Video-First Content Discovery - Implementation Guide

## Overview
The `/content` page has been redesigned as a modern, YouTube-style video discovery experience. Users can now quickly browse courses with media-first cards, powerful filters, and curated discovery sections.

---

## Components

### 1. CourseVideoCard
**Location:** `/components/course-video-card.tsx`

**Purpose:** A media-first card component optimized for video/course content display.

**Props:**
```typescript
interface CourseVideoCardProps {
  content: Content;           // The course/content data
  priority?: boolean;         // Image loading priority (for above-the-fold)
  variant?: 'default' | 'featured';  // Card size/style
}
```

**Features:**
- ✅ Responsive thumbnail with aspect-video ratio
- ✅ Video play icon overlay for video content
- ✅ Auto-detects NEW badge (< 7 days old)
- ✅ Duration badge (top right)
- ✅ Hover animations (scale, shadow)
- ✅ Price display with currency conversion support
- ✅ Level badges (Beginner, Intermediate, Advanced)
- ✅ Tag display (shows 2-3 relevant tags)
- ✅ Works perfectly on mobile and desktop

**Usage:**
```tsx
import { CourseVideoCard } from '@/components/course-video-card';

<CourseVideoCard 
  content={courseData}
  priority={true}  // For first 3 items
  variant="featured"  // For hero/featured content
/>
```

---

## Page Structure

### /content Page Layout

#### 1. **Top Bar / Sticky Header**
- **Search bar:** "Search courses, mentors, topics..."
- **Search button:** Triggers filtered search
- **Filters toggle:** Shows/hides advanced filters

#### 2. **Filters Panel** (Collapsible)
When expanded, shows:
- **Content Type:** All Types | Courses | Frameworks
- **Level:** All Levels | Beginner | Intermediate | Advanced
- **Sort By:**
  - 🔥 Trending (default)
  - ✨ Newest
  - 💰 Price: Low to High
  - 💰 Price: High to Low
- **Clear Filters:** Button (only shown when filters active)

#### 3. **Featured Section** (Page 1 only, no filters)
- Large hero-style card
- Shows first trending/newest course
- Uses `variant="featured"` of CourseVideoCard

#### 4. **Discovery Sections** (Page 1 only, no filters)
Curated sections:
- 🔥 **Trending Now** (6 items)
- 🎓 **Popular Courses** (6 items, type=course)
- ⏱️ **Quick Wins for Beginners** (6 items, level=beginner)
- ✨ **Proven Frameworks** (6 items, type=framework)

#### 5. **Search Results Grid** (When searching/filtering)
- Responsive grid: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
- Shows result count
- Animated card entrance

#### 6. **Load More** (Pagination)
- "Load More" button when more pages available
- Scrolls to top on page change
- Shows "You've reached the end! 🎉" on last page

---

## API Integration

### Query Parameters
The page uses `ContentQuery` interface:

```typescript
interface ContentQuery {
  page?: number;           // Current page
  limit?: number;          // Items per page (18)
  q?: string;              // Search query
  content_type?: 'course' | 'framework';  // Content type filter
  level?: string;          // Level filter
}
```

### Endpoints Used
- `GET /content` - Fetches content with filters
- Returns: `{ data: Content[], total: number }`

### Current Limitations
- Backend doesn't support:
  - Sorting by trending/newest/price
  - Delivery mode filtering
  - Category/topic filtering
  
**Workaround:** Frontend groups content by type/level for discovery sections.

---

## Responsive Design

### Desktop (lg+)
- 3-column grid
- Featured card full width
- Discovery sections: horizontal scroll or grid
- Sticky filter bar

### Tablet (md)
- 2-column grid
- Smaller featured card
- All sections responsive

### Mobile (sm)
- 1-column grid
- Touch-optimized
- No hover effects
- Simplified filters

---

## Features

### ✅ Implemented
- [x] YouTube-style card layout
- [x] Media-first thumbnails
- [x] Search functionality
- [x] Content type filtering
- [x] Level filtering
- [x] Responsive grid (1-3 cols)
- [x] Featured content section
- [x] Discovery sections (Trending, Courses, Frameworks, Beginners)
- [x] Load more pagination
- [x] Loading skeletons
- [x] Empty state with clear filters
- [x] NEW badges (< 7 days)
- [x] Duration badges
- [x] Currency conversion support
- [x] Smooth animations (framer-motion)
- [x] Homepage integration

### 🔄 Future Enhancements
- [ ] Video preview on hover (requires video URLs)
- [ ] Backend sorting (trending, top rated, price)
- [ ] Category/topic filtering (requires backend field)
- [ ] Delivery mode filtering (requires backend field)
- [ ] Infinite scroll (instead of Load More)
- [ ] Saved/bookmarked courses
- [ ] "Because you viewed X" personalization
- [ ] View count / popularity metrics
- [ ] Course ratings display

---

## Homepage Integration

### Courses Section
- **Updated:** Homepage courses now use `CourseVideoCard`
- **Grid:** 3 columns on desktop
- **Count:** Shows 6 courses
- **CTA:** "Browse all courses" button → `/content`
- **Priority:** First 3 cards have `priority={true}` for faster loading

---

## Performance Optimizations

1. **Image Loading:**
   - Uses Next.js `<Image>` with `fill` layout
   - Priority loading for first 3 cards
   - Automatic WebP conversion
   - Error handling with fallback gradients

2. **Animations:**
   - Framer Motion for smooth transitions
   - Viewport-based animations (only animate when visible)
   - Staggered entrance animations
   - GPU-accelerated transforms

3. **Loading States:**
   - Skeleton loaders match card structure
   - Shows 9 skeleton cards while loading
   - Smooth transition from skeleton to content

4. **Pagination:**
   - 18 items per page (good balance)
   - Scroll to top on page change
   - Load more pattern (better UX than numbered pagination)

---

## Styling Guide

### Color Scheme
- **Primary:** Orange to Pink gradient (`from-orange-600 to-pink-600`)
- **Secondary:** Blue to Cyan gradient (`from-blue-600 to-cyan-600`)
- **Accent:** Purple, Green for categories
- **Video overlays:** Black with 50-80% opacity + backdrop-blur

### Typography
- **Headings:** Bold, 2xl-6xl scale
- **Card titles:** Bold, line-clamp-2
- **Mentor names:** Small, muted-foreground
- **Prices:** Large, bold, gradient colors

### Spacing
- **Grid gaps:** 6 units (1.5rem)
- **Section padding:** 8 units top/bottom
- **Card internal:** 3-4 units

---

## Testing Checklist

### Desktop
- [x] Search works correctly
- [x] Filters apply properly
- [x] Clear filters resets everything
- [x] Cards hover animations work
- [x] Featured section displays
- [x] Discovery sections display
- [x] Load more works
- [x] Empty state shows when no results
- [x] Pagination scrolls to top

### Mobile
- [x] Search bar responsive
- [x] Filters toggle works
- [x] Cards stack in 1 column
- [x] Touch interactions work
- [x] No hover issues
- [x] Images load properly

### Edge Cases
- [x] No thumbnail (shows gradient fallback)
- [x] Long titles (line-clamp-2)
- [x] No tags (section doesn't break)
- [x] Empty results (shows message + clear filters)
- [x] Loading state (skeletons)

---

## Maintenance Notes

### Adding New Filters
1. Add state variable (e.g., `const [delivery, setDelivery] = useState('all')`)
2. Add Select component in filters panel
3. Include in `fetchContent` query
4. Add to `hasActiveFilters` check
5. Include in `handleClearFilters`

### Adding New Discovery Section
1. Add grouping logic in `getContentBySection()`
2. Create section div with heading
3. Map over grouped content with `CourseVideoCard`
4. Add motion animations with stagger

### Updating Card Design
- Edit `/components/course-video-card.tsx`
- Changes automatically apply to:
  - `/content` page
  - Homepage courses section
  - Any future usage

---

## File Summary

### Created/Modified Files
- ✅ `/components/course-video-card.tsx` (NEW)
- ✅ `/app/content/page.tsx` (REDESIGNED)
- ✅ `/app/page.tsx` (UPDATED - uses CourseVideoCard)
- 📄 `/app/content/page-old.tsx` (BACKUP of old design)

### Dependencies
- All existing (no new packages)
- Uses: next, react, framer-motion, tailwind, shadcn/ui

---

## Quick Reference

### Search Examples
- `"marketing"` - Searches all content
- Type: `course` + Level: `beginner` - Beginner courses only
- Sort: `newest` - Shows latest additions

### Card States
- **Default:** Standard card with hover
- **Featured:** Larger card with description
- **Loading:** Skeleton placeholder
- **Error:** Gradient fallback

### Grid Breakpoints
- `sm:` 640px+ (2 cols)
- `lg:` 1024px+ (3 cols)

---

## Support

For questions or issues:
1. Check Content API documentation
2. Review CourseVideoCard props
3. Test in browser DevTools (mobile view)
4. Check console for API errors

**Last Updated:** November 23, 2025
