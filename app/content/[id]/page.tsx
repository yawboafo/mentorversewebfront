'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  Clock,
  TrendingUp,
  Users,
  Award,
  CheckCircle2,
  ShoppingCart,
  Star,
  Globe,
  Video,
  Target,
  Sparkles,
  UserCheck,
  Play,
  Lightbulb,
  GraduationCap,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PriceDisplay } from '@/components/ui/price-display';

export default function CourseDetailPage() {
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
      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Skeleton className="h-96 w-full mb-8 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
          <BookOpen className="h-20 w-20 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Course not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">This course may have been removed or doesn't exist.</p>
          <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
            <Link href="/content">Explore All Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      {/* Premium Hero Section */}
      <div className="bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50 dark:from-orange-950/40 dark:via-amber-950/20 dark:to-orange-900/40 border-b border-orange-200 dark:border-orange-900/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            {/* Left: Course Info */}
            <div className="lg:col-span-3 space-y-6">
              {/* Category & Level Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-orange-600 text-white px-4 py-1.5 text-sm font-semibold">
                  {content.contentType === 'course' ? '📚 Course' : '✨ Framework'}
                </Badge>
                {content.level && (
                  <Badge className="px-4 py-1.5 text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {content.level}
                  </Badge>
                )}
              </div>

              {/* Course Title */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight"
              >
                {content.title}
              </motion.h1>

              {/* Learning Promise */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-light"
              >
                {content.description.split('\n')[0]}
              </motion.p>

              {/* Mentor Mini Profile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link 
                  href={`/mentors/${content.mentor.id}`}
                  className="inline-flex items-center gap-4 p-4 rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-900 transition-all shadow-sm hover:shadow-md group"
                >
                  <Avatar className="h-14 w-14 ring-2 ring-orange-200 dark:ring-orange-800">
                    <AvatarImage 
                      src={content.mentor.avatarUrl || undefined} 
                      alt={content.mentor.fullName}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white text-lg">
                      {getInitials(content.mentor.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Created by</p>
                    <p className="font-bold text-orange-600 dark:text-orange-400 text-lg group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
                      {content.mentor.fullName}
                    </p>
                  </div>
                  <UserCheck className="h-5 w-5 text-orange-600 dark:text-orange-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            </div>

            {/* Right: Course Preview Media */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-orange-200 to-amber-300 dark:from-orange-900 to-amber-900">
                {content.mediaType === 'video' && content.mediaUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-600/90 to-amber-600/90 backdrop-blur-sm">
                    <div className="text-center text-white">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md mb-3 hover:bg-white/30 hover:scale-110 transition-all cursor-pointer border-4 border-white/40">
                        <Play className="h-10 w-10 fill-white ml-1" />
                      </div>
                      <p className="text-sm font-medium">Preview this course</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-8xl opacity-40">
                      {content.contentType === 'course' ? '🎯' : '✨'}
                    </div>
                  </div>
                )}
                
                {/* Subtle overlay pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.4),transparent_50%)]" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Course Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Learning Highlights */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Course Highlights</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {content.estimatedDuration && (
                  <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
                    <CardContent className="p-6 text-center">
                      <Clock className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</p>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{content.estimatedDuration}</p>
                    </CardContent>
                  </Card>
                )}
                
                <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
                  <CardContent className="p-6 text-center">
                    <Award className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Skill Level</p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{content.level || 'All Levels'}</p>
                  </CardContent>
                </Card>

                {content.deliveryModes && content.deliveryModes.length > 0 && (
                  <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
                    <CardContent className="p-6 text-center">
                      <Video className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Format</p>
                      <p className="font-bold text-gray-900 dark:text-gray-100 capitalize text-xs">
                        {content.deliveryModes[0].replace('_', '-')}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {content.outline && content.outline.length > 0 && (
                  <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900">
                    <CardContent className="p-6 text-center">
                      <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Modules</p>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{content.outline.length}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            {/* What You'll Learn */}
            {content.learningOutcomes && content.learningOutcomes.length > 0 && (
              <Card className="border-0 shadow-md bg-white dark:bg-zinc-900">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    What You'll Learn
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {content.learningOutcomes.map((outcome, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{outcome}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Description */}
            <Card className="border-0 shadow-md bg-white dark:bg-zinc-900">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  About This Course
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                  {content.description}
                </p>
              </CardContent>
            </Card>

            {/* Course Curriculum */}
            {content.outline && content.outline.length > 0 && (
              <Card className="border-0 shadow-md bg-white dark:bg-zinc-900">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    Course Curriculum
                  </h2>
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {content.outline.map((module, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`module-${index}`}
                        className="border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden"
                      >
                        <AccordionTrigger className="text-left px-6 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:no-underline">
                          <div className="flex items-center gap-4 w-full">
                            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {module.title || `Module ${index + 1}`}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-4 bg-gray-50 dark:bg-zinc-900/50">
                          <div className="space-y-4">
                            {module.description && (
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {module.description}
                              </p>
                            )}
                            {module.activities && module.activities.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Learning Activities:</p>
                                <ul className="space-y-2">
                                  {module.activities.map((activity: any, actIdx: number) => (
                                    <li key={actIdx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                      <Play className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                      {activity}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {module.resources && module.resources.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Resources Included:</p>
                                <ul className="space-y-2">
                                  {module.resources.map((resource: any, resIdx: number) => (
                                    <li key={resIdx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                      <BookOpen className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
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

            {/* Who This Is For */}
            {content.targetAudience && (
              <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    Who This Is For
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    {content.targetAudience}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Problem Statement */}
            {content.problemItSolves && (
              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    The Challenge We Address
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    {content.problemItSolves}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Mentor Attribution Card */}
            <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-lg bg-white dark:bg-zinc-900">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">About Your Mentor</h2>
                <Link href={`/mentors/${content.mentor.id}`} className="group">
                  <div className="flex items-start gap-6">
                    <Avatar className="h-20 w-20 ring-4 ring-orange-200 dark:ring-orange-800 group-hover:ring-orange-300 dark:group-hover:ring-orange-700 transition-all">
                      <AvatarImage 
                        src={content.mentor.avatarUrl || undefined} 
                        alt={content.mentor.fullName}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white text-2xl">
                        {getInitials(content.mentor.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {content.mentor.fullName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        Expert mentor with proven experience in helping others achieve their goals through structured learning and guidance.
                      </p>
                      <div className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold group-hover:gap-3 transition-all">
                        View full profile
                        <UserCheck className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right: Enrollment Card (Sticky) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-2 border-orange-300 dark:border-orange-700 shadow-2xl overflow-hidden bg-white dark:bg-zinc-900">
              {/* Accent Top Bar */}
              <div className="h-2 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600" />
              
              <CardContent className="p-8 space-y-6">
                {/* Price */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Investment</p>
                  <PriceDisplay 
                    price={content.display_price || content.price}
                    currency={content.display_currency || content.currency || 'USD'}
                    basePrice={content.base_price}
                    baseCurrency={content.base_currency}
                    size="xl"
                    showOriginal={true}
                  />
                </div>

                <Separator className="bg-gray-200 dark:bg-zinc-800" />

                {/* Primary CTA */}
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-lg py-7 shadow-lg hover:shadow-xl transition-all font-semibold"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Start Learning
                </Button>

                {/* Secondary CTA */}
                <Button 
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-base py-6 font-semibold"
                  asChild
                >
                  <Link href={`/mentors/${content.mentor.id}`}>
                    <UserCheck className="h-5 w-5 mr-2" />
                    View Mentor Profile
                  </Link>
                </Button>

                <Separator className="bg-gray-200 dark:bg-zinc-800" />

                {/* What's Included */}
                <div>
                  <p className="font-bold mb-4 text-gray-900 dark:text-gray-100">What's Included:</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>Lifetime access to all materials</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>Direct mentor support</span>
                    </div>
                    {content.deliveryModes?.includes('self_paced') && (
                      <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span>Learn at your own pace</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-gray-200 dark:bg-zinc-800" />

                {/* Trust Badges */}
                <div className="space-y-3 text-center text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Access from anywhere</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                    <span>Premium quality content</span>
                  </div>
                  <p className="text-xs mt-3 text-gray-500 dark:text-gray-500">
                    30-day money-back guarantee
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
