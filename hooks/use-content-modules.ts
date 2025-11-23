'use client';

import { useState, useCallback } from 'react';
import { modulesApi, mediaApi } from '@/lib/api';
import type {
  ContentModule,
  ContentResource,
  ModuleWithResources,
  ContentWithStructure,
  CreateModuleRequest,
  CreateResourceRequest,
  ResourceType,
} from '@/lib/api/modules';
import { getResourceTypeFromFile } from '@/lib/api/modules';

interface UseContentModulesOptions {
  contentId?: string;
}

interface UploadProgress {
  resourceId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export function useContentModules({ contentId }: UseContentModulesOptions) {
  const [modules, setModules] = useState<ModuleWithResources[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});

  // Fetch complete content structure
  const fetchStructure = useCallback(async () => {
    if (!contentId) {
      console.warn('Cannot fetch structure: contentId is not set');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const structure = await modulesApi.getContentStructure(contentId);
      setModules(structure.modules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch structure');
      console.error('Error fetching structure:', err);
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  // Create a new module
  const createModule = useCallback(
    async (data: Omit<CreateModuleRequest, 'contentId'>) => {
      if (!contentId) {
        throw new Error('Content ID is required to create a module');
      }
      
      try {
        setLoading(true);
        setError(null);
        const module = await modulesApi.createModule({
          ...data,
          contentId,
        });
        
        // Add to local state
        setModules(prev => [...prev, { ...module, resources: [] }]);
        return module;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create module');
        console.error('Error creating module:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [contentId]
  );

  // Update a module
  const updateModule = useCallback(
    async (moduleId: string, data: Partial<ContentModule>) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await modulesApi.updateModule(moduleId, data);
        
        // Update local state
        setModules(prev =>
          prev.map(m => (m.id === moduleId ? { ...m, ...updated } : m))
        );
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update module');
        console.error('Error updating module:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete a module
  const deleteModule = useCallback(async (moduleId: string) => {
    try {
      setLoading(true);
      setError(null);
      await modulesApi.deleteModule(moduleId);
      
      // Remove from local state
      setModules(prev => prev.filter(m => m.id !== moduleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete module');
      console.error('Error deleting module:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reorder modules
  const reorderModules = useCallback(
    async (orders: { id: string; order: number }[]) => {
      if (!contentId) return;
      try {
        setLoading(true);
        setError(null);
        await modulesApi.reorderModules(contentId, { orders });
        
        // Update local state
        setModules(prev => {
          const updated = [...prev];
          orders.forEach(({ id, order }) => {
            const module = updated.find(m => m.id === id);
            if (module) module.order = order;
          });
          return updated.sort((a, b) => a.order - b.order);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reorder modules');
        console.error('Error reordering modules:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [contentId]
  );

  // Add a resource (with file upload support)
  const addResource = useCallback(
    async (
      moduleId: string,
      data: Omit<CreateResourceRequest, 'moduleId'> | { file: File; title: string; description?: string; isPreview?: boolean }
    ) => {
      const tempId = `temp-${Date.now()}`;
      
      try {
        // Track upload progress
        setUploadProgress(prev => ({
          ...prev,
          [tempId]: { resourceId: tempId, progress: 0, status: 'uploading' },
        }));

        let resourceData: Omit<CreateResourceRequest, 'moduleId'>;

        // If a file is provided, upload it first
        if ('file' in data) {
          const { file, title, description, isPreview } = data;
          const resourceType = getResourceTypeFromFile(file);
          
          // Upload based on resource type
          let upload;
          switch (resourceType) {
            case 'video':
              upload = await mediaApi.uploadVideo(file);
              break;
            case 'audio':
              upload = await mediaApi.uploadAudio(file);
              break;
            case 'image':
              upload = await mediaApi.uploadImage(file);
              break;
            case 'document':
              upload = await mediaApi.uploadDocument(file);
              break;
            default:
              upload = await mediaApi.uploadFile(file);
          }

          setUploadProgress(prev => ({
            ...prev,
            [tempId]: { resourceId: tempId, progress: 50, status: 'processing' },
          }));

          resourceData = {
            title,
            description,
            resourceType,
            url: upload.url,
            duration: upload.duration,
            fileSize: upload.bytes,
            metadata: {
              cloudinaryPublicId: upload.public_id,
              thumbnailUrl: upload.thumbnail_url,
              width: upload.width,
              height: upload.height,
              format: upload.format,
            },
            isPreview: isPreview ?? false,
          };
        } else {
          resourceData = data;
        }

        setUploadProgress(prev => ({
          ...prev,
          [tempId]: { resourceId: tempId, progress: 75, status: 'processing' },
        }));

        // Create the resource
        const resource = await modulesApi.createResource({
          ...resourceData,
          moduleId,
        });

        // Update local state
        setModules(prev =>
          prev.map(m =>
            m.id === moduleId
              ? { ...m, resources: [...m.resources, resource] }
              : m
          )
        );

        setUploadProgress(prev => ({
          ...prev,
          [tempId]: { resourceId: resource.id, progress: 100, status: 'complete' },
        }));

        // Clear progress after 2 seconds
        setTimeout(() => {
          setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[tempId];
            return updated;
          });
        }, 2000);

        return resource;
      } catch (err) {
        setUploadProgress(prev => ({
          ...prev,
          [tempId]: {
            resourceId: tempId,
            progress: 0,
            status: 'error',
            error: err instanceof Error ? err.message : 'Upload failed',
          },
        }));
        
        setError(err instanceof Error ? err.message : 'Failed to add resource');
        console.error('Error adding resource:', err);
        throw err;
      }
    },
    []
  );

  // Update a resource
  const updateResource = useCallback(
    async (resourceId: string, data: Partial<ContentResource>) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await modulesApi.updateResource(resourceId, data);
        
        // Update local state
        setModules(prev =>
          prev.map(m => ({
            ...m,
            resources: m.resources.map(r =>
              r.id === resourceId ? { ...r, ...updated } : r
            ),
          }))
        );
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update resource');
        console.error('Error updating resource:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete a resource
  const deleteResource = useCallback(async (resourceId: string) => {
    try {
      setLoading(true);
      setError(null);
      await modulesApi.deleteResource(resourceId);
      
      // Remove from local state
      setModules(prev =>
        prev.map(m => ({
          ...m,
          resources: m.resources.filter(r => r.id !== resourceId),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resource');
      console.error('Error deleting resource:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reorder resources within a module
  const reorderResources = useCallback(
    async (moduleId: string, orders: { id: string; order: number }[]) => {
      try {
        setLoading(true);
        setError(null);
        await modulesApi.reorderResources(moduleId, { orders });
        
        // Update local state
        setModules(prev =>
          prev.map(m => {
            if (m.id !== moduleId) return m;
            
            const updated = [...m.resources];
            orders.forEach(({ id, order }) => {
              const resource = updated.find(r => r.id === id);
              if (resource) resource.order = order;
            });
            return {
              ...m,
              resources: updated.sort((a, b) => a.order - b.order),
            };
          })
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reorder resources');
        console.error('Error reordering resources:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    modules,
    loading,
    error,
    uploadProgress,
    fetchStructure,
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
    addResource,
    updateResource,
    deleteResource,
    reorderResources,
  };
}
