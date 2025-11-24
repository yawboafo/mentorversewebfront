/**
 * Learning Progress API
 * 
 * Connected to real backend implementation.
 * Backend implementation: COMPLETE ✅
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
  id?: string;
  type: 'progress_25' | 'progress_50' | 'progress_75' | 'module_complete' | 'course_complete';
  achievedAt: string;
  seen: boolean;
  message: string;
  metadata?: any;
}

export interface ResourceCompletionResponse {
  resourceId: string;
  completed: boolean;
  completedAt: string;
  courseProgress: {
    progressPercent: number;
    completedResources: number;
    totalResources: number;
    nextResourceId?: string;
    nextResourceName?: string;
  };
  milestoneUnlocked?: {
    id: string;
    type: string;
    message: string;
  };
  moduleCompleted?: {
    moduleId: string;
    moduleName: string;
  };
}

export const learningApi = {
  /**
   * Get all active (in-progress) courses for the current user
   * Backend: GET /me/learning/active
   */
  async getActiveCourses(): Promise<ActiveCourse[]> {
    try {
      const response = await apiClient.get<{ courses: ActiveCourse[] }>('/me/learning/active');
      return response.courses;
    } catch (error) {
      console.error('Failed to fetch active courses:', error);
      return [];
    }
  },

  /**
   * Get detailed progress for a specific course
   * Backend: GET /me/learning/courses/{contentId}/progress
   */
  async getCourseProgress(contentId: string): Promise<CourseProgress | null> {
    try {
      return await apiClient.get<CourseProgress>(`/me/learning/courses/${contentId}/progress`);
    } catch (error: any) {
      // 404 means course not started yet
      if (error.status === 404) {
        return null;
      }
      console.error('Failed to fetch course progress:', error);
      return null;
    }
  },

  /**
   * Update progress for a specific resource (lesson/video)
   * Backend: PUT /me/learning/resources/{resourceId}/progress
   */
  async updateResourceProgress(
    contentId: string,
    resourceId: string,
    progress: Partial<LessonProgress>
  ): Promise<void> {
    try {
      await apiClient.put(`/me/learning/resources/${resourceId}/progress`, {
        progress: progress.progress || 0,
        lastPosition: progress.lastPosition,
        timeSpent: 0, // Can be calculated on frontend if needed
      });
    } catch (error) {
      console.error('Failed to update resource progress:', error);
      throw error;
    }
  },

  /**
   * Mark a resource as completed
   * Backend: POST /me/learning/resources/{resourceId}/complete
   */
  async completeResource(contentId: string, resourceId: string): Promise<ResourceCompletionResponse | null> {
    try {
      return await apiClient.post<ResourceCompletionResponse>(
        `/me/learning/resources/${resourceId}/complete`,
        {}
      );
    } catch (error) {
      console.error('Failed to complete resource:', error);
      return null;
    }
  },

  /**
   * Get milestones for a course
   * Backend: GET /me/learning/courses/{contentId}/milestones
   */
  async getMilestones(contentId: string, unseenOnly: boolean = true): Promise<Milestone[]> {
    try {
      const response = await apiClient.get<{ milestones: Milestone[] }>(
        `/me/learning/courses/${contentId}/milestones${unseenOnly ? '?unseen=true' : ''}`
      );
      return response.milestones;
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      return [];
    }
  },

  /**
   * Mark milestones as seen
   * Backend: POST /me/learning/milestones/mark-seen
   */
  async markMilestonesSeen(milestoneIds: string[]): Promise<void> {
    try {
      await apiClient.post('/me/learning/milestones/mark-seen', { milestoneIds });
    } catch (error) {
      console.error('Failed to mark milestones as seen:', error);
    }
  },

  /**
   * Initialize progress tracking when user first accesses a purchased course
   * Backend: POST /me/learning/courses/{contentId}/start
   */
  async startCourse(contentId: string): Promise<CourseProgress | null> {
    try {
      return await apiClient.post<CourseProgress>(`/me/learning/courses/${contentId}/start`, {});
    } catch (error: any) {
      // 400 with existingProgress means already started - that's ok
      if (error.status === 400 && error.existingProgress) {
        return error.existingProgress;
      }
      console.error('Failed to start course:', error);
      return null;
    }
  },
};
