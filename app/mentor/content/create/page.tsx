'use client';

import { useState } from 'react';
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
import { useRequireRole } from '@/hooks/use-require-auth';
import { contentApi } from '@/lib/api/content';
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
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

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

export default function CreateContentPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireRole(['mentor', 'admin']);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'course' as 'course' | 'framework',
    format: 'video' as 'video' | 'text' | 'interactive' | 'mixed',
    targetAudience: '',
    problemItSolves: '',
    learningOutcomes: [] as string[],
    deliveryModes: [] as string[],
    estimatedDuration: '',
    maxParticipants: '',
    location: '',
    tools: [] as string[],
    prerequisites: '',
    requiredTimePerWeek: '',
    supportModel: '',
    price: '',
    level: 'intermediate',
    tags: [] as string[]
  });

  const [newOutcome, setNewOutcome] = useState('');
  const [newTool, setNewTool] = useState('');
  const [newTag, setNewTag] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please provide a title');
      setCurrentStep(1);
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please provide a description');
      setCurrentStep(1);
      return;
    }

    if (formData.learningOutcomes.length === 0) {
      toast.error('Please add at least one learning outcome');
      setCurrentStep(2);
      return;
    }

    if (formData.deliveryModes.length === 0) {
      toast.error('Please select at least one delivery mode');
      setCurrentStep(2);
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please provide a valid price');
      setCurrentStep(3);
      return;
    }

    setIsLoading(true);

    try {
      const contentData = {
        title: formData.title,
        description: formData.description,
        content_type: formData.contentType,
        format: formData.format,
        target_audience: formData.targetAudience,
        problem_it_solves: formData.problemItSolves || null,
        learning_outcomes: formData.learningOutcomes,
        delivery_modes: formData.deliveryModes,
        estimated_duration: formData.estimatedDuration,
        max_participants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        location: formData.location || null,
        tools: formData.tools,
        prerequisites: formData.prerequisites || null,
        required_time_per_week: formData.requiredTimePerWeek || null,
        support_model: formData.supportModel || null,
        price: parseFloat(formData.price),
        level: formData.level,
        tags: formData.tags,
        status: 'draft' as const
      };

      await contentApi.createContent(contentData);
      toast.success('Content created successfully! 🎉');
      
      setTimeout(() => {
        router.push('/mentor/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('❌ Create content error:', err);
      toast.error(err.message || 'Failed to create content');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Content Details' },
    { number: 3, title: 'Pricing & Tags' }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link href="/mentor/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create New Content</h1>
            <p className="text-muted-foreground mt-2">
              Manually create a course or framework
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/mentor/ai-builder">
              <Sparkles className="h-4 w-4" />
              Use AI Builder
            </Link>
          </Button>
        </div>
      </div>

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

      {/* Form */}
      <form onSubmit={handleSubmit}>
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
                    rows={4}
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
                  <Input
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="e.g., Beginner developers, Business owners"
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

            {/* Step 3: Pricing & Tags */}
            {currentStep === 3 && (
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
                    <p><strong>Price:</strong> ${formData.price || '0.00'}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
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
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Content'
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
