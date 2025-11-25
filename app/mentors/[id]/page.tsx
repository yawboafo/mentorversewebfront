'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { mentorsApi } from '@/lib/api/mentors';
import { contentApi } from '@/lib/api/content';
import { mentorSubscriptionsApi } from '@/lib/api/mentor-subscriptions';
import { Mentor, Content, MentorSettings, MentorAccessStatus, MentorAccessType } from '@/lib/api/types';
import { 
  User, Globe, Briefcase, MapPin, MessageSquare, Award, Calendar,
  Check, UserPlus, Loader2, Star, TrendingUp, Users, BookOpen,
  Video, Heart, Sparkles, Quote, Target, GraduationCap, CheckCircle2,
  Zap, Trophy, Clock, BarChart3, MessageCircle, Crown, Lock, Play,
  ArrowRight, CheckCircle, Rocket, Shield, Lightbulb
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { BookAppointmentModal } from '@/components/book-appointment-modal';
import { CourseLearningCard } from '@/components/course-learning-card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { MentorTypeBadge, SubscriptionStatusBadge } from '@/components/mentors/mentor-badges';
import { PriceDisplay } from '@/components/mentors/price-display';

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const mentorId = params.id as string;
  
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');
  
  // Paid subscription state
  const [mentorSettings, setMentorSettings] = useState<MentorSettings | null>(null);
  const [accessStatus, setAccessStatus] = useState<MentorAccessStatus | null>(null);
  const [isLoadingSubscriptionData, setIsLoadingSubscriptionData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mentorData, contentResponse] = await Promise.all([
          mentorsApi.getMentor(mentorId),
          contentApi.getContent({ mentor_id: mentorId }),
        ]);
        setMentor(mentorData);
        setContent(contentResponse.data.filter(c => c.status === 'published'));
      } catch (error: any) {
        console.error('Failed to fetch mentor:', error);
        if (error.status === 404) {
          toast.error('Mentor Not Found');
        }
        setMentor(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mentorId]);

  // Fetch paid subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!mentorId) return;

      try {
        setIsLoadingSubscriptionData(true);
        
        const settingsResponse = await mentorSubscriptionsApi.getPublicMentorSettings(mentorId);
        setMentorSettings(settingsResponse.data);

        if (user && user.id !== mentorId) {
          const accessResponse = await mentorSubscriptionsApi.checkMentorAccess(mentorId);
          setAccessStatus(accessResponse.data);
        }
      } catch (error: any) {
        console.error('Failed to fetch subscription data:', error);
        setMentorSettings(null);
        setAccessStatus(null);
      } finally {
        setIsLoadingSubscriptionData(false);
      }
    };

    fetchSubscriptionData();
  }, [mentorId, user]);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || !mentorId || user.id === mentorId) return;

      try {
        setIsCheckingSubscription(true);
        const status = await mentorsApi.checkSubscriptionStatus(mentorId);
        setIsSubscribed(status.is_subscribed);
      } catch (error) {
        setIsSubscribed(false);
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [user, mentorId]);

  const handleSubscriptionSuccess = async () => {
    try {
      const [settingsResponse, accessResponse] = await Promise.all([
        mentorSubscriptionsApi.getPublicMentorSettings(mentorId),
        user ? mentorSubscriptionsApi.checkMentorAccess(mentorId) : Promise.resolve(null),
      ]);
      setMentorSettings(settingsResponse.data);
      if (accessResponse) setAccessStatus(accessResponse.data);
      setIsSubscribed(true);
    } catch (error) {
      console.error('Failed to refresh subscription data:', error);
    }
  };

  const handleMessageClick = () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/mentors/${mentorId}`)}`);
      return;
    }

    if (accessStatus && !accessStatus.canMessage) {
      setSubscriptionMessage(
        accessStatus.messagingDeniedReason || 'Subscribe to message this mentor'
      );
      setShowSubscriptionDialog(true);
      return;
    }

    router.push(`/messages/${mentorId}`);
  };

  const handleBookAppointmentClick = () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/mentors/${mentorId}`)}`);
      return;
    }

    if (accessStatus && !accessStatus.canBookAppointment) {
      setSubscriptionMessage(
        accessStatus.appointmentDeniedReason || 'Subscribe to book appointments with this mentor'
      );
      setShowSubscriptionDialog(true);
      return;
    }

    setShowAppointmentModal(true);
  };

  const handleSubscribe = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/mentors/${mentorId}`)}`);
      return;
    }

    try {
      setIsSubscribing(true);
      await mentorsApi.subscribeMentor(mentorId);
      await handleSubscriptionSuccess();
      toast.success(`You're now subscribed to ${mentor?.user.fullName}!`);
    } catch (error: any) {
      if (error.status === 400 && error.message?.toLowerCase().includes('already subscribed')) {
        setIsSubscribed(true);
      } else {
        toast.error('Failed to subscribe');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const handlePaidSubscribe = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/mentors/${mentorId}`)}`);
      return;
    }

    try {
      setIsSubscribing(true);
      const response = await mentorSubscriptionsApi.subscribeToPaidMentor(mentorId);
      
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        await handleSubscriptionSuccess();
        toast.success('Subscription activated!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to subscribe');
    } finally {
      setIsSubscribing(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Determine mentor's offerings based on settings
  const mentorOfferings = mentorSettings ? [
    mentorSettings.allowsMessaging && { icon: MessageCircle, label: 'Direct Messaging', description: 'Get personalized guidance' },
    mentorSettings.offers1to1Sessions && { icon: Video, label: '1:1 Video Sessions', description: 'Private mentorship calls' },
    mentorSettings.offersGroupSessions && { icon: Users, label: 'Group Sessions', description: 'Learn with peers' },
    mentorSettings.offersCourses && content.length > 0 && { icon: BookOpen, label: 'Exclusive Courses', description: 'Premium learning content' },
  ].filter(Boolean) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-96 w-full mb-8 rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <User className="h-20 w-20 text-muted-foreground mx-auto mb-6 opacity-40" />
          <h2 className="text-3xl font-bold mb-3">Mentor not found</h2>
          <p className="text-muted-foreground mb-8">This mentor profile may have been removed.</p>
          <Button asChild size="lg">
            <Link href="/mentors">Browse All Mentors</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === mentorId;
  const isPaidMentor = mentorSettings?.accessType === MentorAccessType.PAID;
  const isVIPMentor = mentorSettings?.accessType === MentorAccessType.VIP;
  const hasSubscriptionAccess = accessStatus?.isSubscribed || isSubscribed;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
      
      {/* ========================================= */}
      {/* HERO SECTION - THE HUMAN */}
      {/* ========================================= */}
      <section className="relative overflow-hidden border-b border-border/40">
        {/* Subtle Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary),0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(var(--accent),0.06),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            
            {/* LEFT: Mentor Photo (2 cols) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-2 flex flex-col items-center lg:items-start"
            >
              <div className="relative mb-6">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-full blur-2xl" />
                <Avatar className="relative h-64 w-64 border-4 border-background shadow-2xl ring-4 ring-primary/10">
                  <AvatarImage 
                    src={mentor.profileImageUrl || mentor.user?.avatarUrl || undefined}
                    alt={mentor.user?.fullName || mentor.headline}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-7xl font-bold bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                    {getInitials(mentor.user?.fullName || mentor.headline)}
                  </AvatarFallback>
                </Avatar>
                
                {mentor.isVerified && (
                  <div className="absolute -bottom-3 -right-3 bg-primary p-4 rounded-full shadow-xl ring-4 ring-background">
                    <Award className="h-8 w-8 text-primary-foreground fill-current" />
                  </div>
                )}
              </div>

              {/* Access Type Badge */}
              {mentorSettings && (
                <div className="mb-4">
                  <MentorTypeBadge accessType={mentorSettings.accessType} size="lg" />
                </div>
              )}

              {/* Social Proof Stats - Mobile */}
              <div className="lg:hidden grid grid-cols-3 gap-4 w-full max-w-sm mt-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">{mentor.experienceYears}+</p>
                  <p className="text-xs text-muted-foreground mt-1">Years</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">{content.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Courses</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">500+</p>
                  <p className="text-xs text-muted-foreground mt-1">Mentees</p>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Mentor Info (3 cols) */}
            <div className="lg:col-span-3 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-6"
              >
                {/* Name & Title */}
                <div>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight mb-4">
                    {mentor.user?.fullName || 'Mentor'}
                  </h1>
                  
                  <p className="text-2xl sm:text-3xl text-primary font-semibold mb-6">
                    {mentor.headline}
                  </p>

                  {/* Mission Statement */}
                  <div className="relative pl-6 border-l-4 border-primary/30">
                    <Quote className="absolute -left-2 -top-1 h-8 w-8 text-primary/20" />
                    <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                      {mentor.bio || "Helping ambitious individuals unlock their full potential through personalized guidance, proven strategies, and transformative mentorship experiences."}
                    </p>
                  </div>
                </div>

                {/* Key Highlights - Desktop */}
                <div className="hidden lg:grid grid-cols-3 gap-6">
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-4xl font-bold text-foreground mb-1">{mentor.experienceYears}+</p>
                      <p className="text-sm text-muted-foreground">Years Experience</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-3">
                        <BookOpen className="h-6 w-6 text-accent" />
                      </div>
                      <p className="text-4xl font-bold text-foreground mb-1">{content.length}</p>
                      <p className="text-sm text-muted-foreground">Courses Created</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 mb-3">
                        <Users className="h-6 w-6 text-secondary" />
                      </div>
                      <p className="text-4xl font-bold text-foreground mb-1">500+</p>
                      <p className="text-sm text-muted-foreground">Mentees Guided</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Primary CTAs */}
                {!isOwnProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-wrap gap-4"
                  >
                    {hasSubscriptionAccess ? (
                      <>
                        <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Subscribed
                        </Badge>
                        {accessStatus?.canMessage && (
                          <Button 
                            size="lg" 
                            onClick={handleMessageClick}
                            className="h-12 px-8 bg-primary hover:bg-primary/90"
                          >
                            <MessageCircle className="h-5 w-5 mr-2" />
                            Send Message
                          </Button>
                        )}
                        {accessStatus?.canBookAppointment && (
                          <Button 
                            size="lg" 
                            variant="outline"
                            onClick={handleBookAppointmentClick}
                            className="h-12 px-8"
                          >
                            <Calendar className="h-5 w-5 mr-2" />
                            Book Session
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        <Button 
                          size="lg" 
                          onClick={isPaidMentor || isVIPMentor ? handlePaidSubscribe : handleSubscribe}
                          disabled={isSubscribing}
                          className="h-12 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        >
                          {isSubscribing ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              {isPaidMentor || isVIPMentor ? <Crown className="h-5 w-5 mr-2" /> : <Heart className="h-5 w-5 mr-2" />}
                              {isPaidMentor || isVIPMentor ? 'Subscribe Now' : 'Subscribe Free'}
                            </>
                          )}
                        </Button>
                        <Button 
                          size="lg" 
                          variant="outline"
                          onClick={handleMessageClick}
                          className="h-12 px-8"
                        >
                          <MessageCircle className="h-5 w-5 mr-2" />
                          Message
                        </Button>
                      </>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* WORK WITH ME - Subscription & Benefits */}
      {/* ========================================= */}
      {!isOwnProfile && mentorSettings && (
        <section className="border-b border-border/40 bg-gradient-to-b from-muted/20 to-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                  Work with {mentor.user?.fullName?.split(' ')[0] || 'Me'}
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {isPaidMentor ? 'Premium mentorship with exclusive access' : isVIPMentor ? 'Elite advisory for select clients' : 'Free access to guidance and support'}
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                
                {/* LEFT: Benefits List (2 cols) */}
                <div className="lg:col-span-2">
                  <Card className="border-2 border-border/50 shadow-xl bg-card/80 backdrop-blur-sm h-full">
                    <CardHeader className="space-y-4 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
                          <Sparkles className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">What You'll Get</CardTitle>
                          <CardDescription className="text-base">
                            Everything included in your subscription
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mentorOfferings.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-6">
                          {mentorOfferings.map((offering: any, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.4, delay: index * 0.1 }}
                              className="flex gap-4 items-start"
                            >
                              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <offering.icon className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground mb-1">{offering.label}</p>
                                <p className="text-sm text-muted-foreground">{offering.description}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <p className="text-muted-foreground">Offerings will be displayed here</p>
                        </div>
                      )}

                      {mentorSettings.allowsMessaging && mentorSettings.messageLimitPerPeriod && (
                        <div className="mt-6 pt-6 border-t border-border/50">
                          <p className="text-sm text-muted-foreground">
                            <Shield className="h-4 w-4 inline mr-2" />
                            Up to {mentorSettings.messageLimitPerPeriod} messages per {mentorSettings.billingPeriod}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* RIGHT: Pricing Card (1 col) */}
                <div className="lg:col-span-1">
                  <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm sticky top-24">
                    <CardContent className="p-8 space-y-6">
                      {/* Access Type */}
                      <div className="text-center">
                        {mentorSettings.accessType === MentorAccessType.OPEN && (
                          <>
                            <Badge className="mb-4 text-base px-4 py-2 bg-green-500/10 text-green-700 dark:text-green-400">
                              Free Access
                            </Badge>
                            <p className="text-5xl font-bold text-foreground mb-2">Free</p>
                            <p className="text-muted-foreground">Open mentorship</p>
                          </>
                        )}
                        
                        {mentorSettings.accessType === MentorAccessType.PAID && (
                          <>
                            <Badge className="mb-4 text-base px-4 py-2 bg-primary/10 text-primary">
                              <Crown className="h-4 w-4 mr-1" />
                              Premium Access
                            </Badge>
                            {mentorSettings.baseSubscriptionPrice && (
                              <div className="mb-2">
                                <PriceDisplay 
                                  price={mentorSettings.baseSubscriptionPrice}
                                  currency={mentorSettings.currency}
                                  period={mentorSettings.billingPeriod}
                                  size="lg"
                                />
                              </div>
                            )}
                            <p className="text-muted-foreground">Billed {mentorSettings.billingPeriod}</p>
                          </>
                        )}

                        {mentorSettings.accessType === MentorAccessType.VIP && (
                          <>
                            <Badge className="mb-4 text-base px-4 py-2 bg-purple-500/10 text-purple-700 dark:text-purple-400">
                              <Crown className="h-4 w-4 mr-1" />
                              VIP Access
                            </Badge>
                            {mentorSettings.baseSubscriptionPrice && (
                              <div className="mb-2">
                                <PriceDisplay 
                                  price={mentorSettings.baseSubscriptionPrice}
                                  currency={mentorSettings.currency}
                                  period={mentorSettings.billingPeriod}
                                  size="lg"
                                />
                              </div>
                            )}
                            <p className="text-muted-foreground">Elite advisory</p>
                          </>
                        )}
                      </div>

                      <Separator />

                      {/* CTA Button */}
                      {!hasSubscriptionAccess ? (
                        <Button 
                          size="lg" 
                          onClick={isPaidMentor || isVIPMentor ? handlePaidSubscribe : handleSubscribe}
                          disabled={isSubscribing}
                          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                        >
                          {isSubscribing ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              {isPaidMentor || isVIPMentor ? 'Subscribe Now' : 'Subscribe Free'}
                              <ArrowRight className="h-5 w-5 ml-2" />
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                            <CheckCircle className="h-5 w-5" />
                            <span>You're Subscribed</span>
                          </div>
                          {accessStatus?.canMessage && (
                            <Button 
                              size="lg" 
                              onClick={handleMessageClick}
                              className="w-full h-12"
                            >
                              <MessageCircle className="h-5 w-5 mr-2" />
                              Send Message
                            </Button>
                          )}
                          {accessStatus?.canBookAppointment && (
                            <Button 
                              size="lg" 
                              variant="outline"
                              onClick={handleBookAppointmentClick}
                              className="w-full h-12"
                            >
                              <Calendar className="h-5 w-5 mr-2" />
                              Book Session
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Trust Signals */}
                      <div className="pt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Cancel anytime</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span>Secure payment</span>
                        </div>
                        {mentor.isVerified && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Award className="h-4 w-4 text-primary" />
                            <span>Verified mentor</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ========================================= */}
      {/* COURSES - Learn with this Mentor */}
      {/* ========================================= */}
      {content.length > 0 && mentorSettings?.offersCourses && (
        <section className="border-b border-border/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
                    Learn with {mentor.user?.fullName?.split(' ')[0] || 'Me'}
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    {content.length} {content.length === 1 ? 'course' : 'courses'} to transform your skills
                  </p>
                </div>
                {content.length > 3 && (
                  <Button variant="ghost" asChild className="hidden sm:flex">
                    <Link href={`/mentors/${mentorId}/courses`}>
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {content.slice(0, 6).map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CourseLearningCard content={course} />
                  </motion.div>
                ))}
              </div>

              {content.length > 6 && (
                <div className="text-center mt-12">
                  <Button size="lg" variant="outline" asChild>
                    <Link href={`/mentors/${mentorId}/courses`}>
                      View All {content.length} Courses
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ========================================= */}
      {/* ADVISORY-ONLY Section (if no courses) */}
      {/* ========================================= */}
      {content.length === 0 && mentorSettings && (mentorSettings.offers1to1Sessions || mentorSettings.offersGroupSessions) && (
        <section className="border-b border-border/40">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 mb-6">
                <Video className="h-10 w-10 text-primary" />
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Advisory & Mentorship Sessions
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                Work directly with {mentor.user?.fullName?.split(' ')[0] || 'me'} through personalized strategy sessions and guidance calls
              </p>

              <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
                {mentorSettings.offers1to1Sessions && (
                  <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                        <Video className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">1:1 Strategy Sessions</h3>
                      <p className="text-muted-foreground mb-6">
                        Private video calls for personalized guidance, business strategy, and career mentorship
                      </p>
                      <ul className="text-left space-y-2 text-sm text-muted-foreground mb-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Personalized action plans</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Deep-dive problem solving</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Follow-up support included</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {mentorSettings.offersGroupSessions && (
                  <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
                        <Users className="h-8 w-8 text-accent" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">Group Q&A Sessions</h3>
                      <p className="text-muted-foreground mb-6">
                        Join live group sessions to learn from real questions and connect with peers
                      </p>
                      <ul className="text-left space-y-2 text-sm text-muted-foreground mb-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <span>Learn from others' questions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <span>Network with like-minded peers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <span>Recorded for later viewing</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {!hasSubscriptionAccess && (
                <div className="mt-12">
                  <Button 
                    size="lg" 
                    onClick={isPaidMentor || isVIPMentor ? handlePaidSubscribe : handleSubscribe}
                    className="h-14 px-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {isPaidMentor || isVIPMentor ? 'Subscribe to Book Sessions' : 'Subscribe Free to Get Started'}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ========================================= */}
      {/* ABOUT - The Human Story */}
      {/* ========================================= */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                About {mentor.user?.fullName?.split(' ')[0] || 'Me'}
              </h2>
              <p className="text-xl text-muted-foreground">The story behind the expertise</p>
            </div>

            <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 lg:p-12">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {mentor.bio || `${mentor.user?.fullName} is a seasoned professional with ${mentor.experienceYears}+ years of experience in their field. Through personalized mentorship and proven strategies, they help individuals achieve their goals and unlock their full potential.`}
                  </p>
                </div>

                {/* Expertise Tags */}
                {mentor.industries && mentor.industries.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-border/50">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Areas of Expertise</h3>
                    <div className="flex flex-wrap gap-3">
                      {mentor.industries.map((industry, index) => (
                        <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location & Experience */}
                <div className="mt-8 pt-8 border-t border-border/50 grid sm:grid-cols-2 gap-6">
                  {mentor.location && (
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Based in</p>
                        <p className="font-semibold text-foreground">{mentor.location}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-semibold text-foreground">{mentor.experienceYears}+ years</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ========================================= */}
      {/* Modals & Dialogs */}
      {/* ========================================= */}
      
      {/* Appointment Modal */}
      {showAppointmentModal && (
        <BookAppointmentModal
          mentorId={mentorId}
          mentorName={mentor.user?.fullName || 'Mentor'}
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
        />
      )}

      {/* Subscription Required Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Subscription Required
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              {subscriptionMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {mentorSettings && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-foreground">Subscribe to unlock:</p>
                <ul className="space-y-2">
                  {mentorSettings.allowsMessaging && (
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Direct messaging</span>
                    </li>
                  )}
                  {mentorSettings.offers1to1Sessions && (
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>1:1 video sessions</span>
                    </li>
                  )}
                  {mentorSettings.offersCourses && (
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Exclusive courses</span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)} className="w-full sm:w-auto">
              Maybe Later
            </Button>
            <Button 
              onClick={() => {
                setShowSubscriptionDialog(false);
                if (isPaidMentor || isVIPMentor) {
                  handlePaidSubscribe();
                } else {
                  handleSubscribe();
                }
              }}
              className="w-full sm:w-auto"
            >
              Subscribe Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
