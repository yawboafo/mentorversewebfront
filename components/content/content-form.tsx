'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { contentApi } from '@/lib/api/content';
import { modulesApi } from '@/lib/api/modules';
import { aiApi } from '@/lib/api/ai';
import { useContentModules } from '@/hooks/use-content-modules';
import type { ResourceType, Content, ContentDraft } from '@/lib/api/types';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  X,
  BookOpen,
  Video,
  FileText,
  Users,
  Globe,
  Target,
  Sparkles,
  GripVertical,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  File,
  Music,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  Save,
  Wand2
} from 'lucide-react';

const contentTypeOptions = [
  { value: 'course', label: 'Course', icon: BookOpen },
  { value: 'framework', label: 'Framework', icon: Target }
];

const formatOptions = [
  { value: 'video', label: 'Video' },
  { value: 'text', label: 'Text' },
  { value: 'interactive', label: 'Interactive' },
  { value: 'mixed', label: 'Mixed' }
];

const deliveryModeOptions = [
  { value: 'self_paced', label: 'Self-Paced' },
  { value: 'one_on_one', label: 'One-on-One' },
  { value: 'group', label: 'Group Session' },
  { value: 'in_person', label: 'In-Person' },
  { value: 'online', label: 'Online Live' }
];

const levelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'all', label: 'All Levels' }
];

interface ContentFormProps {
  mode: 'create' | 'edit';
  initialData?: Content;
  onSuccess?: () => void;
}

export function ContentForm({ mode, initialData, onSuccess }: ContentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [contentId, setContentId] = useState<string | null>(initialData?.id || null);
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishInstructions, setPolishInstructions] = useState('');
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    contentType: (initialData?.contentType || 'course') as 'course' | 'framework',
    format: (initialData?.format || 'video') as 'video' | 'text' | 'interactive' | 'mixed',
    targetAudience: initialData?.targetAudience || '',
    problemItSolves: initialData?.problemItSolves || '',
    learningOutcomes: initialData?.learningOutcomes || [] as string[],
    deliveryModes: initialData?.deliveryModes || [] as string[],
    estimatedDuration: initialData?.estimatedDuration || '',
    maxParticipants: initialData?.maxParticipants?.toString() || '',
    location: initialData?.location || '',
    tools: initialData?.tools || [] as string[],
    prerequisites: initialData?.prerequisites || '',
    requiredTimePerWeek: initialData?.requiredTimePerWeek || '',
    supportModel: initialData?.supportModel || '',
    price: initialData?.price?.toString() || '',
    level: initialData?.level || 'intermediate',
    tags: initialData?.tags || [] as string[]
  });

  // Module management
  const {
    modules,
    loading: modulesLoading,
    uploadProgress,
    fetchStructure,
    createModule: createModuleApi,
    updateModule: updateModuleApi,
    deleteModule: deleteModuleApi,
    addResource,
    deleteResource: deleteResourceApi,
  } = useContentModules({ contentId: contentId || '' });

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');
  const [editModuleTitle, setEditModuleTitle] = useState('');
  const [editModuleDescription, setEditModuleDescription] = useState('');
  
  // Resource management
  const [showAddResource, setShowAddResource] = useState<string | null>(null);
  const [resourceType, setResourceType] = useState<ResourceType>('video');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [isFree, setIsFree] = useState(false);

  const [newOutcome, setNewOutcome] = useState('');
  const [newTool, setNewTool] = useState('');
  const [newTag, setNewTag] = useState('');

  // Fetch modules when content exists
  useEffect(() => {
    if (contentId && currentStep === 3) {
      fetchStructure();
    }
  }, [contentId, currentStep, fetchStructure]);

  // For edit mode, set content ID and jump to step 3 (modules) initially
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setContentId(initialData.id);
      // Start at step 1 but content is already saved
    }
  }, [mode, initialData]);

  const addLearningOutcome = () => {
    if (newOutcome.trim()) {
      setFormData(prev => ({
        ...prev,
        learningOutcomes: [...prev.learningOutcomes, newOutcome.trim()]
      }));
      setNewOutcome('');
    }
  };

  const removeLearningOutcome = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index)
    }));
  };

  const addTool = () => {
    if (newTool.trim()) {
      setFormData(prev => ({
        ...prev,
        tools: [...prev.tools, newTool.trim()]
      }));
      setNewTool('');
    }
  };

  const removeTool = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const toggleDeliveryMode = (mode: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryModes: prev.deliveryModes.includes(mode)
        ? prev.deliveryModes.filter(m => m !== mode)
        : [...prev.deliveryModes, mode]
    }));
  };

  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handlePolishWithAI = async () => {
    if (!polishInstructions.trim()) {
      toast.error('Please provide instructions for AI');
      return;
    }

    setIsPolishing(true);
    try {
      // Create a draft object from current form data
      const currentDraft: ContentDraft = {
        title: formData.title,
        description: formData.description,
        content_type: formData.contentType,
        format: formData.format,
        target_audience: formData.targetAudience,
        problem_it_solves: formData.problemItSolves,
        learning_outcomes: formData.learningOutcomes,
        delivery_modes: formData.deliveryModes as any[],
        estimated_duration: formData.estimatedDuration,
        level: formData.level,
        prerequisites: formData.prerequisites,
        support_model: formData.supportModel,
        outline: [],
        tags: formData.tags,
        tools: formData.tools,
        price: parseFloat(formData.price) || 0,
      };

      const refined = await aiApi.refineContent({
        content_id: contentId || undefined,
        draft: currentDraft,
        instructions: polishInstructions.trim(),
      });

      // Update form with refined data
      setFormData({
        title: refined.title,
        description: refined.description,
        contentType: refined.content_type,
        format: refined.format || formData.format,
        targetAudience: refined.target_audience,
        problemItSolves: refined.problem_it_solves,
        learningOutcomes: refined.learning_outcomes,
        deliveryModes: refined.delivery_modes as string[],
        estimatedDuration: refined.estimated_duration,
        maxParticipants: formData.maxParticipants,
        location: formData.location,
        tools: refined.tools || formData.tools,
        prerequisites: refined.prerequisites || formData.prerequisites,
        requiredTimePerWeek: formData.requiredTimePerWeek,
        supportModel: refined.support_model || formData.supportModel,
        price: refined.price?.toString() || formData.price,
        level: refined.level,
        tags: refined.tags || formData.tags,
      });

      setPolishInstructions('');
      toast.success('Content polished with AI! ✨');
    } catch (error: any) {
      console.error('Polish error:', error);
      toast.error(error.message || 'Failed to polish content');
    } finally {
      setIsPolishing(false);
    }
  };

  const handleCreateModule = async () => {
    if (!contentId) {
      toast.error('Please save content first');
      return;
    }
    if (!newModuleTitle.trim()) {
      toast.error('Module title is required');
      return;
    }

    try {
      const moduleData: any = {
        contentId: contentId,
        title: newModuleTitle,
        description: newModuleDescription || '',
        orderIndex: modules?.length || 0,
      };
      await createModuleApi(moduleData);
      setNewModuleTitle('');
      setNewModuleDescription('');
      toast.success('Module created!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create module');
    }
  };

  const handleUpdateModule = async (moduleId: string) => {
    if (!editModuleTitle.trim()) {
      toast.error('Module title is required');
      return;
    }

    try {
      const updateData: any = {
        title: editModuleTitle,
        description: editModuleDescription || '',
      };
      await updateModuleApi(moduleId, updateData);
      setEditingModule(null);
      setEditModuleTitle('');
      setEditModuleDescription('');
      toast.success('Module updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Delete this module and all its resources?')) return;

    try {
      await deleteModuleApi(moduleId);
      toast.success('Module deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete module');
    }
  };

  const handleAddResource = async (moduleId: string) => {
    if (!resourceTitle.trim()) {
      toast.error('Resource title is required');
      return;
    }

    if (resourceType === 'link' && !resourceUrl.trim()) {
      toast.error('URL is required for link resources');
      return;
    }

    if (resourceType !== 'link' && !resourceFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      // Find the module to get the current resource count for orderIndex
      const currentModule = modules?.find(m => m.id === moduleId);
      const orderIndex = currentModule?.resources?.length || 0;

      // For file uploads, pass the file object directly
      if (resourceType !== 'link' && resourceFile) {
        await addResource(moduleId, {
          file: resourceFile,
          title: resourceTitle,
          description: resourceDescription || undefined,
          isPreview: isFree,
        });
      } else {
        // For links, pass the resource data with required orderIndex
        await addResource(moduleId, {
          title: resourceTitle,
          description: resourceDescription || undefined,
          resourceType: resourceType,
          url: resourceUrl,
          isPreview: isFree,
          orderIndex: orderIndex,
        });
      }
      
      // Reset form
      setShowAddResource(null);
      setResourceTitle('');
      setResourceDescription('');
      setResourceUrl('');
      setResourceFile(null);
      setIsFree(false);
      
      toast.success('Resource added!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add resource');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Delete this resource?')) return;

    try {
      await deleteResourceApi(resourceId);
      toast.success('Resource deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete resource');
    }
  };

  const saveContent = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please provide a title');
      return false;
    }

    if (!formData.description.trim()) {
      toast.error('Please provide a description');
      return false;
    }

    if (!formData.targetAudience.trim()) {
      toast.error('Please provide target audience');
      return false;
    }

    if (formData.learningOutcomes.length === 0) {
      toast.error('Please add at least one learning outcome');
      return false;
    }

    if (formData.deliveryModes.length === 0) {
      toast.error('Please select at least one delivery mode');
      return false;
    }

    if (!formData.estimatedDuration.trim()) {
      toast.error('Please provide estimated duration');
      return false;
    }

    setIsLoading(true);

    try {
      // Build content data with only non-empty values
      const contentData: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        contentType: formData.contentType,
        format: formData.format,
        targetAudience: formData.targetAudience.trim(),
        learningOutcomes: formData.learningOutcomes.filter(lo => lo.trim()),
        deliveryModes: formData.deliveryModes,
        estimatedDuration: formData.estimatedDuration.trim(),
        level: formData.level,
        price: parseFloat(formData.price) || 0,
        currency: 'USD',
      };

      // Add optional fields only if they have values
      if (formData.problemItSolves?.trim()) {
        contentData.problemItSolves = formData.problemItSolves.trim();
      }

      if (formData.maxParticipants && parseInt(formData.maxParticipants) > 0) {
        contentData.maxParticipants = parseInt(formData.maxParticipants);
      }

      if (formData.location?.trim()) {
        contentData.location = formData.location.trim();
      }

      if (formData.tools.length > 0) {
        contentData.tools = formData.tools.filter(t => t.trim());
      }

      if (formData.prerequisites?.trim()) {
        contentData.prerequisites = formData.prerequisites.trim();
      }

      if (formData.requiredTimePerWeek?.trim()) {
        contentData.requiredTimePerWeek = formData.requiredTimePerWeek.trim();
      }

      if (formData.supportModel?.trim()) {
        contentData.supportModel = formData.supportModel.trim();
      }

      if (formData.tags.length > 0) {
        contentData.tags = formData.tags.filter(t => t.trim());
      }

      if (mode === 'edit' && contentId) {
        await contentApi.updateContent(contentId, contentData);
        toast.success('Content updated!');
      } else {
        contentData.status = 'draft';
        const response = await contentApi.createContent(contentData);
        setContentId(response.id);
        toast.success('Content saved as draft!');
      }
      
      return true;
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save content');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    // Validate step 1 before moving to step 2
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        toast.error('Please provide a title');
        return;
      }
      if (!formData.description.trim()) {
        toast.error('Please provide a description');
        return;
      }
      if (!formData.targetAudience.trim()) {
        toast.error('Please provide target audience');
        return;
      }
      setCurrentStep(2);
      return;
    }

    // In CREATE mode: Save content before moving to modules step
    // In EDIT mode: Just navigate without saving (user saves explicitly)
    if (currentStep === 2) {
      if (mode === 'create') {
        const saved = await saveContent();
        if (saved) {
          setCurrentStep(3);
        }
      } else {
        // Edit mode: just navigate
        setCurrentStep(3);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePublish = async () => {
    if (!contentId) {
      toast.error('Please save content first');
      return;
    }

    if (!modules || modules.length === 0) {
      toast.error('Please add at least one module before publishing');
      return;
    }

    const hasResources = modules.some(m => m.resources && m.resources.length > 0);
    if (!hasResources) {
      toast.error('Please add resources to your modules before publishing');
      return;
    }

    setIsLoading(true);
    try {
      await contentApi.publishContent(contentId);
      toast.success('Content published! 🎉');
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.push('/mentor/content');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Publish error:', err);
      toast.error(err.message || 'Failed to publish content');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Content Details' },
    { number: 3, title: 'Modules & Resources' },
    { number: 4, title: 'Pricing & Publish' }
  ];

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'file':
        return <File className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.number
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.number}
                </div>
                <span className="text-sm mt-2 font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Polish Section - Available in all steps */}
      {(currentStep === 1 || currentStep === 2) && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Polish with AI
            </CardTitle>
            <CardDescription>
              Get AI suggestions to improve your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={polishInstructions}
              onChange={(e) => setPolishInstructions(e.target.value)}
              placeholder="e.g., 'Make the description more engaging' or 'Improve the learning outcomes'"
              rows={3}
            />
            <Button
              onClick={handlePolishWithAI}
              disabled={isPolishing || !polishInstructions.trim()}
              className="w-full"
              variant="outline"
            >
              {isPolishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Polishing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Polish with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter content title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this content is about"
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type *</Label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value: 'course' | 'framework') =>
                      setFormData({ ...formData, contentType: value })
                    }
                    disabled={mode === 'edit'} // Can't change type in edit mode
                  >
                    <SelectTrigger id="contentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Format *</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value: any) => setFormData({ ...formData, format: value })}
                  >
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Textarea
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="e.g., Beginner developers, Business owners"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemItSolves">What Problem Does This Solve?</Label>
                <Textarea
                  id="problemItSolves"
                  value={formData.problemItSolves}
                  onChange={(e) => setFormData({ ...formData, problemItSolves: e.target.value })}
                  placeholder="Describe the problem this content addresses"
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Step 2: Content Details */}
          {currentStep === 2 && (
            <>
              <div className="space-y-2">
                <Label>Learning Outcomes *</Label>
                <div className="flex gap-2">
                  <Input
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value)}
                    placeholder="What will students learn?"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningOutcome())}
                  />
                  <Button type="button" onClick={addLearningOutcome}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.learningOutcomes.length === 0 && (
                  <p className="text-sm text-muted-foreground">Add at least one learning outcome</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.learningOutcomes.map((outcome, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {outcome}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeLearningOutcome(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Delivery Modes *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {deliveryModeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={formData.deliveryModes.includes(option.value)}
                        onCheckedChange={() => toggleDeliveryMode(option.value)}
                      />
                      <label htmlFor={option.value} className="text-sm cursor-pointer">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.deliveryModes.length === 0 && (
                  <p className="text-sm text-muted-foreground">Select at least one delivery mode</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration">Estimated Duration</Label>
                  <Input
                    id="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    placeholder="e.g., 4 weeks, 10 hours"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requiredTimePerWeek">Time Commitment/Week</Label>
                  <Input
                    id="requiredTimePerWeek"
                    value={formData.requiredTimePerWeek}
                    onChange={(e) => setFormData({ ...formData, requiredTimePerWeek: e.target.value })}
                    placeholder="e.g., 5-10 hours/week"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (if applicable)</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Online, New York"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tools/Software Required</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    placeholder="e.g., VS Code, Figma"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                  />
                  <Button type="button" onClick={addTool}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tools.map((tool, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tool}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTool(index)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisites</Label>
                <Textarea
                  id="prerequisites"
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                  placeholder="What should students know before starting?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportModel">Support Model</Label>
                <Input
                  id="supportModel"
                  value={formData.supportModel}
                  onChange={(e) => setFormData({ ...formData, supportModel: e.target.value })}
                  placeholder="e.g., Email support, Live Q&A sessions"
                />
              </div>
            </>
          )}

          {/* Step 3: Modules & Resources - (Abbreviated for token limit, will include full implementation) */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Content Structure</h3>
                  <p className="text-sm text-muted-foreground">
                    Organize your content into modules and add resources
                  </p>
                </div>
              </div>

              {/* Add New Module */}
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="newModuleTitle">Module Title</Label>
                      <Input
                        id="newModuleTitle"
                        value={newModuleTitle}
                        onChange={(e) => setNewModuleTitle(e.target.value)}
                        placeholder="e.g., Introduction to Web Development"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newModuleDescription">Module Description</Label>
                      <Textarea
                        id="newModuleDescription"
                        value={newModuleDescription}
                        onChange={(e) => setNewModuleDescription(e.target.value)}
                        placeholder="Describe what this module covers"
                        rows={2}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleCreateModule}
                      className="w-full"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Module
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Modules List */}
              {modulesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !modules || modules.length === 0 ? (
                <Card className="bg-muted/30">
                  <CardContent className="py-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      No modules yet. Add your first module above.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <Card key={module.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">
                              <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                            </div>
                            <div className="flex-1">
                              {editingModule === module.id ? (
                                <div className="space-y-2">
                                  <Input
                                    value={editModuleTitle}
                                    onChange={(e) => setEditModuleTitle(e.target.value)}
                                    placeholder="Module title"
                                  />
                                  <Textarea
                                    value={editModuleDescription}
                                    onChange={(e) => setEditModuleDescription(e.target.value)}
                                    placeholder="Module description"
                                    rows={2}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateModule(module.id)}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingModule(null);
                                        setEditModuleTitle('');
                                        setEditModuleDescription('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="p-0 h-auto"
                                      onClick={() => toggleModuleExpanded(module.id)}
                                    >
                                      {expandedModules.has(module.id) ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <CardTitle className="text-base">
                                      {index + 1}. {module.title}
                                    </CardTitle>
                                    <Badge variant="secondary" className="ml-2">
                                      {module.resources?.length || 0} resources
                                    </Badge>
                                  </div>
                                  {module.description && (
                                    <CardDescription className="mt-1 ml-6">
                                      {module.description}
                                    </CardDescription>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          {editingModule !== module.id && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingModule(module.id);
                                  setEditModuleTitle(module.title);
                                  setEditModuleDescription(module.description || '');
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteModule(module.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      {expandedModules.has(module.id) && (
                        <CardContent className="pt-0">
                          {/* Add Resource Form */}
                          {showAddResource === module.id ? (
                            <Card className="border-dashed mb-3">
                              <CardContent className="pt-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label>Resource Type</Label>
                                    <Select
                                      value={resourceType}
                                      onValueChange={(value: ResourceType) => setResourceType(value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="audio">Audio</SelectItem>
                                        <SelectItem value="image">Image</SelectItem>
                                        <SelectItem value="document">Document (PDF)</SelectItem>
                                        <SelectItem value="file">File</SelectItem>
                                        <SelectItem value="link">External Link</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-end">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`free-${module.id}`}
                                        checked={isFree}
                                        onCheckedChange={(checked) => setIsFree(checked as boolean)}
                                      />
                                      <label
                                        htmlFor={`free-${module.id}`}
                                        className="text-sm font-medium cursor-pointer"
                                      >
                                        Free Preview
                                      </label>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Label>Title</Label>
                                  <Input
                                    value={resourceTitle}
                                    onChange={(e) => setResourceTitle(e.target.value)}
                                    placeholder="Resource title"
                                  />
                                </div>
                                <div>
                                  <Label>Description (optional)</Label>
                                  <Textarea
                                    value={resourceDescription}
                                    onChange={(e) => setResourceDescription(e.target.value)}
                                    placeholder="Resource description"
                                    rows={2}
                                  />
                                </div>
                                {resourceType === 'link' ? (
                                  <div>
                                    <Label>URL</Label>
                                    <Input
                                      value={resourceUrl}
                                      onChange={(e) => setResourceUrl(e.target.value)}
                                      placeholder="https://example.com"
                                      type="url"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <Label>File</Label>
                                    <Input
                                      type="file"
                                      onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                                      accept={
                                        resourceType === 'video'
                                          ? 'video/*'
                                          : resourceType === 'audio'
                                          ? 'audio/*'
                                          : resourceType === 'image'
                                          ? 'image/*'
                                          : resourceType === 'document'
                                          ? '.pdf'
                                          : '*'
                                      }
                                    />
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddResource(module.id)}
                                    disabled={modulesLoading}
                                  >
                                    {modulesLoading ? (
                                      <>
                                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                        Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="h-3 w-3 mr-2" />
                                        Add Resource
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setShowAddResource(null);
                                      setResourceTitle('');
                                      setResourceDescription('');
                                      setResourceUrl('');
                                      setResourceFile(null);
                                      setIsFree(false);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mb-3"
                              onClick={() => setShowAddResource(module.id)}
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Add Resource
                            </Button>
                          )}

                          {/* Resources List */}
                          {module.resources && module.resources.length > 0 ? (
                            <div className="space-y-2">
                              {module.resources.map((resource) => (
                                <div
                                  key={resource.id}
                                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="text-muted-foreground">
                                      {getResourceIcon(resource.resourceType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium text-sm truncate">
                                          {resource.title}
                                        </p>
                                        {resource.isPreview && (
                                          <Badge variant="secondary" className="text-xs">
                                            Free
                                          </Badge>
                                        )}
                                      </div>
                                      {resource.description && (
                                        <p className="text-xs text-muted-foreground truncate">
                                          {resource.description}
                                        </p>
                                      )}
                                      <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                                        <span className="capitalize">{resource.resourceType}</span>
                                        {resource.fileSize && (
                                          <>
                                            <span>•</span>
                                            <span>{formatFileSize(resource.fileSize)}</span>
                                          </>
                                        )}
                                        {resource.duration && (
                                          <>
                                            <span>•</span>
                                            <span>{Math.round(resource.duration / 60)} min</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteResource(resource.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No resources yet
                            </p>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Pricing & Publish */}
          {currentStep === 4 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="99.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger id="level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tags for discoverability"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Title:</strong> {formData.title || 'Not set'}</p>
                  <p><strong>Type:</strong> {formData.contentType}</p>
                  <p><strong>Format:</strong> {formData.format}</p>
                  <p><strong>Learning Outcomes:</strong> {formData.learningOutcomes.length} items</p>
                  <p><strong>Delivery Modes:</strong> {formData.deliveryModes.length} selected</p>
                  <p><strong>Modules:</strong> {modules?.length || 0}</p>
                  <p><strong>Price:</strong> ${formData.price || '0.00'}</p>
                  <p><strong>Status:</strong> {mode === 'edit' ? initialData?.status : 'draft'}</p>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Next'
            )}
          </Button>
        ) : currentStep === 3 ? (
          <Button
            type="button"
            onClick={() => setCurrentStep(4)}
          >
            Continue to Pricing
          </Button>
        ) : (
          <div className="flex gap-2">
            {mode === 'edit' && (
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  await saveContent();
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
            <Button 
              type="button" 
              onClick={handlePublish}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Content'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
