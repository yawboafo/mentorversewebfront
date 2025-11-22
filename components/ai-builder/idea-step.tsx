'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { aiApi } from '@/lib/api/ai';
import { CourseIdea } from '@/lib/api/types';
import { Sparkles, Loader2, Target, Users, Lightbulb, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface IdeaStepProps {
  onIdeaSelected: (idea: CourseIdea) => void;
}

export function IdeaStep({ onIdeaSelected }: IdeaStepProps) {
  const [prompt, setPrompt] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [focusInput, setFocusInput] = useState('');
  const [ideas, setIdeas] = useState<CourseIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddFocusArea = () => {
    if (focusInput.trim() && !focusAreas.includes(focusInput.trim())) {
      setFocusAreas([...focusAreas, focusInput.trim()]);
      setFocusInput('');
    }
  };

  const handleRemoveFocusArea = (area: string) => {
    setFocusAreas(focusAreas.filter(a => a !== area));
  };

  const handleGenerateIdeas = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what you want to teach');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await aiApi.generateContentIdeas({
        prompt: prompt.trim(),
        target_audience: targetAudience.trim() || undefined,
        focus_areas: focusAreas.length > 0 ? focusAreas : undefined,
      });

      setIdeas(response.ideas);
      
      if (response.ideas.length === 0) {
        toast.info('No ideas generated. Try refining your prompt.');
      } else {
        toast.success(`Generated ${response.ideas.length} course ideas!`);
      }
    } catch (error: any) {
      console.error('Failed to generate ideas:', error);
      toast.error(error.message || 'Failed to generate ideas');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            What do you want to teach?
          </CardTitle>
          <CardDescription>
            Tell us about your expertise and the course you'd like to create. Be as specific or general as you like.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Course Topic</Label>
            <Textarea
              id="prompt"
              placeholder="E.g., 'A comprehensive course on React hooks for intermediate developers' or 'A framework to help entrepreneurs validate their startup ideas'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Include details like skill level, specific topics, or the problems you'll solve
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience (Optional)</Label>
            <Input
              id="audience"
              placeholder="E.g., 'Junior developers', 'First-time founders', 'Marketing professionals'"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="focus">Focus Areas (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="focus"
                placeholder="Add a focus area or key topic"
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFocusArea();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddFocusArea}>
                Add
              </Button>
            </div>
            {focusAreas.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {focusAreas.map((area) => (
                  <Badge key={area} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveFocusArea(area)}>
                    {area}
                    <span className="ml-1">×</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleGenerateIdeas}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Course Ideas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Ideas */}
      {ideas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated Ideas</h3>
            <Button variant="outline" size="sm" onClick={handleGenerateIdeas} disabled={isGenerating}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map((idea, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onIdeaSelected(idea)}>
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                    {idea.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {idea.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {idea.target_audience && (
                    <div className="flex items-start gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{idea.target_audience}</span>
                    </div>
                  )}
                  
                  {idea.problem_it_solves && (
                    <div className="flex items-start gap-2 text-sm">
                      <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{idea.problem_it_solves}</span>
                    </div>
                  )}

                  {idea.key_topics && idea.key_topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {idea.key_topics.slice(0, 3).map((topic, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {idea.key_topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{idea.key_topics.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <Button className="w-full mt-4" variant="outline">
                    Use This Idea
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isGenerating && ideas.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No ideas yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Fill in the form above and click "Generate Course Ideas" to get AI-powered course suggestions tailored to your expertise.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
