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
  User, Briefcase, MapPin, Award, Calendar, Loader2, Users, BookOpen,
  Video, Heart, Sparkles, Quote, CheckCircle2, MessageCircle, Crown, 
  Lock, ArrowRight, CheckCircle, Shield, Lightbulb, Target, TrendingUp,
  Zap, Send, Info
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { BookAppointmentModal } from '@/components/book-appointment-modal';
import { CourseLearningCard } from '@/components/course-learning-card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { MentorTypeBadge } from '@/components/mentors/mentor-badges';
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
        if (error.status === 404) toast.error('Mentor Not Found');
        setMentor(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [mentorId]);

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
      setSubscriptionMessage(accessStatus.messagingDeniedReason || 'Subscribe to message this mentor');
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
      setSubscriptionMessage(accessStatus.appointmentDeniedReason || 'Subscribe to book appointments');
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

  const mentorOfferings = mentorSettings ? [
    mentorSettings.allowsMessaging && { icon: MessageCircle, label: 'Direct Messaging', description: 'Get personalized guidance via chat' },
    mentorSettings.offers1to1Sessions && { icon: Video, label: '1:1 Sessions', description: 'Private video mentorship' },
    mentorSettings.offersGroupSessions && { icon: Users, label: 'Group Sessions', description: 'Learn with community' },
    mentorSettings.offersCourses && content.length > 0 && { icon: BookOpen, label: 'Exclusive Courses', description: 'Premium content library' },
  ].filter(Boolean) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16">
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
          <p className="text-muted-foreground mb-8">This profile may have been removed.</p>
          <Button asChild size="lg"><Link href="/mentors">Browse Mentors</Link></Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === mentorId;
  const isPaidMentor = mentorSettings?.accessType === MentorAccessType.PAID;
  const isVIPMentor = mentorSettings?.accessType === MentorAccessType.VIP;
  const hasSubscriptionAccess = accessStatus?.hasActiveSubscription || isSubscribed;

  return (
    <div className="min-h-screen bg-background">
      
      {/* ======================================================================================== */}
      {/* HERO - Magazine-Quality Layout */}
      {/* ======================================================================================== */}
      <section className="relative bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden border-b">
        {/* Elegant Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(var(--accent),0.02),transparent_50%)]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 py-12 lg:py-20">
            
            {/* LEFT: Visual Identity - 4 cols */}
            <div className="lg:col-span-4 flex flex-col items-center text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* Avatar with modern halo */}
                <div className="relative inline-block">
                  <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-full blur-xl" />
                  <Avatar className="relative h-56 w-56 border-[6px] border-background shadow-2xl ring-1 ring-border/50">
                    <AvatarImage 
                      src={mentor.profileImageUrl || mentor.user?.avatarUrl || undefined}
                      alt={mentor.user?.fullName}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-6xl font-bold bg-gradient-to-br from-primary/10 to-accent/10">
                      {getInitials(mentor.user?.fullName || mentor.headline)}
                    </AvatarFallback>
                  </Avatar>
                  {mentor.isVerified && (
                    <div className="absolute bottom-2 right-2 bg-primary p-3.5 rounded-full shadow-xl ring-4 ring-background">
                      <Award className="h-7 w-7 text-primary-foreground fill-current" />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Mentor Type Badge */}
              {mentorSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <MentorTypeBadge accessType={mentorSettings.accessType} className="text-sm px-4 py-2" />
                </motion.div>
              )}

              {/* Quick Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-3 gap-6 w-full max-w-xs pt-4"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">{mentor.experienceYears}+</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Years</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">{content.length}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">500+</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Mentees</div>
                </div>
              </motion.div>
            </div>

            {/* RIGHT: Content & Actions - 8 cols */}
            <div className="lg:col-span-8 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6"
              >
                {/* Name & Title */}
                <div className="space-y-3">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-[1.1]">
                    {mentor.user?.fullName || 'Mentor'}
                  </h1>
                  <p className="text-2xl sm:text-3xl text-primary font-semibold">
                    {mentor.headline}
                  </p>
                </div>

                {/* Mission Quote */}
                <div className="relative max-w-3xl">
                  <div className="flex items-start gap-4">
                    <Quote className="h-10 w-10 text-primary/20 flex-shrink-0 -mt-1" />
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      {mentor.longBio || mentor.shortBio || "Helping ambitious individuals unlock their full potential through personalized guidance and transformative mentorship."}
                    </p>
                  </div>
                </div>

                {/* Expertise Tags */}
                {mentor.areasOfExpertise && mentor.areasOfExpertise.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {mentor.areasOfExpertise.slice(0, 5).map((expertise, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                        {expertise}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Location Info */}
                {mentor.user?.country && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{mentor.user.country}</span>
                  </div>
                )}

                {/* Action Buttons */}
                {!isOwnProfile && (
                  <div className="flex flex-wrap gap-3 pt-4">
                    {hasSubscriptionAccess ? (
                      <>
                        <Badge variant="default" className="px-4 py-2.5 text-sm font-semibold gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Active Subscriber
                        </Badge>
                        {accessStatus?.canMessage && (
                          <Button size="lg" onClick={handleMessageClick} className="h-12 px-6">
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                        )}
                        {accessStatus?.canBookAppointment && (
                          <Button size="lg" variant="outline" onClick={handleBookAppointmentClick} className="h-12 px-6">
                            <Calendar className="h-4 w-4 mr-2" />
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
                          className="h-12 px-8 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                        >
                          {isSubscribing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              {isPaidMentor || isVIPMentor ? (
                                <>
                                  <Crown className="h-4 w-4 mr-2" />
                                  Subscribe Now
                                </>
                              ) : (
                                <>
                                  <Heart className="h-4 w-4 mr-2" />
                                  Subscribe Free
                                </>
                              )}
                            </>
                          )}
                        </Button>
                        <Button size="lg" variant="outline" onClick={handleMessageClick} className="h-12 px-6">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================================== */}
      {/* SUBSCRIPTION BENEFITS - Side-by-Side Premium Layout */}
      {/* ======================================================================================== */}
      {!isOwnProfile && mentorSettings && (
        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              
              {/* LEFT: What's Included - 2 cols */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-4xl font-bold text-foreground mb-3">
                    Work with {mentor.user?.fullName?.split(' ')[0]}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {isPaidMentor ? 'Premium mentorship experience' : isVIPMentor ? 'Elite advisory access' : 'Free mentorship access'}
                  </p>
                </div>

                {mentorOfferings.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {mentorOfferings.map((offering: any, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-shadow h-full">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <offering.icon className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground mb-1">{offering.label}</h3>
                                <p className="text-sm text-muted-foreground">{offering.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                      <p className="text-muted-foreground">Service details will be displayed here</p>
                    </CardContent>
                  </Card>
                )}

                {mentorSettings.allowsMessaging && mentorSettings.messageLimitPerPeriod && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                    <Info className="h-4 w-4" />
                    <span>Includes {mentorSettings.messageLimitPerPeriod} messages per {mentorSettings.billingPeriod}</span>
                  </div>
                )}
              </div>

              {/* RIGHT: Pricing Sidebar - 1 col */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-2xl">
                    <CardContent className="p-8 space-y-6">
                      {/* Price Display */}
                      <div className="text-center space-y-4">
                        {mentorSettings.accessType === MentorAccessType.OPEN && (
                          <>
                            <Badge className="text-sm px-3 py-1.5 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                              Free Access
                            </Badge>
                            <div>
                              <p className="text-6xl font-bold text-foreground">Free</p>
                              <p className="text-sm text-muted-foreground mt-2">Open mentorship</p>
                            </div>
                          </>
                        )}
                        
                        {mentorSettings.accessType === MentorAccessType.PAID && mentorSettings.baseSubscriptionPrice && (
                          <>
                            <Badge className="text-sm px-3 py-1.5 bg-primary/10 text-primary border-primary/20">
                              <Crown className="h-3.5 w-3.5 mr-1" />
                              Premium
                            </Badge>
                            <div>
                              <PriceDisplay 
                                amount={mentorSettings.baseSubscriptionPrice}
                                currency={mentorSettings.currency}
                                billingPeriod={mentorSettings.billingPeriod}
                                className="text-5xl font-bold"
                              />
                              <p className="text-sm text-muted-foreground mt-2">Billed {mentorSettings.billingPeriod}</p>
                            </div>
                          </>
                        )}

                        {mentorSettings.accessType === MentorAccessType.VIP && mentorSettings.baseSubscriptionPrice && (
                          <>
                            <Badge className="text-sm px-3 py-1.5 bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20">
                              <Crown className="h-3.5 w-3.5 mr-1" />
                              VIP
                            </Badge>
                            <div>
                              <PriceDisplay 
                                amount={mentorSettings.baseSubscriptionPrice}
                                currency={mentorSettings.currency}
                                billingPeriod={mentorSettings.billingPeriod}
                                className="text-5xl font-bold"
                              />
                              <p className="text-sm text-muted-foreground mt-2">Elite advisory</p>
                            </div>
                          </>
                        )}
                      </div>

                      <Separator className="bg-border/50" />

                      {/* CTA */}
                      {!hasSubscriptionAccess ? (
                        <Button 
                          size="lg" 
                          onClick={isPaidMentor || isVIPMentor ? handlePaidSubscribe : handleSubscribe}
                          disabled={isSubscribing}
                          className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
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
                          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary/10 text-primary font-semibold">
                            <CheckCircle className="h-5 w-5" />
                            <span>Active Subscription</span>
                          </div>
                          {accessStatus?.canMessage && (
                            <Button size="lg" onClick={handleMessageClick} className="w-full h-12">
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </Button>
                          )}
                          {accessStatus?.canBookAppointment && (
                            <Button size="lg" variant="outline" onClick={handleBookAppointmentClick} className="w-full h-12">
                              <Calendar className="h-4 w-4 mr-2" />
                              Book Session
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Trust Signals */}
                      <div className="pt-4 space-y-2 border-t border-border/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Cancel anytime</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Secure payment</span>
                        </div>
                        {mentor.isVerified && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Award className="h-4 w-4 text-primary flex-shrink-0" />
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

      {/* ======================================================================================== */}
      {/* COURSES - Clean Grid */}
      {/* ======================================================================================== */}
      {content.length > 0 && mentorSettings?.offersCourses && (
        <section className="border-b bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-end justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-bold text-foreground mb-3">
                    Courses & Learning
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {content.length} {content.length === 1 ? 'course' : 'courses'} to accelerate your growth
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.slice(0, 6).map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
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
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ======================================================================================== */}
      {/* ADVISORY-ONLY (No Courses) */}
      {/* ======================================================================================== */}
      {content.length === 0 && mentorSettings && (mentorSettings.offers1to1Sessions || mentorSettings.offersGroupSessions) && (
        <section className="border-b bg-background">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-12"
            >
              <div>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-6">
                  <Video className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  Advisory & Mentorship
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Direct guidance through personalized sessions
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {mentorSettings.offers1to1Sessions && (
                  <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm text-left">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <Video className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">1:1 Strategy Sessions</h3>
                      <p className="text-muted-foreground mb-6">
                        Private calls for personalized guidance and deep-dive problem solving
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Personalized action plans</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Focused problem-solving</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Follow-up support</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {mentorSettings.offersGroupSessions && (
                  <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm text-left">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                        <Users className="h-7 w-7 text-accent" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">Group Sessions</h3>
                      <p className="text-muted-foreground mb-6">
                        Live group calls to learn from real questions and network with peers
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <span>Learn from others' questions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <span>Network with community</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <span>Recorded sessions</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {!hasSubscriptionAccess && (
                <Button 
                  size="lg" 
                  onClick={isPaidMentor || isVIPMentor ? handlePaidSubscribe : handleSubscribe}
                  className="h-14 px-12 text-base font-semibold"
                >
                  {isPaidMentor || isVIPMentor ? 'Subscribe to Book Sessions' : 'Subscribe Free'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Modals */}
      {showAppointmentModal && (
        <BookAppointmentModal
          mentorId={mentorId}
          mentorName={mentor.user?.fullName || 'Mentor'}
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
        />
      )}

      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Subscription Required
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              {subscriptionMessage}
            </DialogDescription>
          </DialogHeader>
          {mentorSettings && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="font-semibold">Subscribe to unlock:</p>
              <ul className="space-y-1.5">
                {mentorSettings.allowsMessaging && (
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Direct messaging</span>
                  </li>
                )}
                {mentorSettings.offers1to1Sessions && (
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>1:1 sessions</span>
                  </li>
                )}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>
              Maybe Later
            </Button>
            <Button onClick={() => {
              setShowSubscriptionDialog(false);
              if (isPaidMentor || isVIPMentor) handlePaidSubscribe();
              else handleSubscribe();
            }}>
              Subscribe Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
