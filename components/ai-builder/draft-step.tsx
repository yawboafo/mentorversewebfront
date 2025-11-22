'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { aiApi } from '@/lib/api/ai';
import { CourseIdea, ContentDraft, DeliveryMode } from '@/lib/api/types';
import { Loader2, FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface DraftStepProps {
  selectedIdea: CourseIdea | null;
  onDraftGenerated: (draft: ContentDraft) => void;
  onBack: () => void;
}

const deliveryModeOptions: { value: DeliveryMode; label: string }[] = [
  { value: 'self_paced', label: 'Self-Paced' },
  { value: 'one_on_one', label: 'One-on-One' },
  { value: 'group', label: 'Group Sessions' },
  { value: 'in_person', label: 'In-Person' },
  { value: 'online', label: 'Online' },
];

const levelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const contentTypeOptions = [
  { value: 'course', label: 'Course' },
  { value: 'framework', label: 'Framework' },
];

export function DraftStep({ selectedIdea, onDraftGenerated, onBack }: DraftStepProps) {
  const [title, setTitle] = useState(selectedIdea?.title || '');
  const [targetAudience, setTargetAudience] = useState(selectedIdea?.target_audience || '');
  const [problemItSolves, setProblemItSolves] = useState(selectedIdea?.problem_it_solves || '');
  const [outline, setOutline] = useState('');
  const [contentType, setContentType] = useState<string>('course');
  const [deliveryModes, setDeliveryModes] = useState<DeliveryMode[]>(['self_paced']);
  const [level, setLevel] = useState(selectedIdea?.level || 'intermediate');
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleDeliveryMode = (mode: DeliveryMode) => {
    setDeliveryModes(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  const handleGenerateDraft = async () => {
    if (!title.trim()) {
      toast.error('Please provide a title');
      return;
    }

    setIsGenerating(true);
    try {
      const draft = await aiApi.generateContentDraft({
        title: title.trim(),
        target_audience: targetAudience.trim() || undefined,
        problem_it_solves: problemItSolves.trim() || undefined,
        outline: outline.trim() || undefined,
        delivery_modes: deliveryModes,
        level,
        content_type: contentType,
      });

      onDraftGenerated(draft);
      toast.success('Draft generated successfully!');
    } catch (error: any) {
      console.error('Failed to generate draft:', error);
      toast.error(error.message || 'Failed to generate draft');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Ideas
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            Course Details
          </CardTitle>
          <CardDescription>
            Provide information about your course. AI will generate a comprehensive draft based on these details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                placeholder="E.g., Advanced React Hooks Masterclass"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content-type">Type *</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger id="content-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger id="level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="E.g., Intermediate React developers looking to level up"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="problem">Problem It Solves</Label>
              <Textarea
                id="problem"
                placeholder="E.g., Many React developers struggle with managing complex state and side effects..."
                value={problemItSolves}
                onChange={(e) => setProblemItSolves(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="outline">Topics to Cover (Optional)</Label>
              <Textarea
                id="outline"
                placeholder="E.g., useState basics, useEffect patterns, custom hooks, useContext, useReducer, performance optimization..."
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                List topics, modules, or key concepts you want to include. AI will structure them into a full outline.
              </p>
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label>Delivery Modes *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {deliveryModeOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={deliveryModes.includes(option.value)}
                      onCheckedChange={() => toggleDeliveryMode(option.value)}
                    />
                    <Label htmlFor={option.value} className="cursor-pointer font-normal">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerateDraft}
            disabled={isGenerating || !title.trim() || deliveryModes.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                AI is designing your course...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Full Draft With AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">What happens next?</h4>
              <p className="text-sm text-muted-foreground">
                AI will generate a complete course structure including: detailed description, learning outcomes, 
                module breakdown, activities, resources, and estimated duration. You'll be able to review and refine 
                everything in the next step.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
