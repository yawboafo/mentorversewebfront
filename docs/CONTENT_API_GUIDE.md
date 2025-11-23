# Content Module & Resource Management API

## Overview

The MentorVerse Content API now supports **comprehensive module and resource management** for creating rich, structured learning content. Version **2.5.0** includes full support for:

✅ **Videos** - Upload to Cloudinary with duration tracking
✅ **Images/Pictures** - Diagrams, screenshots, infographics
✅ **Audio** - Podcasts, audio lessons, voice recordings
✅ **Documents** - PDFs, presentations, spreadsheets
✅ **Files** - Any file type (ZIP, code files, etc.)
✅ **Links** - External resources (YouTube, articles, documentation)

## Quick Start

```typescript
import { modulesApi, mediaApi } from '@/lib/api';

// 1. Create a module for your course
const module = await modulesApi.createModule({
  contentId: 'your-course-id',
  title: 'Introduction to Web Development',
  description: 'Learn the basics of HTML, CSS, and JavaScript',
  order: 1
});

// 2. Upload a video file
const videoFile = document.getElementById('video-input').files[0];
const videoUpload = await mediaApi.uploadVideo(videoFile, {
  folder: 'courses/web-dev'
});

// 3. Add the video as a resource
const videoResource = await modulesApi.createResource({
  moduleId: module.id,
  title: 'Welcome Video',
  description: 'Introduction to the course',
  resourceType: 'video',
  url: videoUpload.url,
  duration: videoUpload.duration,
  fileSize: videoUpload.bytes,
  metadata: {
    cloudinaryPublicId: videoUpload.public_id,
    thumbnailUrl: videoUpload.thumbnail_url
  },
  isPreview: true, // Make this a free preview
  order: 1
});
```

## Resource Types

### 1. Video Resources

Upload video content with automatic duration and thumbnail extraction:

```typescript
// Upload video
const videoFile = /* File object */;
const upload = await mediaApi.uploadVideo(videoFile, {
  folder: 'courses/my-course',
  transformation: {
    quality: 'auto',
    fetch_format: 'auto'
  }
});

// Add as resource
await modulesApi.createResource({
  moduleId: 'module-id',
  title: 'Lesson 1: Getting Started',
  resourceType: 'video',
  url: upload.url,
  duration: upload.duration, // In seconds
  fileSize: upload.bytes,
  mimeType: 'video/mp4',
  metadata: {
    cloudinaryPublicId: upload.public_id,
    thumbnailUrl: upload.thumbnail_url,
    width: upload.width,
    height: upload.height
  }
});
```

**Supported formats**: MP4, MOV, AVI, WebM, FLV, MKV

### 2. Audio Resources

Perfect for podcasts, audio lessons, or voice recordings:

```typescript
const audioFile = /* File object */;
const upload = await mediaApi.uploadAudio(audioFile);

await modulesApi.createResource({
  moduleId: 'module-id',
  title: 'Podcast Episode 1',
  resourceType: 'audio',
  url: upload.url,
  duration: upload.duration,
  fileSize: upload.bytes,
  mimeType: 'audio/mp3'
});
```

**Supported formats**: MP3, WAV, OGG, AAC, FLAC

### 3. Image Resources

For diagrams, screenshots, infographics:

```typescript
const imageFile = /* File object */;
const upload = await mediaApi.uploadImage(imageFile);

await modulesApi.createResource({
  moduleId: 'module-id',
  title: 'Architecture Diagram',
  resourceType: 'image',
  url: upload.url,
  fileSize: upload.bytes,
  metadata: {
    cloudinaryPublicId: upload.public_id,
    width: upload.width,
    height: upload.height
  }
});
```

**Supported formats**: JPG, PNG, GIF, SVG, WebP

### 4. Document Resources

For PDFs, presentations, spreadsheets:

```typescript
const docFile = /* File object */;
const upload = await mediaApi.uploadDocument(docFile);

await modulesApi.createResource({
  moduleId: 'module-id',
  title: 'Course Workbook (PDF)',
  resourceType: 'document',
  url: upload.url,
  fileSize: upload.bytes,
  mimeType: 'application/pdf',
  metadata: {
    cloudinaryPublicId: upload.public_id
  }
});
```

**Supported formats**: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX

### 5. File Resources

For any other file type:

```typescript
const file = /* File object */;
const upload = await mediaApi.uploadFile(file);

await modulesApi.createResource({
  moduleId: 'module-id',
  title: 'Source Code (ZIP)',
  resourceType: 'file',
  url: upload.url,
  fileSize: upload.bytes,
  mimeType: 'application/zip'
});
```

**Examples**: ZIP files, code files, templates, datasets

### 6. Link Resources

For external resources (no upload needed):

```typescript
await modulesApi.createResource({
  moduleId: 'module-id',
  title: 'Official Documentation',
  description: 'External link to React documentation',
  resourceType: 'link',
  url: 'https://react.dev/learn'
});
```

**Examples**: YouTube videos, blog posts, documentation, GitHub repos

## Complete Workflow Example

### Creating a Full Course Structure

```typescript
// 1. Create the course
const course = await contentApi.createContent({
  title: 'Complete Web Development Bootcamp',
  description: 'From zero to full-stack developer',
  content_type: 'course',
  price: 99.99,
  tags: ['web-development', 'javascript', 'react']
});

// 2. Create modules
const introModule = await modulesApi.createModule({
  contentId: course.id,
  title: 'Module 1: Introduction',
  description: 'Getting started with web development',
  order: 1
});

const htmlModule = await modulesApi.createModule({
  contentId: course.id,
  title: 'Module 2: HTML Fundamentals',
  description: 'Learn HTML from scratch',
  order: 2
});

// 3. Add resources to intro module
const resources = [
  // Welcome video
  {
    title: 'Welcome to the Course',
    resourceType: 'video' as const,
    url: await uploadVideo(welcomeVideo),
    isPreview: true, // Free preview
    order: 1
  },
  // Course syllabus PDF
  {
    title: 'Course Syllabus',
    resourceType: 'document' as const,
    url: await uploadDocument(syllabusPdf),
    order: 2
  },
  // Setup instructions
  {
    title: 'Development Environment Setup',
    resourceType: 'link' as const,
    url: 'https://code.visualstudio.com/docs/setup/setup-overview',
    order: 3
  }
];

// Bulk upload resources
await modulesApi.bulkUploadResources({
  moduleId: introModule.id,
  resources
});

// 4. Add resources to HTML module
const htmlVideo = await mediaApi.uploadVideo(videoFile);
await modulesApi.createResource({
  moduleId: htmlModule.id,
  title: 'HTML Basics',
  resourceType: 'video',
  url: htmlVideo.url,
  duration: htmlVideo.duration,
  order: 1
});

const exercisePdf = await mediaApi.uploadDocument(pdfFile);
await modulesApi.createResource({
  moduleId: htmlModule.id,
  title: 'Practice Exercises',
  resourceType: 'document',
  url: exercisePdf.url,
  order: 2
});

// 5. Get complete structure
const structure = await modulesApi.getContentStructure(course.id);
console.log(structure); // Full course with modules and resources

// 6. Publish the course
await contentApi.publishContent(course.id);
```

## Module Management

### Creating Modules

```typescript
const module = await modulesApi.createModule({
  contentId: 'course-id',
  title: 'Module Title',
  description: 'Module description',
  order: 1 // Optional, auto-increments if not provided
});
```

### Reordering Modules

```typescript
await modulesApi.reorderModules('course-id', {
  orders: [
    { id: 'module-1-id', order: 2 },
    { id: 'module-2-id', order: 1 },
    { id: 'module-3-id', order: 3 }
  ]
});
```

### Cloning Modules

Copy module structure between courses:

```typescript
await modulesApi.cloneModules({
  sourceContentId: 'original-course-id',
  targetContentId: 'new-course-id',
  moduleIds: ['module-1-id', 'module-2-id']
});
```

### Updating Modules

```typescript
await modulesApi.updateModule('module-id', {
  title: 'Updated Title',
  description: 'Updated description'
});
```

### Deleting Modules

```typescript
await modulesApi.deleteModule('module-id');
// All resources in this module are also deleted
```

## Resource Management

### Bulk Resource Upload

Upload multiple resources at once:

```typescript
await modulesApi.bulkUploadResources({
  moduleId: 'module-id',
  resources: [
    {
      title: 'Video 1',
      resourceType: 'video',
      url: 'video-url-1',
      order: 1
    },
    {
      title: 'PDF 1',
      resourceType: 'document',
      url: 'pdf-url-1',
      order: 2
    },
    {
      title: 'Link 1',
      resourceType: 'link',
      url: 'https://example.com',
      order: 3
    }
  ]
});
```

### Reordering Resources

```typescript
await modulesApi.reorderResources('module-id', {
  orders: [
    { id: 'resource-1-id', order: 3 },
    { id: 'resource-2-id', order: 1 },
    { id: 'resource-3-id', order: 2 }
  ]
});
```

### Preview Content

Mark resources as free preview:

```typescript
await modulesApi.updateResource('resource-id', {
  isPreview: true // Users can view this without purchasing
});
```

## Helper Functions

### Get Resource Type from File

```typescript
import { getResourceTypeFromFile } from '@/lib/api/modules';

const file = document.getElementById('file-input').files[0];
const resourceType = getResourceTypeFromFile(file);
// Returns: 'video' | 'audio' | 'image' | 'document' | 'file'
```

### Format File Size

```typescript
import { formatFileSize } from '@/lib/api/modules';

formatFileSize(1024); // "1 KB"
formatFileSize(1048576); // "1 MB"
formatFileSize(5242880); // "5 MB"
```

### Format Duration

```typescript
import { formatDuration } from '@/lib/api/modules';

formatDuration(90); // "1:30"
formatDuration(3661); // "1:01:01"
```

### Get Resource Icon

```typescript
import { getResourceIcon } from '@/lib/api/modules';

getResourceIcon('video'); // "video"
getResourceIcon('audio'); // "headphones"
getResourceIcon('document'); // "file-text"
```

## Best Practices

### 1. Organize Content Logically

```typescript
// Bad: Flat structure with no organization
- All videos in one module
- No clear progression

// Good: Structured learning path
Module 1: Introduction (3 videos, 1 PDF)
Module 2: Fundamentals (5 videos, 2 exercises)
Module 3: Advanced Topics (4 videos, 1 project)
Module 4: Final Project (1 video, 1 ZIP file)
```

### 2. Use Preview Content

```typescript
// Mark first video of each module as preview
await modulesApi.createResource({
  moduleId: module.id,
  title: 'Module Introduction',
  resourceType: 'video',
  url: videoUrl,
  isPreview: true // Free preview for potential students
});
```

### 3. Optimize Media Files

```typescript
// For videos, use transformations
await mediaApi.uploadVideo(videoFile, {
  folder: 'courses/optimized',
  transformation: {
    quality: 'auto:good', // Automatic quality optimization
    fetch_format: 'auto', // Automatic format selection
    streaming_profile: 'hd' // HD streaming
  }
});
```

### 4. Provide Multiple Resource Types

```typescript
// For each lesson, provide multiple learning resources:
- Video lecture (main content)
- PDF slides (reference material)
- Code files (hands-on practice)
- External links (additional reading)
```

### 5. Handle Upload Errors

```typescript
try {
  const upload = await mediaApi.uploadVideo(file);
  await modulesApi.createResource({
    moduleId: moduleId,
    resourceType: 'video',
    url: upload.url
  });
} catch (error) {
  console.error('Upload failed:', error);
  // Show error to user
  // Implement retry logic
  // Fall back to link resource if file upload fails
}
```

## API Reference Summary

### Module Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/content/{id}/modules` | Create module |
| GET | `/content/{id}/modules` | List modules |
| GET | `/modules/{id}` | Get module by ID |
| PATCH | `/modules/{id}` | Update module |
| DELETE | `/modules/{id}` | Delete module |
| POST | `/content/{id}/modules/reorder` | Reorder modules |
| POST | `/content/{id}/modules/clone` | Clone modules |

### Resource Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/modules/{id}/resources` | Create resource |
| GET | `/modules/{id}/resources` | List resources |
| GET | `/resources/{id}` | Get resource by ID |
| PATCH | `/resources/{id}` | Update resource |
| DELETE | `/resources/{id}` | Delete resource |
| POST | `/modules/{id}/resources/reorder` | Reorder resources |
| POST | `/modules/{id}/resources/bulk` | Bulk upload resources |

### Structure Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/content/{id}/structure` | Get complete structure |

## Troubleshooting

### Upload Fails

```typescript
// Check file size (max 100MB for video)
if (file.size > 100 * 1024 * 1024) {
  throw new Error('File too large. Max size: 100MB');
}

// Check file type
const allowedTypes = ['video/mp4', 'video/mov', 'video/avi'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('Unsupported file type');
}
```

### Missing Duration for Video

```typescript
// Duration is extracted automatically by Cloudinary
// If missing, the video might still be processing
const upload = await mediaApi.uploadVideo(file);
if (!upload.duration) {
  console.warn('Video still processing, duration not available yet');
}
```

### Preview Content Not Showing

```typescript
// Make sure isPreview is set to true
await modulesApi.updateResource('resource-id', {
  isPreview: true
});
```

## Version History

- **v2.5.0** (Nov 23, 2025) - Full module & resource management system
- **v2.4.0** - Appointment booking system
- **v2.3.0** - Subscription system
- **v2.2.0** - Mentor-mentee relationships
- **v2.1.0** - Enhanced mentor auth flow

## Support

For issues or questions:
- Email: engineering@mentorverse.com
- Documentation: https://docs.mentorverse.com
- API Status: https://status.mentorverse.com
