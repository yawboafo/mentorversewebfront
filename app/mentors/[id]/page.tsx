'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { mentorsApi } from '@/lib/api/mentors';
import { contentApi } from '@/lib/api/content';
import { mentorSubscriptionsApi } from '@/lib/api/mentor-subscriptions';
import { Mentor, Content, MentorSettings, MentorAccessStatus } from '@/lib/api/types';
import { 
  User, Globe, Briefcase, MapPin, MessageSquare, Award, Calendar,
  Check, UserPlus, Loader2, Star, TrendingUp, Users, BookOpen,
  Video, Heart, Sparkles, Quote, Target, GraduationCap, CheckCircle2,
  Zap, Trophy, Clock, BarChart3, MessageCircle
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { BookAppointmentModal } from '@/components/book-appointment-modal';
import { CourseLearningCard } from '@/components/course-learning-card';
import { MentorAccessCard } from '@/components/mentors/mentor-access-card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
  const [showSubscriptionRequiredDialog, setShowSubscriptionRequiredDialog] = useState(false);
  const [subscriptionRequiredReason, setSubscriptionRequiredReason] = useState('');
  
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
        setContent(contentResponse.data);
      } catch (error: any) {
        console.error('Failed to fetch mentor:', error);
        
        if (error.status === 404) {
          toast.error('Mentor Not Found');
        } else if (error.status === 500) {
          toast.error('Server Error');
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
        
        // Fetch public mentor settings (always available)
        const settings = await mentorSubscriptionsApi.getPublicMentorSettings(mentorId);
        setMentorSettings(settings);

        // Check access status (only if user is logged in and not viewing own profile)
        if (user && user.id !== mentorId) {
          const access = await mentorSubscriptionsApi.checkMentorAccess(mentorId);
          setAccessStatus(access);
        }
      } catch (error: any) {
        console.error('Failed to fetch subscription data:', error);
        // Silently fail - mentor might not have paid subscriptions enabled
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
    // Refresh subscription data after successful subscription
    try {
      const [settings, access] = await Promise.all([
        mentorSubscriptionsApi.getPublicMentorSettings(mentorId),
        user ? mentorSubscriptionsApi.checkMentorAccess(mentorId) : Promise.resolve(null),
      ]);
      setMentorSettings(settings);
      if (access) setAccessStatus(access);
    } catch (error) {
      console.error('Failed to refresh subscription data:', error);
    }
  };

  const handleMessageClick = () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/mentors/${mentorId}`)}`);
      return;
    }

    // Check access for paid mentors
    if (accessStatus && !accessStatus.canMessage) {
      setSubscriptionRequiredReason(
        accessStatus.messagingDeniedReason || 'You need an active subscription to message this mentor.'
      );
      setShowSubscriptionRequiredDialog(true);
      return;
    }

    // Navigate to messages
    router.push(`/messages/${mentorId}`);
  };

  const handleBookAppointmentClick = () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/mentors/${mentorId}`)}`);
      return;
    }

    // Check access for paid mentors
    if (accessStatus && !accessStatus.canBookAppointment) {
      setSubscriptionRequiredReason(
        accessStatus.appointmentDeniedReason || 'You need an active subscription to book appointments with this mentor.'
      );
      setShowSubscriptionRequiredDialog(true);
      return;
    }

    // Show appointment modal
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
      setIsSubscribed(true);
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

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-80 w-full mb-12 rounded-3xl" />
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
          <h2 className="text-3xl font-bold mb-3 text-foreground">Mentor not found</h2>
          <p className="text-muted-foreground mb-8 text-lg">This mentor profile may have been removed.</p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8">
            <Link href="/mentors">Browse All Mentors</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ===== PREMIUM HERO SECTION ===== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 border-b border-border/40">
        {/* Subtle Pattern Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary),0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(var(--accent),0.1),transparent_50%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
            
            {/* LEFT: Mentor Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative flex-shrink-0"
            >
              <div className="relative">
                <Avatar className="h-56 w-56 border-4 border-border shadow-2xl">
                  <AvatarImage 
                    src={mentor.profileImageUrl || mentor.user?.avatarUrl || undefined}
                    alt={mentor.user?.fullName || mentor.headline}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-6xl font-bold bg-primary/20 text-primary">
                    {getInitials(mentor.user?.fullName || mentor.headline)}
                  </AvatarFallback>
                </Avatar>
                {mentor.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-primary p-3 rounded-full shadow-lg ring-4 ring-background">
                    <Award className="h-7 w-7 text-primary-foreground fill-current" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* RIGHT: Mentor Info */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight mb-4">
                  {mentor.user?.fullName || 'Mentor'}
                </h1>
                
                <p className="text-2xl md:text-3xl text-primary font-medium mb-4">
                  {mentor.headline}
                </p>

                <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                  "Helping young entrepreneurs build real, sustainable businesses through personalized mentorship and proven strategies."
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap gap-4 justify-center lg:justify-start"
              >
                {user?.id !== mentorId && (
                  <>
                    {!user ? (
                      <Button 
                        size="lg" 
                        onClick={handleSubscribe}
                        className="bg-primary hover:bg-primary/90 h-14 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <Heart className="h-5 w-5 mr-2" />
                        Subscribe to Mentor
                      </Button>
                    ) : isSubscribed ? (
                      <>
                        <Button 
                          size="lg" 
                          disabled
                          className="bg-primary/20 text-primary h-14 px-8 text-base font-semibold cursor-default"
                        >
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          Subscribed
                        </Button>
                        <Button 
                          size="lg" 
                          variant="outline"
                          onClick={handleBookAppointmentClick}
                          className="h-14 px-8 text-base font-semibold"
                        >
                          <Calendar className="h-5 w-5 mr-2" />
                          Book Appointment
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="lg" 
                        onClick={handleSubscribe}
                        disabled={isSubscribing || isCheckingSubscription}
                        className="bg-primary hover:bg-primary/90 h-14 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        {isSubscribing || isCheckingSubscription ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Subscribing...
                          </>
                        ) : (
                          <>
                            <Heart className="h-5 w-5 mr-2" />
                            Subscribe to Mentor
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}

                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleMessageClick}
                  className="h-14 px-8 text-base font-semibold"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Send Message
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CREDIBILITY HIGHLIGHTS - Stats Row ===== */}
      <div className="border-b border-border/40 bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            <Card className="border border-border/50 shadow-soft hover:shadow-soft-lg transition-all">
              <CardContent className="p-8 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
                  <Briefcase className="h-7 w-7 text-primary" />
                </div>
                <p className="text-4xl font-bold text-foreground">{mentor.experienceYears}+</p>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Years Experience</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-soft hover:shadow-soft-lg transition-all">
              <CardContent className="p-8 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10">
                  <BookOpen className="h-7 w-7 text-accent" />
                </div>
                <p className="text-4xl font-bold text-foreground">{content.length}</p>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Courses Created</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-soft hover:shadow-soft-lg transition-all">
              <CardContent className="p-8 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/10">
                  <Users className="h-7 w-7 text-secondary" />
                </div>
                <p className="text-4xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Mentees Guided</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-soft hover:shadow-soft-lg transition-all">
              <CardContent className="p-8 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-yellow-500/10">
                  <Star className="h-7 w-7 text-yellow-600 dark:text-yellow-500 fill-current" />
                </div>
                <p className="text-4xl font-bold text-foreground">5.0</p>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Average Rating</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ===== MAIN CONTENT SECTION ===== */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT COLUMN: About & Courses */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* ABOUT THE MENTOR */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                About {mentor.user?.fullName?.split(' ')[0] || 'Me'}
              </h2>
              <Card className="border border-border/50 shadow-soft-lg">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4 text-lg text-foreground leading-[1.8]">
                    <p>
                      {mentor.shortBio || mentor.longBio || 'An experienced professional dedicated to helping others achieve their goals through personalized mentorship and guidance.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* EXPERTISE TAGS */}
            {mentor.areasOfExpertise && mentor.areasOfExpertise.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
                    <Target className="h-6 w-6 text-accent" />
                  </div>
                  Areas of Expertise
                </h2>
                <Card className="border border-border/50 shadow-soft">
                  <CardContent className="p-8">
                    <div className="flex flex-wrap gap-3">
                      {mentor.areasOfExpertise.map((area, idx) => (
                        <Badge 
                          key={idx}
                          className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-primary/10 to-accent/10 text-foreground border border-primary/20 hover:shadow-md transition-shadow"
                        >
                          <Zap className="h-3.5 w-3.5 mr-1.5 text-primary" />
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* MENTOR'S COURSES */}
            {content.length > 0 && (
              <section>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/10">
                      <GraduationCap className="h-6 w-6 text-secondary" />
                    </div>
                    Learn with {mentor.user?.fullName?.split(' ')[0] || 'this mentor'}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {content.length} {content.length === 1 ? 'course' : 'courses'} available
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {content.map((course) => (
                    <CourseLearningCard key={course.id} content={course} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* Paid Subscription Card */}
              {mentorSettings && user?.id !== mentorId && (
                <MentorAccessCard
                  mentorId={mentorId}
                  mentorName={mentor.user?.fullName || mentor.headline}
                  settings={mentorSettings}
                  accessStatus={accessStatus}
                  isLoading={isLoadingSubscriptionData}
                  onSubscribeSuccess={handleSubscriptionSuccess}
                />
              )}

              {/* Contact/Actions Card */}
              <Card className="border-2 border-primary/30 shadow-2xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary" />
                
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold text-foreground">Connect with {mentor.user?.fullName?.split(' ')[0]}</h3>
                    <p className="text-muted-foreground">
                      Get personalized guidance and unlock your potential
                    </p>
                  </div>

                  <Separator />

                  {user?.id !== mentorId && (
                    <>
                      {!user ? (
                        <Button 
                          size="lg" 
                          onClick={handleSubscribe}
                          className="w-full bg-primary hover:bg-primary/90 h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          <Heart className="h-5 w-5 mr-2" />
                          Subscribe
                        </Button>
                      ) : isSubscribed ? (
                        <>
                          <Button 
                            size="lg" 
                            disabled
                            className="w-full bg-primary/20 text-primary h-14 text-base font-semibold cursor-default"
                          >
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Subscribed
                          </Button>
                          <Button 
                            size="lg" 
                            variant="outline"
                            onClick={handleBookAppointmentClick}
                            className="w-full h-12 text-base font-semibold"
                          >
                            <Calendar className="h-5 w-5 mr-2" />
                            Book Appointment
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="lg" 
                          onClick={handleSubscribe}
                          disabled={isSubscribing || isCheckingSubscription}
                          className="w-full bg-primary hover:bg-primary/90 h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          {isSubscribing || isCheckingSubscription ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Subscribing...
                            </>
                          ) : (
                            <>
                              <Heart className="h-5 w-5 mr-2" />
                              Subscribe
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}

                  <Separator />

                  {/* Additional Info */}
                  <div className="space-y-4 text-sm text-muted-foreground">
                    {mentor.languages && mentor.languages.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Languages</p>
                          <p>{mentor.languages.join(', ')}</p>
                        </div>
                      </div>
                    )}

                    {mentor.user?.country && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Location</p>
                          <p>{mentor.user.country}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground mb-1">Response Time</p>
                        <p>Usually within 24 hours</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badge */}
              <Card className="border border-border/50 shadow-soft bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Verified Mentor</p>
                  <p className="text-xs text-muted-foreground">Background checked and approved by MentorVerse</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      <BookAppointmentModal 
        isOpen={showAppointmentModal}
        mentorId={mentorId}
        mentorName={mentor.user?.fullName || mentor.headline}
        onClose={() => setShowAppointmentModal(false)}
      />

      {/* Subscription Required Dialog */}
      <Dialog open={showSubscriptionRequiredDialog} onOpenChange={setShowSubscriptionRequiredDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscription Required</DialogTitle>
            <DialogDescription>
              {subscriptionRequiredReason}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {mentorSettings && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Subscribe to unlock:</p>
                <ul className="space-y-2 text-sm">
                  {mentorSettings.allowsMessaging && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Direct messaging
                    </li>
                  )}
                  {mentorSettings.offers1to1Sessions && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      1:1 mentorship sessions
                    </li>
                  )}
                  {mentorSettings.offersGroupSessions && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Group sessions and workshops
                    </li>
                  )}
                  {mentorSettings.offersCourses && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Exclusive courses and content
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscriptionRequiredDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowSubscriptionRequiredDialog(false);
              // Scroll to subscription card
              const subscriptionCard = document.querySelector('[data-subscription-card]');
              subscriptionCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}>
              View Subscription Options
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
