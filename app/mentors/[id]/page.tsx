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
import { Mentor, Content } from '@/lib/api/types';
import { 
  User, Globe, Briefcase, MapPin, MessageSquare, Award, Calendar,
  Check, UserPlus, Loader2, Star, TrendingUp, Users, BookOpen,
  Video, Heart, Sparkles, Quote, Target, GraduationCap
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { BookAppointmentModal } from '@/components/book-appointment-modal';
import { CourseLearningCard } from '@/components/course-learning-card';
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
      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Skeleton className="h-96 w-full mb-8 rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
          <User className="h-20 w-20 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Mentor not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">This mentor profile may have been removed.</p>
          <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
            <Link href="/mentors">Browse All Mentors</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      {/* Premium Hero Section */}
      <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700 dark:from-orange-900 dark:via-amber-900 dark:to-orange-950 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2),transparent_50%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Mentor Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-full blur-3xl" />
              <Avatar className="relative h-48 w-48 border-8 border-white/30 shadow-2xl">
                <AvatarImage 
                  src={mentor.profileImageUrl || mentor.user?.avatarUrl || undefined}
                  alt={mentor.user?.fullName || mentor.headline}
                  className="object-cover"
                />
                <AvatarFallback className="text-6xl font-bold bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                  {getInitials(mentor.user?.fullName || mentor.headline)}
                </AvatarFallback>
              </Avatar>
              {mentor.isVerified && (
                <div className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full shadow-lg">
                  <Award className="h-6 w-6 text-white fill-white" />
                </div>
              )}
            </motion.div>

            {/* Mentor Info */}
            <div className="flex-1 text-center lg:text-left">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl font-bold mb-3"
              >
                {mentor.user?.fullName || 'Mentor'}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl md:text-3xl text-orange-100 mb-4 font-light"
              >
                {mentor.headline}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-white/90 max-w-2xl mb-6"
              >
                "Helping entrepreneurs and professionals build real-world skills and achieve their goals through personalized mentorship."
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4 justify-center lg:justify-start"
              >
                {user?.id !== mentorId && (
                  <Button
                    size="lg"
                    onClick={handleSubscribe}
                    disabled={isSubscribing || isCheckingSubscription || isSubscribed}
                    className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8 shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSubscribing ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : isSubscribed ? (
                      <Check className="h-5 w-5 mr-2" />
                    ) : (
                      <UserPlus className="h-5 w-5 mr-2" />
                    )}
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </Button>
                )}
                <Button
                  size="lg"
                  onClick={() => setShowAppointmentModal(true)}
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Session
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 -mt-16 relative z-10"
        >
          <Card className="border-0 shadow-lg bg-white dark:bg-zinc-900">
            <CardContent className="p-6 text-center">
              <Briefcase className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{mentor.experienceYears}+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Years Experience</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-zinc-900">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{content.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Courses Created</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-zinc-900">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-amber-500 mx-auto mb-2 fill-amber-500" />
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">5.0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-zinc-900">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{mentor.areasOfExpertise?.length || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expertise Areas</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card className="border-0 shadow-md bg-white dark:bg-zinc-900">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <User className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  About {mentor.user?.fullName?.split(' ')[0] || 'Me'}
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  <p>{mentor.shortBio || mentor.longBio || 'An experienced professional dedicated to helping others achieve their goals through personalized mentorship and guidance.'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Expertise Tags */}
            {mentor.areasOfExpertise && mentor.areasOfExpertise.length > 0 && (
              <Card className="border-0 shadow-md bg-white dark:bg-zinc-900">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    Areas of Expertise
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {mentor.areasOfExpertise.map((area, idx) => (
                      <Badge 
                        key={idx}
                        className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow"
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Courses Section */}
            {content.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Learn with {mentor.user?.fullName?.split(' ')[0] || 'this mentor'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
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

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-lg bg-white dark:bg-zinc-900 sticky top-8">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Connect</h3>
                
                <Button
                  onClick={() => setShowAppointmentModal(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                  size="lg"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book a Session
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-2 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 font-semibold"
                  size="lg"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Send Message
                </Button>

                <Separator />

                {mentor.user?.country && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{mentor.user.country}</span>
                  </div>
                )}

                {mentor.languages && mentor.languages.length > 0 && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Globe className="h-4 w-4" />
                    <span>{mentor.languages.join(', ')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <BookAppointmentModal
        isOpen={showAppointmentModal}
        mentorId={mentorId}
        mentorName={mentor?.user?.fullName || mentor?.headline || 'Mentor'}
        onClose={() => setShowAppointmentModal(false)}
      />
    </div>
  );
}
