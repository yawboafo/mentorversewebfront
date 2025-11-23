import { apiClient } from './client';

// =============== TYPES ===============

export type ResourceType = 'video' | 'image' | 'document' | 'link' | 'audio' | 'file';

export interface ContentModule {
  id: string;
  contentId: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentResource {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  resourceType: ResourceType;
  url: string;
  metadata?: ResourceMetadata;
  order: number;
  duration?: number; // For video/audio in seconds
  fileSize?: number; // In bytes
  mimeType?: string;
  isPreview: boolean; // For free preview content
  createdAt: string;
  updatedAt: string;
}

export interface ResourceMetadata {
  cloudinaryPublicId?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  [key: string]: any;
}

export interface ContentWithStructure {
  id: string;
  title: string;
  description: string;
  contentType: 'course' | 'framework';
  modules: ModuleWithResources[];
}

export interface ModuleWithResources extends ContentModule {
  resources: ContentResource[];
}

// =============== REQUEST TYPES ===============

export interface CreateModuleRequest {
  contentId: string;
  title: string;
  description: string;
  order?: number;
}

export interface UpdateModuleRequest {
  title?: string;
  description?: string;
  order?: number;
}

export interface CreateResourceRequest {
  moduleId: string;
  title: string;
  description?: string;
  resourceType: ResourceType;
  url: string;
  metadata?: ResourceMetadata;
  duration?: number;
  fileSize?: number;
  mimeType?: string;
  isPreview?: boolean;
  order?: number;
}

export interface UpdateResourceRequest {
  title?: string;
  description?: string;
  url?: string;
  metadata?: ResourceMetadata;
  duration?: number;
  fileSize?: number;
  mimeType?: string;
  isPreview?: boolean;
  order?: number;
}

export interface ReorderRequest {
  orders: { id: string; order: number }[];
}

export interface BulkResourceUpload {
  moduleId: string;
  resources: Omit<CreateResourceRequest, 'moduleId'>[];
}

export interface CloneModuleRequest {
  sourceContentId: string;
  targetContentId: string;
  moduleIds: string[];
}

// =============== API METHODS ===============

export const modulesApi = {
  // =============== MODULE MANAGEMENT ===============
  
  /**
   * Create a new module for content
   */
  async createModule(data: CreateModuleRequest): Promise<ContentModule> {
    return apiClient.post<ContentModule>(`/content/${data.contentId}/modules`, data);
  },

  /**
   * Get all modules for a content item
   */
  async getModules(contentId: string): Promise<ContentModule[]> {
    return apiClient.get<ContentModule[]>(`/content/${contentId}/modules`);
  },

  /**
   * Get a specific module by ID
   */
  async getModuleById(moduleId: string): Promise<ModuleWithResources> {
    return apiClient.get<ModuleWithResources>(`/modules/${moduleId}`);
  },

  /**
   * Update a module
   */
  async updateModule(moduleId: string, data: UpdateModuleRequest): Promise<ContentModule> {
    return apiClient.patch<ContentModule>(`/modules/${moduleId}`, data);
  },

  /**
   * Delete a module
   */
  async deleteModule(moduleId: string): Promise<void> {
    return apiClient.delete(`/modules/${moduleId}`);
  },

  /**
   * Reorder modules within content
   */
  async reorderModules(contentId: string, orders: ReorderRequest): Promise<void> {
    return apiClient.post(`/content/${contentId}/modules/reorder`, orders);
  },

  /**
   * Clone modules from one content to another
   */
  async cloneModules(data: CloneModuleRequest): Promise<ContentModule[]> {
    return apiClient.post<ContentModule[]>(
      `/content/${data.targetContentId}/modules/clone`,
      data
    );
  },

  // =============== RESOURCE MANAGEMENT ===============

  /**
   * Add a resource to a module
   */
  async createResource(data: CreateResourceRequest): Promise<ContentResource> {
    return apiClient.post<ContentResource>(`/modules/${data.moduleId}/resources`, data);
  },

  /**
   * Get all resources for a module
   */
  async getResources(moduleId: string): Promise<ContentResource[]> {
    return apiClient.get<ContentResource[]>(`/modules/${moduleId}/resources`);
  },

  /**
   * Get a specific resource by ID
   */
  async getResourceById(resourceId: string): Promise<ContentResource> {
    return apiClient.get<ContentResource>(`/resources/${resourceId}`);
  },

  /**
   * Update a resource
   */
  async updateResource(resourceId: string, data: UpdateResourceRequest): Promise<ContentResource> {
    return apiClient.patch<ContentResource>(`/resources/${resourceId}`, data);
  },

  /**
   * Delete a resource
   */
  async deleteResource(resourceId: string): Promise<void> {
    return apiClient.delete(`/resources/${resourceId}`);
  },

  /**
   * Reorder resources within a module
   */
  async reorderResources(moduleId: string, orders: ReorderRequest): Promise<void> {
    return apiClient.post(`/modules/${moduleId}/resources/reorder`, orders);
  },

  /**
   * Bulk upload resources to a module
   */
  async bulkUploadResources(data: BulkResourceUpload): Promise<ContentResource[]> {
    return apiClient.post<ContentResource[]>(
      `/modules/${data.moduleId}/resources/bulk`,
      { resources: data.resources }
    );
  },

  // =============== STRUCTURE MANAGEMENT ===============

  /**
   * Get complete content structure with modules and resources
   */
  async getContentStructure(contentId: string): Promise<ContentWithStructure> {
    return apiClient.get<ContentWithStructure>(`/content/${contentId}/structure`);
  },
};

// =============== HELPER FUNCTIONS ===============

/**
 * Helper to determine resource type from file
 */
export function getResourceTypeFromFile(file: File): ResourceType {
  const type = file.type.toLowerCase();
  
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type.startsWith('image/')) return 'image';
  if (type === 'application/pdf' || type.includes('document')) return 'document';
  
  return 'file';
}

/**
 * Helper to format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Helper to format duration
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Helper to get resource icon name
 */
export function getResourceIcon(type: ResourceType): string {
  const icons: Record<ResourceType, string> = {
    video: 'video',
    audio: 'headphones',
    image: 'image',
    document: 'file-text',
    file: 'file',
    link: 'link'
  };
  
  return icons[type] || 'file';
}

/**
 * Validate resource URL
 */
export function isValidResourceUrl(url: string, type: ResourceType): boolean {
  if (!url || url.trim() === '') return false;
  
  // For links, check if it's a valid URL
  if (type === 'link') {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  // For other types, accept any non-empty string (can be Cloudinary URL, relative path, etc.)
  return true;
}
