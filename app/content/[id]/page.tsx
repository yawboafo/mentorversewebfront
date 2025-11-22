'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { contentApi } from '@/lib/api/content';
import { Content } from '@/lib/api/types';
import {
  BookOpen,
  Play,
  Clock,
  TrendingUp,
  Users,
  Award,
  CheckCircle2,
  ShoppingCart,
  Star,
  Globe,
  Video,
  FileText,
  Target,
  Lightbulb,
  MessageSquare,
} from 'lucide-react';

export default function ContentDetailPage() {
  const params = useParams();
  const contentId = params.id as string;
  
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await contentApi.getContentById(contentId);
        setContent(data);
      } catch (error) {
        console.error('Failed to fetch content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [contentId]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-96 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Content not found</h2>
        <Button asChild>
          <Link href="/content">Browse Content</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section with Cover Media */}
      <Card className="mb-8 overflow-hidden">
        <div className="relative">
          {/* Cover Image/Video */}
          <div className="relative h-96 bg-gradient-to-br from-orange-600 via-pink-600 to-purple-600">
            <div className="absolute inset-0 flex items-center justify-center">
              {content.mediaType === 'video' ? (
                <div className="text-center text-white">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-black/40 backdrop-blur-sm mb-4 hover:scale-110 transition-transform cursor-pointer">
                    <Play className="h-12 w-12 fill-white" />
                  </div>
                  <p className="text-sm opacity-80">Watch preview</p>
                  {content.mediaUrl && (
                    <p className="text-xs opacity-60 mt-1 px-4">{content.mediaUrl}</p>
                  )}
                </div>
              ) : (
                <div className="text-9xl opacity-30">
                  {content.contentType === 'course' ? '🎯' : '✨'}
                </div>
              )}
            </div>
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Type and Price badges */}
            <div className="absolute top-6 left-6 flex gap-2">
              <Badge className="bg-white/90 text-gray-900 hover:bg-white text-base px-4 py-1.5">
                {content.contentType}
              </Badge>
              {content.level && (
                <Badge variant="secondary" className="text-base px-4 py-1.5">
                  {content.level}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <CardContent className="p-8">
          {/* Title and Mentor */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
            
            <Link href={`/mentors/${content.mentor.id}`} className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={content.mentor.avatarUrl || undefined} 
                  alt={content.mentor.fullName}
                />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                  {getInitials(content.mentor.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">Created by</p>
                <p className="font-semibold text-orange-600">{content.mentor.fullName}</p>
              </div>
            </Link>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {content.estimatedDuration && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-semibold">{content.estimatedDuration}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Level</p>
                <p className="font-semibold">{content.level || 'All Levels'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-orange-500 fill-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Rating</p>
                <p className="font-semibold">5.0 (New)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Students</p>
                <p className="font-semibold">Join First!</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {content.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-sm">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                About This {content.contentType}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {content.description}
              </p>
            </CardContent>
          </Card>

          {/* What You'll Learn / Outcomes */}
          {content.learningOutcomes && content.learningOutcomes.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Target className="h-6 w-6 text-green-600" />
                  What You'll Learn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {content.learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{outcome}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Target Audience */}
          {content.targetAudience && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Who This Is For
                </h2>
                <p className="text-muted-foreground">{content.targetAudience}</p>
              </CardContent>
            </Card>
          )}

          {/* Problem Statement */}
          {content.problemItSolves && (
            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-orange-600" />
                  The Problem We're Solving
                </h2>
                <p className="text-muted-foreground">{content.problemItSolves}</p>
              </CardContent>
            </Card>
          )}

          {/* Course Outline */}
          {content.outline && content.outline.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  Course Outline
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {content.outline.map((module, index) => (
                    <AccordionItem key={index} value={`module-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="font-semibold">{module.title || `Module ${index + 1}`}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pl-4">
                          {module.description && (
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          )}
                          {module.activities && module.activities.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Activities:</p>
                              <ul className="space-y-1">
                                {module.activities.map((activity: any, actIdx: number) => (
                                  <li key={actIdx} className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Play className="h-3 w-3" />
                                    {activity}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {module.resources && module.resources.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Resources:</p>
                              <ul className="space-y-1">
                                {module.resources.map((resource: any, resIdx: number) => (
                                  <li key={resIdx} className="text-sm text-muted-foreground flex items-center gap-2">
                                    <FileText className="h-3 w-3" />
                                    {resource}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Support Model */}
          {content.supportModel && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  Support & Community
                </h2>
                <p className="text-muted-foreground">{content.supportModel}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Purchase Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8 border-2 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6 space-y-6">
              {/* Price */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  ${content.price}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{content.currency || 'USD'}</p>
              </div>

              <Separator />

              {/* CTA Button */}
              <Button size="lg" className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-lg py-6">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Enroll Now
              </Button>

              <Separator />

              {/* Delivery Modes */}
              {content.deliveryModes && content.deliveryModes.length > 0 && (
                <div>
                  <p className="font-semibold mb-3 flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Delivery Format
                  </p>
                  <div className="space-y-2">
                    {content.deliveryModes.map((mode) => (
                      <div key={mode} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="capitalize">{mode}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Includes */}
              <div>
                <p className="font-semibold mb-3">This includes:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Direct mentor support</span>
                  </div>
                  {content.deliveryModes?.includes('self_paced') && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Learn at your own pace</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Access Info */}
              <div className="text-center text-sm text-muted-foreground">
                <Globe className="h-4 w-4 mx-auto mb-2" />
                <p>Access from anywhere, anytime</p>
                <p className="text-xs mt-1">30-day money-back guarantee</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
