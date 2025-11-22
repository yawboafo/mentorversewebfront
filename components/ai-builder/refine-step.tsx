'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { aiApi } from '@/lib/api/ai';
import { ContentDraft } from '@/lib/api/types';
import { Loader2, Wand2, Save, ArrowLeft, Edit, CheckCircle2, Clock, Target, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface RefineStepProps {
  draft: ContentDraft;
  onDraftRefined: (draft: ContentDraft) => void;
  onSave: () => void;
  isSaving: boolean;
  onBack: () => void;
}

export function RefineStep({ draft, onDraftRefined, onSave, isSaving, onBack }: RefineStepProps) {
  const [refinementInstructions, setRefinementInstructions] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editable fields
  const [editedTitle, setEditedTitle] = useState(draft.title);
  const [editedDescription, setEditedDescription] = useState(draft.description);
  const [editedPrice, setEditedPrice] = useState(draft.price?.toString() || '0');

  const handleRefine = async () => {
    if (!refinementInstructions.trim()) {
      toast.error('Please provide refinement instructions');
      return;
    }

    setIsRefining(true);
    try {
      const refined = await aiApi.refineContent({
        content_id: draft.id,
        draft: draft,
        instructions: refinementInstructions.trim(),
      });

      onDraftRefined(refined);
      setEditedTitle(refined.title);
      setEditedDescription(refined.description);
      setRefinementInstructions('');
      toast.success('Draft refined successfully!');
    } catch (error: any) {
      console.error('Failed to refine draft:', error);
      toast.error(error.message || 'Failed to refine draft');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSaveEdits = () => {
    const updatedDraft = {
      ...draft,
      title: editedTitle,
      description: editedDescription,
      price: parseFloat(editedPrice) || 0,
    };
    onDraftRefined(updatedDraft);
    setIsEditing(false);
    toast.success('Changes saved');
  };

  const currentDraft = {
    ...draft,
    title: editedTitle,
    description: editedDescription,
    price: parseFloat(editedPrice) || draft.price,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Draft Settings
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-emerald-600"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </>
          )}
        </Button>
      </div>

      {/* Draft Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Your Course Draft
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel Edit' : 'Edit Details'}
            </Button>
          </div>
          <CardDescription>
            Review your AI-generated course. You can make manual edits or ask AI to refine it further.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title & Type */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="capitalize">{currentDraft.content_type}</Badge>
              <Badge variant="outline" className="capitalize">{currentDraft.level}</Badge>
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-2xl font-bold"
                />
              </div>
            ) : (
              <h2 className="text-2xl font-bold">{currentDraft.title}</h2>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Description</Label>
            {isEditing ? (
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={4}
              />
            ) : (
              <p className="text-muted-foreground">{currentDraft.description}</p>
            )}
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium">{currentDraft.estimated_duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Audience</p>
                <p className="text-sm font-medium">{currentDraft.target_audience}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Modules</p>
                <p className="text-sm font-medium">{currentDraft.outline.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <div className="w-full">
                  <Label htmlFor="edit-price" className="text-xs text-muted-foreground">Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editedPrice}
                    onChange={(e) => setEditedPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    className="h-8"
                  />
                </div>
              ) : (
                <>
                  <span className="text-2xl font-bold text-green-600">$</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-sm font-medium">${currentDraft.price || 0}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {isEditing && (
            <Button onClick={handleSaveEdits} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}

          <Separator />

          {/* Problem It Solves */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Problem It Solves</Label>
            <p className="text-sm text-muted-foreground">{currentDraft.problem_it_solves}</p>
          </div>

          {/* Learning Outcomes */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Learning Outcomes</Label>
            <ul className="list-disc list-inside space-y-1">
              {currentDraft.learning_outcomes.map((outcome, index) => (
                <li key={index} className="text-sm text-muted-foreground">{outcome}</li>
              ))}
            </ul>
          </div>

          {/* Delivery Modes */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Delivery Modes</Label>
            <div className="flex flex-wrap gap-2">
              {currentDraft.delivery_modes.map(mode => (
                <Badge key={mode} variant="secondary" className="capitalize">
                  {mode.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          {currentDraft.prerequisites && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Prerequisites</Label>
              <p className="text-sm text-muted-foreground">{currentDraft.prerequisites}</p>
            </div>
          )}

          <Separator />

          {/* Course Outline */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Course Outline</Label>
            <Accordion type="single" collapsible className="w-full">
              {currentDraft.outline.map((module, index) => (
                <AccordionItem key={index} value={`module-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Module {index + 1}</Badge>
                      <span className="font-medium">{module.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                    
                    {module.activities && module.activities.length > 0 && (
                      <div>
                        <Label className="text-xs font-semibold">Activities</Label>
                        <ul className="mt-2 space-y-1">
                          {module.activities.map((activity, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex gap-2">
                              <span className="font-medium capitalize">{activity.type}:</span>
                              <span>{activity.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {module.resources && module.resources.length > 0 && (
                      <div>
                        <Label className="text-xs font-semibold">Resources</Label>
                        <ul className="mt-2 space-y-1">
                          {module.resources.map((resource, i) => (
                            <li key={i} className="text-sm">
                              <Badge variant="outline" className="text-xs mr-2">{resource.type}</Badge>
                              {resource.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>
      </Card>

      {/* AI Refinement */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-500" />
            Refine With AI
          </CardTitle>
          <CardDescription>
            Tell AI how to improve this draft. Be specific about what you want to change.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Examples:&#10;• Make it a 4-week program instead of 8&#10;• Add a module about marketing strategies&#10;• Make this more beginner-friendly&#10;• Expand the section on advanced topics&#10;• Add more practical exercises"
            value={refinementInstructions}
            onChange={(e) => setRefinementInstructions(e.target.value)}
            rows={4}
          />
          
          <Button
            onClick={handleRefine}
            disabled={isRefining || !refinementInstructions.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {isRefining ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Refining...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Refine Draft
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
