'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRequireRole } from '@/hooks/use-require-auth';
import { Sparkles, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { IdeaStep } from '@/components/ai-builder/idea-step';
import { DraftStep } from '@/components/ai-builder/draft-step';
import { RefineStep } from '@/components/ai-builder/refine-step';
import { CourseIdea, ContentDraft } from '@/lib/api/types';
import { contentApi } from '@/lib/api/content';
import { toast } from 'sonner';

type Step = 'ideas' | 'draft' | 'refine';

export default function AIBuilderPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireRole(['mentor', 'admin']);
  
  const [currentStep, setCurrentStep] = useState<Step>('ideas');
  const [selectedIdea, setSelectedIdea] = useState<CourseIdea | null>(null);
  const [draft, setDraft] = useState<ContentDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const steps = [
    { id: 'ideas', label: 'Generate Ideas', icon: Sparkles },
    { id: 'draft', label: 'Create Draft', icon: ArrowRight },
    { id: 'refine', label: 'Refine & Polish', icon: Check },
  ];

  const handleIdeaSelected = (idea: CourseIdea) => {
    setSelectedIdea(idea);
    setCurrentStep('draft');
  };

  const handleDraftGenerated = (generatedDraft: ContentDraft) => {
    setDraft(generatedDraft);
    setCurrentStep('refine');
  };

  const handleDraftRefined = (refinedDraft: ContentDraft) => {
    setDraft(refinedDraft);
  };

  const handleSaveDraft = async () => {
    if (!draft) return;

    setIsSaving(true);
    try {
      // Map ContentDraft to Content creation payload
      // Note: Backend expects camelCase (contentType, not content_type)
      // outline and ai_context are NOT sent during content creation
      // Outline/modules are added separately after content is created
      const contentPayload: any = {
        title: draft.title,
        description: draft.description,
        contentType: draft.content_type || 'course', // camelCase for backend
        targetAudience: draft.target_audience,
        problemItSolves: draft.problem_it_solves || null,
        learningOutcomes: draft.learning_outcomes || [],
        deliveryModes: draft.delivery_modes || [],
        estimatedDuration: draft.estimated_duration,
        level: draft.level || 'intermediate',
        prerequisites: draft.prerequisites || null,
        supportModel: draft.support_model || null,
        tags: draft.tags || [],
        price: draft.price || 0,
        currency: 'USD', // Required by backend despite v2.7.0 docs
        status: 'draft' as const,
        format: draft.format || 'mixed',
        tools: draft.tools || [],
      };

      console.log('💾 Saving AI-generated content:', contentPayload);
      const savedContent = await contentApi.createContent(contentPayload);
      console.log('✅ Content saved successfully:', savedContent);
      console.log('📝 Content ID:', savedContent.id, 'Mentor ID:', savedContent.mentorId);
      
      toast.success('Draft saved successfully!');
      router.push(`/mentor/dashboard`);
    } catch (error: any) {
      console.error('Failed to save draft:', error);
      toast.error(error.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Course Builder
            </h1>
            <p className="text-muted-foreground">Let AI help you create amazing courses in minutes</p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = 
                (step.id === 'ideas' && (selectedIdea || draft)) ||
                (step.id === 'draft' && draft);

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white scale-110'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {currentStep === 'ideas' && (
          <IdeaStep onIdeaSelected={handleIdeaSelected} />
        )}
        
        {currentStep === 'draft' && (
          <DraftStep
            selectedIdea={selectedIdea}
            onDraftGenerated={handleDraftGenerated}
            onBack={() => setCurrentStep('ideas')}
          />
        )}
        
        {currentStep === 'refine' && draft && (
          <RefineStep
            draft={draft}
            onDraftRefined={handleDraftRefined}
            onSave={handleSaveDraft}
            isSaving={isSaving}
            onBack={() => setCurrentStep('draft')}
          />
        )}
      </div>
    </div>
  );
}
