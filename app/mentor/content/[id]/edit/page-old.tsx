'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { useContentModules } from '@/hooks/use-content-modules';
import { aiApi } from '@/lib/api/ai';
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

export default function EditContentPage() {
  const router = useRouter();
  const params = useParams();
  const contentId = params.id as string;
  const { user, isLoading: authLoading } = useRequireRole(['mentor', 'admin']);
  
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: '',
    problemItSolves: '',
    estimatedDuration: '',
    prerequisites: '',
    price: '',
    level: 'intermediate',
  });

  useEffect(() => {
    if (!contentId) return;
    
    const loadContent = async () => {
      try {
        setIsLoading(true);
        const data = await contentApi.getContentById(contentId);
        setContent(data);
        
        // Populate form with existing data
        setFormData({
          title: data.title,
          description: data.description,
          targetAudience: data.targetAudience,
          problemItSolves: data.problemItSolves || '',
          estimatedDuration: data.estimatedDuration,
          prerequisites: data.prerequisites || '',
          price: data.price.toString(),
          level: data.level,
        });
      } catch (error: any) {
        console.error('Failed to load content:', error);
        toast.error('Failed to load content');
        router.push('/mentor/content');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [contentId, router]);

  const handleSave = async () => {
    if (!content) return;

    setIsSaving(true);
    try {
      await contentApi.updateContent(content.id, {
        title: formData.title,
        description: formData.description,
        targetAudience: formData.targetAudience,
        problemItSolves: formData.problemItSolves,
        estimatedDuration: formData.estimatedDuration,
        prerequisites: formData.prerequisites,
        price: parseFloat(formData.price),
        level: formData.level,
      });
      
      toast.success('Content updated successfully!');
      router.push('/mentor/content');
    } catch (error: any) {
      console.error('Failed to update content:', error);
      toast.error(error.message || 'Failed to update content');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter content title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your content"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Textarea
              id="targetAudience"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              placeholder="Who is this content for?"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="problemItSolves">Problem It Solves</Label>
            <Textarea
              id="problemItSolves"
              value={formData.problemItSolves}
              onChange={(e) => setFormData({ ...formData, problemItSolves: e.target.value })}
              placeholder="What problem does this content solve?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedDuration">Estimated Duration</Label>
              <Input
                id="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                placeholder="e.g., 4 weeks"
              />
            </div>

            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="level">Level</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => setFormData({ ...formData, level: value })}
            >
              <SelectTrigger id="level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="all">All Levels</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="prerequisites">Prerequisites</Label>
            <Textarea
              id="prerequisites"
              value={formData.prerequisites}
              onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
              placeholder="What should learners know before starting?"
              rows={2}
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
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
            <Button
              variant="outline"
              onClick={() => router.push('/mentor/content')}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
