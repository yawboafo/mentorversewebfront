'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
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
import { modulesApi } from '@/lib/api/modules';
import { usePurchaseStatus } from '@/hooks/use-purchase-status';
import { learningApi, CourseProgress } from '@/lib/api/learning';
import { Content, ContentModule, ContentResource } from '@/lib/api/types';
import { Progress } from '@/components/ui/progress';

interface ContentModuleWithResources extends ContentModule {
  resources?: ContentResource[];
}
import {
  BookOpen,
  Clock,
  Users,
  Award,
  CheckCircle2,
  Star,
  Video,
  Target,
  Sparkles,
  UserCheck,
  Play,
  GraduationCap,
  BarChart3,
  ArrowRight,
  Shield,
  Zap,
  Heart,
  TrendingUp,
  Lock,
  MessageCircle,
  LayoutList,
  FileText,
  Eye,
  X,
  Image as ImageIcon,
  File,
  Link as LinkIcon,
  Music,
  Download,
  ShoppingCart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PriceDisplay } from '@/components/ui/price-display';

export default function CourseDetailPage() {
  const params = useParams();
  const contentId = params.id as string;
  const { isPurchased, loading: checkingPurchase, purchase } = usePurchaseStatus(contentId);
  
  const [content, setContent] = useState<Content | null>(null);
  const [modules, setModules] = useState<ContentModuleWithResources[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewResource, setPreviewResource] = useState<any>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-primary" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-accent" />;
      case 'document':
        return <FileText className="h-4 w-4 text-secondary" />;
      case 'link':
        return <LinkIcon className="h-4 w-4 text-blue-500" />;
      case 'audio':
        return <Music className="h-4 w-4 text-purple-500" />;
      case 'file':
        return <File className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentData, structureData] = await Promise.all([
          contentApi.getContentById(contentId),
          modulesApi.getContentStructure(contentId).catch(() => ({ data: { modules: [] } }))
        ]);
        
        setContent(contentData);
        // Handle wrapped response
        const structure = (structureData as any).data || structureData;
        setModules(structure.modules || []);
      } catch (error) {
        console.error('Failed to fetch content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [contentId]);

  // Fetch progress for purchased courses
  useEffect(() => {
    const fetchProgress = async () => {
      if (isPurchased && !checkingPurchase) {
        setLoadingProgress(true);
        try {
          const progress = await learningApi.getCourseProgress(contentId);
          setCourseProgress(progress);
        } catch (error) {
          console.error('Failed to fetch progress:', error);
        } finally {
          setLoadingProgress(false);
        }
      }
    };

    fetchProgress();
  }, [contentId, isPurchased, checkingPurchase]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || checkingPurchase) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-64 w-full mb-8 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-2xl sticky top-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <BookOpen className="h-20 w-20 text-muted-foreground mx-auto mb-6 opacity-40" />
          <h2 className="text-3xl font-bold mb-3 text-foreground">Course not found</h2>
          <p className="text-muted-foreground mb-8 text-lg">This course may have been removed or doesn't exist.</p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8">
            <Link href="/content">Explore All Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ===== PREMIUM HERO SECTION ===== */}
      <div className="border-b border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* LEFT: Course Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Level & Type Badges */}
              <div className="flex flex-wrap gap-3">
                {content.level && (
                  <Badge className="px-4 py-1.5 text-sm font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                    {content.level}
                  </Badge>
                )}
                <Badge className="px-4 py-1.5 text-sm font-semibold bg-accent/10 text-accent border border-accent/20">
                  {content.contentType === 'course' ? 'Course' : 'Framework'}
                </Badge>
              </div>

              {/* Course Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                {content.title}
              </h1>

              {/* Learning Promise - One Liner */}
              <p className="text-xl text-muted-foreground leading-relaxed">
                {content.description.split('\n')[0] || "Learn practical skills from real leaders."}
              </p>

              {/* Mentor Identity */}
              <Link 
                href={`/mentors/${content.mentor.id}`}
                className="inline-flex items-center gap-4 p-4 rounded-2xl bg-card hover:bg-accent/5 transition-all border border-border hover:border-primary/30 group"
              >
                <Avatar className="h-16 w-16 ring-2 ring-border group-hover:ring-primary/40 transition-all">
                  <AvatarImage 
                    src={content.mentor.avatarUrl || undefined} 
                    alt={content.mentor.fullName}
                  />
                  <AvatarFallback className="bg-primary/20 text-primary text-lg font-semibold">
                    {getInitials(content.mentor.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium mb-1">Taught by</p>
                  <p className="font-bold text-foreground text-lg">{content.mentor.fullName}</p>
                  <p className="text-sm text-muted-foreground">View Mentor Profile →</p>
                </div>
              </Link>
            </motion.div>

            {/* RIGHT: Course Visual Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20">
                {content.mediaType === 'video' && content.mediaUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-foreground/90 via-foreground/85 to-foreground/90 backdrop-blur-sm">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-4 text-background"
                    >
                      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-background/20 backdrop-blur-md border-4 border-background/30">
                        <Play className="h-10 w-10 fill-background ml-1" />
                      </div>
                      <p className="text-sm font-semibold">Preview Course</p>
                    </motion.button>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <GraduationCap className="h-32 w-32 text-primary/20" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT SECTION ===== */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT COLUMN: Course Details */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* KEY COURSE FACTS - Highlight Pills */}
            <section>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {content.estimatedDuration && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="border border-border/50 shadow-soft hover:shadow-soft-lg transition-all">
                      <CardContent className="p-6 text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Duration</p>
                          <p className="text-lg font-bold text-foreground mt-1">{content.estimatedDuration}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border border-border/50 shadow-soft hover:shadow-soft-lg transition-all">
                    <CardContent className="p-6 text-center space-y-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10">
                        <Award className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Level</p>
                        <p className="text-lg font-bold text-foreground mt-1">{content.level || 'All Levels'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {modules && modules.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="border border-border/50 shadow-soft hover:shadow-soft-lg transition-all">
                      <CardContent className="p-6 text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10">
                          <LayoutList className="h-6 w-6 text-secondary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Modules</p>
                          <p className="text-lg font-bold text-foreground mt-1">{modules.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {content.deliveryModes && content.deliveryModes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="border border-border/50 shadow-soft hover:shadow-soft-lg transition-all">
                      <CardContent className="p-6 text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Format</p>
                          <p className="text-sm font-bold text-foreground mt-1 capitalize">
                            {content.deliveryModes[0].replace('_', ' ')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </section>

            {/* WHAT YOU WILL LEARN */}
            {content.learningOutcomes && content.learningOutcomes.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  What You Will Learn
                </h2>
                <Card className="border border-border/50 shadow-soft-lg">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {content.learningOutcomes.map((outcome, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-3 p-4 rounded-xl hover:bg-accent/5 transition-colors group"
                        >
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-foreground leading-relaxed">{outcome}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* COURSE DESCRIPTION */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                About This Course
              </h2>
              <Card className="border border-border/50 shadow-soft">
                <CardContent className="p-8">
                  <p className="text-lg text-foreground leading-[1.8] whitespace-pre-line">
                    {content.description}
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* MODULE BREAKDOWN - Premium Accordion */}
            {modules && modules.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/10">
                    <GraduationCap className="h-6 w-6 text-secondary" />
                  </div>
                  Course Curriculum
                </h2>
                <Card className="border border-border/50 shadow-soft-lg overflow-hidden">
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {modules.map((module, index) => (
                        <AccordionItem 
                          key={module.id} 
                          value={`module-${index}`}
                          className="border-b border-border/50 last:border-0"
                        >
                          <AccordionTrigger className="px-8 py-6 hover:bg-accent/5 hover:no-underline transition-colors">
                            <div className="flex items-center gap-4 w-full text-left">
                              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <span className="font-semibold text-lg text-foreground">
                                  {module.title || `Module ${index + 1}`}
                                </span>
                                {module.resources && module.resources.length > 0 && (
                                  <Badge variant="secondary" className="ml-3">
                                    {module.resources.length} {module.resources.length === 1 ? 'resource' : 'resources'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-8 pb-8 pt-4">
                            <div className="space-y-6 pl-14">
                              {module.description && (
                                <p className="text-foreground/80 leading-relaxed text-base">
                                  {module.description}
                                </p>
                              )}
                              
                              {module.resources && module.resources.length > 0 && (
                                <div>
                                  <p className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Resources</p>
                                  <ul className="space-y-3">
                                    {module.resources.map((resource) => (
                                      <li key={resource.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                          <div className="flex-shrink-0">
                                            {getResourceIcon(resource.resourceType)}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">
                                              {resource.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                              <span className="capitalize">{resource.resourceType}</span>
                                              {resource.duration && (
                                                <>
                                                  <span>•</span>
                                                  <span>{formatDuration(resource.duration)}</span>
                                                </>
                                              )}
                                              {resource.fileSize && (
                                                <>
                                                  <span>•</span>
                                                  <span>{formatFileSize(resource.fileSize)}</span>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          {resource.isPreview ? (
                                            <>
                                              <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                                                <Eye className="h-3 w-3 mr-1" />
                                                Free Preview
                                              </Badge>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setPreviewResource(resource)}
                                                className="gap-2"
                                              >
                                                <Eye className="h-4 w-4" />
                                                Preview
                                              </Button>
                                            </>
                                          ) : (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                              <Lock className="h-4 w-4" />
                                              <span className="text-sm">Locked</span>
                                            </div>
                                          )}
                                        </div>
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
              </section>
            )}

            {/* WHO THIS IS FOR */}
            {content.targetAudience && (
              <section>
                <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  Who This Is For
                </h2>
                <Card className="border border-border/50 shadow-soft bg-gradient-to-br from-accent/5 to-primary/5">
                  <CardContent className="p-8">
                    <p className="text-lg text-foreground leading-relaxed">
                      {content.targetAudience}
                    </p>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* MENTOR ATTRIBUTION */}
            <section>
              <Card className="border-2 border-primary/20 shadow-soft-lg bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-foreground">About Your Mentor</h3>
                  <Link href={`/mentors/${content.mentor.id}`} className="group">
                    <div className="flex items-start gap-6">
                      <Avatar className="h-20 w-20 ring-2 ring-border group-hover:ring-primary/40 transition-all flex-shrink-0">
                        <AvatarImage 
                          src={content.mentor.avatarUrl || undefined} 
                          alt={content.mentor.fullName}
                        />
                        <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                          {getInitials(content.mentor.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                          {content.mentor.fullName}
                        </h4>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          Expert mentor with proven experience in helping others achieve their goals through structured learning and guidance.
                        </p>
                        <div className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                          View full profile
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* RIGHT COLUMN: Sticky Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="border-2 border-primary/30 shadow-2xl overflow-hidden">
                {/* Accent Bar */}
                <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary" />
                
                <CardContent className="p-8 space-y-6">
                  {/* Price */}
                  <div className="text-center py-6">
                    <p className="text-xs text-muted-foreground font-semibold mb-4 uppercase tracking-widest">Investment</p>
                    <div className="flex items-center justify-center mb-3">
                      <PriceDisplay
                        price={content.display_price || content.price}
                        currency={content.display_currency || content.currency || 'USD'}
                        className="text-5xl font-bold text-foreground"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">One-time payment</p>
                  </div>

                  <Separator />

                  {/* Primary CTA - Dynamic based on enrollment */}
                  {checkingPurchase ? (
                    <Button 
                      size="lg" 
                      className="w-full h-14 rounded-xl"
                      disabled
                    >
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Checking status...
                    </Button>
                  ) : isPurchased ? (
                    <div className="space-y-4">
                      {/* Enrollment Badge */}
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-green-600">
                          You're enrolled in this course
                        </span>
                      </div>

                      {/* Progress Section */}
                      {courseProgress && courseProgress.progressPercent > 0 && (
                        <div className="space-y-3 p-4 rounded-xl bg-muted/50 border">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Your Progress</span>
                            <span className="text-muted-foreground">{courseProgress.progressPercent}% complete</span>
                          </div>
                          <Progress value={courseProgress.progressPercent} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{courseProgress.completedModules} of {courseProgress.totalModules} modules</span>
                            <span>{courseProgress.timeSpentMinutes} min spent</span>
                          </div>
                        </div>
                      )}

                      {/* Primary CTA */}
                      <Button 
                        size="lg" 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold h-14 rounded-xl shadow-lg hover:shadow-xl transition-all"
                        asChild
                      >
                        <Link href={`/dashboard`}>
                          <Play className="h-5 w-5 mr-2" />
                          {courseProgress && courseProgress.progressPercent > 0 ? 'Continue Learning' : 'Start Course'}
                        </Link>
                      </Button>

                      {/* Milestone Celebration (if applicable) */}
                      {courseProgress && courseProgress.progressPercent === 25 && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                          <p className="text-sm font-medium text-amber-700 dark:text-amber-500">
                            🎉 You're 1/4 done! Keep going!
                          </p>
                        </div>
                      )}
                      {courseProgress && courseProgress.progressPercent === 50 && (
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-500">
                            🚀 Halfway there! You're doing great!
                          </p>
                        </div>
                      )}
                      {courseProgress && courseProgress.progressPercent === 75 && (
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-500">
                            💪 Almost done! Just one more push!
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <a 
                      href={`/content/${contentId}/checkout`}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold h-14 px-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Enroll Now
                    </a>
                  )}

                  {/* Secondary CTA */}
                  <Link 
                    href={`/mentors/${content.mentor.id}`}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold h-12 px-6 w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <UserCheck className="h-5 w-5 mr-2" />
                    View Mentor Profile
                  </Link>

                  <Separator />

                  {/* What's Included */}
                  <div className="space-y-4">
                    <p className="font-bold text-foreground">What's Included:</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <span>Lifetime access to materials</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <span>Direct mentor support</span>
                      </div>
                      {content.deliveryModes?.includes('self_paced') && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          </div>
                          <span>Learn at your own pace</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Trust Badges */}
                  <div className="space-y-3 text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>30-day money-back guarantee</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <span>Secure payment</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* RESOURCE PREVIEW MODAL */}
      {previewResource && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewResource(null)}
        >
          <div 
            className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-foreground truncate">
                  {previewResource.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="capitalize">
                    {previewResource.resourceType}
                  </Badge>
                  {previewResource.duration && (
                    <span>{formatDuration(previewResource.duration)}</span>
                  )}
                  {previewResource.fileSize && (
                    <span>{formatFileSize(previewResource.fileSize)}</span>
                  )}
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    Free Preview
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewResource(null)}
                className="flex-shrink-0 ml-4"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              {previewResource.resourceType === 'video' && previewResource.url && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={previewResource.url}
                    controls
                    controlsList="nodownload"
                    className="w-full h-full"
                    autoPlay
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
              )}

              {previewResource.resourceType === 'image' && previewResource.url && (
                <div className="flex items-center justify-center bg-muted/50 rounded-lg min-h-[400px]">
                  <img
                    src={previewResource.url}
                    alt={previewResource.title}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                </div>
              )}

              {previewResource.resourceType === 'document' && previewResource.url && (
                <div className="h-[600px] bg-muted/50 rounded-lg overflow-hidden">
                  <iframe
                    src={`${previewResource.url}#toolbar=0`}
                    className="w-full h-full border-0"
                    title={previewResource.title}
                  />
                </div>
              )}

              {previewResource.resourceType === 'link' && previewResource.url && (
                <div className="text-center py-12">
                  <LinkIcon className="h-16 w-16 text-primary mx-auto mb-6" />
                  <p className="text-lg font-semibold mb-4 text-foreground">External Resource</p>
                  <p className="text-muted-foreground mb-6">
                    This resource links to external content
                  </p>
                  <Button asChild size="lg">
                    <a 
                      href={previewResource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <LinkIcon className="h-5 w-5" />
                      Open Link
                    </a>
                  </Button>
                </div>
              )}

              {['audio', 'file'].includes(previewResource.resourceType) && previewResource.url && (
                <div className="text-center py-12">
                  <File className="h-16 w-16 text-primary mx-auto mb-6" />
                  <p className="text-lg font-semibold mb-4 text-foreground">Downloadable Resource</p>
                  <p className="text-muted-foreground mb-6">
                    This resource is available as a file download
                  </p>
                  <Button asChild size="lg">
                    <a 
                      href={previewResource.url} 
                      download
                      className="gap-2"
                    >
                      <Download className="h-5 w-5" />
                      Download File
                    </a>
                  </Button>
                </div>
              )}

              {previewResource.description && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2 text-foreground">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {previewResource.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
