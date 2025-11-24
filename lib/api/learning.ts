/**
 * Learning Progress API
 * 
 * This is a MOCKED API layer for learning progress tracking.
 * These endpoints need to be implemented on the backend.
 */

import { apiClient } from './client';
import { Content } from './types';

export interface CourseProgress {
  id: string;
  userId: string;
  contentId: string;
  progressPercent: number; // 0-100
  currentModuleId: string | null;
  currentResourceId: string | null;
  lastAccessedAt: string;
  startedAt: string;
  completedAt: string | null;
  totalModules: number;
  completedModules: number;
  totalResources: number;
  completedResources: number;
  timeSpentMinutes: number;
  content?: Content;
}

export interface ActiveCourse {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  mentor: {
    id: string;
    fullName: string;
    avatarUrl: string;
  };
  progress: {
    percent: number;
    currentModuleName: string | null;
    currentResourceName: string | null;
    nextResourceName: string | null;
    lastAccessedAt: string;
  };
  estimatedDuration: string;
  contentId: string;
}

export interface LessonProgress {
  resourceId: string;
  completed: boolean;
  progress: number; // 0-100 for video/interactive content
  lastPosition?: number; // For video timestamp
  completedAt?: string;
}

export interface Milestone {
  type: 'progress_25' | 'progress_50' | 'progress_75' | 'module_complete' | 'course_complete';
  achievedAt: string;
  seen: boolean;
  message: string;
}

// MOCKED: This will need real backend implementation
const MOCK_ACTIVE_COURSES: ActiveCourse[] = [];
const MOCK_PROGRESS: Map<string, CourseProgress> = new Map();

export const learningApi = {
  /**
   * Get all active (in-progress) courses for the current user
   * MOCKED - Backend needs to implement: GET /me/learning/active
   */
  async getActiveCourses(): Promise<ActiveCourse[]> {
    // TODO: Replace with real API call
    // return apiClient.get<ActiveCourse[]>('/me/learning/active');
    
    // MOCK: Return empty for now, will be populated after first course purchase
    return Promise.resolve(MOCK_ACTIVE_COURSES);
  },

  /**
   * Get detailed progress for a specific course
   * MOCKED - Backend needs to implement: GET /me/learning/courses/{contentId}/progress
   */
  async getCourseProgress(contentId: string): Promise<CourseProgress | null> {
    // TODO: Replace with real API call
    // return apiClient.get<CourseProgress>(`/me/learning/courses/${contentId}/progress`);
    
    // MOCK: Return mock data
    const mockProgress = MOCK_PROGRESS.get(contentId);
    return Promise.resolve(mockProgress || null);
  },

  /**
   * Update progress for a specific resource (lesson/video)
   * MOCKED - Backend needs to implement: PUT /me/learning/resources/{resourceId}/progress
   */
  async updateResourceProgress(
    contentId: string,
    resourceId: string,
    progress: Partial<LessonProgress>
  ): Promise<void> {
    // TODO: Replace with real API call
    // return apiClient.put(`/me/learning/resources/${resourceId}/progress`, progress);
    
    // MOCK: Do nothing for now
    console.log('[MOCK] Updating resource progress:', { contentId, resourceId, progress });
    return Promise.resolve();
  },

  /**
   * Mark a resource as completed
   * MOCKED - Backend needs to implement: POST /me/learning/resources/{resourceId}/complete
   */
  async completeResource(contentId: string, resourceId: string): Promise<void> {
    // TODO: Replace with real API call
    // return apiClient.post(`/me/learning/resources/${resourceId}/complete`, {});
    
    // MOCK: Do nothing for now
    console.log('[MOCK] Completing resource:', { contentId, resourceId });
    return Promise.resolve();
  },

  /**
   * Get unseen milestones for a course
   * MOCKED - Backend needs to implement: GET /me/learning/courses/{contentId}/milestones
   */
  async getMilestones(contentId: string): Promise<Milestone[]> {
    // TODO: Replace with real API call
    // return apiClient.get<Milestone[]>(`/me/learning/courses/${contentId}/milestones`);
    
    // MOCK: Return empty for now
    return Promise.resolve([]);
  },

  /**
   * Mark milestones as seen
   * MOCKED - Backend needs to implement: POST /me/learning/milestones/mark-seen
   */
  async markMilestonesSeen(milestoneIds: string[]): Promise<void> {
    // TODO: Replace with real API call
    // return apiClient.post('/me/learning/milestones/mark-seen', { milestoneIds });
    
    // MOCK: Do nothing for now
    console.log('[MOCK] Marking milestones as seen:', milestoneIds);
    return Promise.resolve();
  },

  /**
   * Initialize progress tracking when user first accesses a purchased course
   * MOCKED - Backend needs to implement: POST /me/learning/courses/{contentId}/start
   */
  async startCourse(contentId: string): Promise<CourseProgress> {
    // TODO: Replace with real API call
    // return apiClient.post<CourseProgress>(`/me/learning/courses/${contentId}/start`, {});
    
    // MOCK: Create mock progress
    const mockProgress: CourseProgress = {
      id: `prog_${Date.now()}`,
      userId: 'user_123',
      contentId,
      progressPercent: 0,
      currentModuleId: null,
      currentResourceId: null,
      lastAccessedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: null,
      totalModules: 0,
      completedModules: 0,
      totalResources: 0,
      completedResources: 0,
      timeSpentMinutes: 0,
    };
    
    MOCK_PROGRESS.set(contentId, mockProgress);
    console.log('[MOCK] Started course:', contentId);
    
    return Promise.resolve(mockProgress);
  },
};
