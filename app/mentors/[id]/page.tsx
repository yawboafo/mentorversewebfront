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
import { Mentor, Content } from '@/lib/api/types';
import { User, Globe, Briefcase, Play, MapPin, MessageSquare, Award, Calendar, Video, Check, UserPlus, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { BookAppointmentModal } from '@/components/book-appointment-modal';
import { toast } from 'sonner';

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
      } catch (error) {
        console.error('Failed to fetch mentor:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mentorId]);

  // Check subscription status when user is logged in
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || !mentorId) return;
      
      // Don't check if user is the mentor themselves
      if (user.id === mentorId) return;

      try {
        setIsCheckingSubscription(true);
        const status = await mentorsApi.checkSubscriptionStatus(mentorId);
        setIsSubscribed(status.is_subscribed);
      } catch (error) {
        console.error('Failed to check subscription status:', error);
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [user, mentorId]);

  const handleSubscribe = async () => {
    if (!user) {
      // Redirect to login with return URL
      const returnUrl = `/mentors/${mentorId}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    try {
      setIsSubscribing(true);
      await mentorsApi.subscribeMentor(mentorId);
      setIsSubscribed(true);
      toast.success(`You're now subscribed to ${mentor?.user.fullName}! 🎉`, {
        description: 'You can now book appointments and access exclusive content.',
      });
    } catch (error: any) {
      console.error('Failed to subscribe:', error);
      toast.error('Failed to subscribe', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setIsSubscribing(true);
      await mentorsApi.unsubscribeMentor(mentorId);
      setIsSubscribed(false);
      toast.success('Unsubscribed successfully');
    } catch (error: any) {
      console.error('Failed to unsubscribe:', error);
      toast.error('Failed to unsubscribe', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-48 w-full mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Mentor not found</h2>
        <Button asChild>
          <Link href="/mentors">Browse Mentors</Link>
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section with Profile Image and Video */}
      <Card className="mb-8 overflow-hidden">
        <div className="relative h-64 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
          {/* Profile Avatar */}
          <div className="absolute -bottom-16 left-8 z-10">
            <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-900 shadow-2xl">
              <AvatarImage 
                src={mentor.user.avatarUrl || mentor.profileImageUrl || undefined} 
                alt={mentor.user.fullName}
              />
              <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {getInitials(mentor.user.fullName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <CardContent className="pt-20 pb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{mentor.user.fullName}</h1>
              <p className="text-lg text-muted-foreground mb-4">{mentor.headline}</p>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {mentor.experienceYears} years exp.
                </Badge>
                {mentor.isVerified && (
                  <Badge variant="default" className="bg-blue-500">
                    <Award className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Subscribe/Subscribed Button */}
              {user?.id !== mentorId && (
                <>
                  {!user ? (
                    <Button 
                      size="lg" 
                      onClick={handleSubscribe}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Login to Subscribe
                    </Button>
                  ) : isCheckingSubscription ? (
                    <Button size="lg" disabled>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </Button>
                  ) : isSubscribed ? (
                    <>
                      <Button 
                        size="lg" 
                        variant="secondary"
                        disabled
                        className="gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Subscribed
                      </Button>
                      <Button 
                        size="lg"
                        onClick={() => setShowAppointmentModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="lg" 
                      onClick={handleSubscribe}
                      disabled={isSubscribing}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isSubscribing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Subscribe to this Mentor
                        </>
                      )}
                    </Button>
                  )}
                  {isSubscribed && (
                    <Button 
                      size="lg"
                      variant="ghost"
                      onClick={handleUnsubscribe}
                      disabled={isSubscribing}
                    >
                      Unsubscribe
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Intro Video */}
          {mentor.introVideoUrl && (
            <Card className="mb-6 overflow-hidden">
              <div className="aspect-video bg-black/5 dark:bg-white/5 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 text-white mb-3">
                    <Play className="h-8 w-8 fill-white" />
                  </div>
                  <p className="text-sm text-muted-foreground">Watch intro video</p>
                  <p className="text-xs text-muted-foreground mt-1">{mentor.introVideoUrl}</p>
                </div>
              </div>
            </Card>
          )}
          
          {/* About Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                About {mentor.user.fullName}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {mentor.longBio}
              </p>
            </div>
            
            <Separator />
            
            {/* Expertise */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Areas of Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {mentor.areasOfExpertise?.map((area) => (
                  <Badge key={area} className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Languages & Social */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.languages?.map((lang) => (
                    <Badge key={lang} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {Object.keys(mentor.socialLinks || {}).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Connect</h3>
                  <div className="space-y-2">
                    {Object.entries(mentor.socialLinks).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline block capitalize"
                      >
                        {platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentor's Content */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Video className="h-6 w-6" />
          Courses & Frameworks by {mentor.user.fullName}
        </h2>
        
        {content.length === 0 ? (
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-dashed">
            <CardContent className="py-16 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">This mentor hasn't published any content yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon for new courses!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <Link key={item.id} href={`/content/${item.id}`}>
                <Card className="group h-full overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-purple-200 dark:hover:border-purple-800">
                  {/* Cover Image/Video */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-orange-900/30">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {item.mediaType === 'video' ? (
                        <div className="text-white">
                          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="h-8 w-8 fill-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-6xl opacity-20">📚</div>
                      )}
                    </div>
                    
                    {/* Price badge */}
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full font-bold text-sm">
                      ${item.price}
                    </div>
                    
                    {/* Type badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-purple-600 hover:bg-purple-700">
                        {item.contentType}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-purple-600 transition-colors mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                      {item.estimatedDuration && (
                        <span>{item.estimatedDuration}</span>
                      )}
                      {item.level && (
                        <Badge variant="secondary" className="text-xs">
                          {item.level}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Book Appointment Modal */}
      {mentor && (
        <BookAppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          mentorId={mentorId}
          mentorName={mentor.user.fullName}
        />
      )}
    </div>
  );
}
