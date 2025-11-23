'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { dashboardApi } from '@/lib/api/dashboard';
import { appointmentsApi } from '@/lib/api/appointments';
import { mentorsApi } from '@/lib/api/mentors';
import type { Appointment } from '@/lib/api/appointments';
import { MessageSquare, Users, BookOpen, ArrowRight, Loader2, Calendar, Clock, Video, Star, CheckCircle2, Award } from 'lucide-react';
import { useState } from 'react';
import { DashboardData } from '@/lib/api/types';
import { format, parseISO } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [mentorsData, setMentorsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      // Redirect admin to admin panel
      if (user.role === 'admin') {
        console.log('👑 Admin detected on user dashboard, redirecting to admin panel');
        router.replace('/admin');
        return;
      }
      // Redirect mentor to mentor dashboard
      if (user.role === 'mentor') {
        console.log('🎓 Mentor detected on user dashboard, redirecting to mentor dashboard');
        router.replace('/mentor/dashboard');
        return;
      }
      // Redirect users who registered as mentors
      if (user.signup_intent === 'mentor') {
        const mentorStatus = user.mentor_status || 'none';
        if (mentorStatus === 'pending_approval') {
          console.log('⏳ Mentor application pending, redirecting to pending page');
          router.replace('/mentor/pending');
          return;
        } else if (mentorStatus === 'none') {
          console.log('📝 Mentor intent, no application - redirecting to apply');
          router.replace('/mentor/apply');
          return;
        }
      }
      // Regular users need onboarding
      if (!user.onboarding_completed) {
        router.push('/onboarding');
      }
    }
  }, [user, router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await dashboardApi.getDashboard();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAppointments = async () => {
      try {
        const appointments = await appointmentsApi.getUpcomingAppointments(3);
        setUpcomingAppointments(appointments);
      } catch (err: any) {
        console.error('Failed to fetch appointments:', err);
      }
    };

    const fetchMentors = async () => {
      try {
        const response = await mentorsApi.getMyMentors();
        setMentorsData(response.data || []);
      } catch (err: any) {
        console.error('Failed to fetch mentors:', err);
      }
    };

    if (user && user.onboarding_completed) {
      fetchDashboard();
      fetchAppointments();
      fetchMentors();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user.full_name}!</h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your learning journey
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Consolidated Mentors Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-2xl font-bold mb-1">{mentorsData.length}</div>
                <p className="text-xs font-medium text-muted-foreground">My Mentors</p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {mentorsData.filter(m => m.availability === 'available').length} available
            </div>
            <Button asChild size="sm" variant="link" className="px-0 mt-2 h-auto text-xs">
              <Link href="/dashboard/mentors">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-2xl font-bold mb-1">{upcomingAppointments.length}</div>
                <p className="text-xs font-medium text-muted-foreground">Upcoming Sessions</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <Button asChild size="sm" variant="link" className="px-0 h-auto text-xs text-blue-600 dark:text-blue-400">
              <Link href="/dashboard/appointments">
                View calendar <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Purchased Content */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-2xl font-bold mb-1">{dashboardData?.purchased_content_count || 0}</div>
                <p className="text-xs font-medium text-muted-foreground">Content Library</p>
              </div>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Courses & frameworks</p>
          </CardContent>
        </Card>

        {/* AI Sessions */}
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200 dark:border-emerald-800">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-2xl font-bold mb-1">{dashboardData?.recent_ai_sessions?.length || 0}</div>
                <p className="text-xs font-medium text-muted-foreground">AI Conversations</p>
              </div>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Recent chats</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Upcoming Sessions</h2>
            <Button variant="ghost" asChild>
              <Link href="/dashboard/appointments">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4">
            {upcomingAppointments.map((appointment) => {
              const mentor = appointment.mentor;
              const apptData = appointment as any;
              
              // Handle both ISO format and backend's format {scheduledDate, startTime, endTime}
              let startTime: Date;
              let endTime: Date;
              let dateDisplay: string;
              let timeDisplay: string;
              
              try {
                if (apptData.scheduledDate && apptData.startTime && apptData.startTime.includes(':')) {
                  // Backend format: separate date and time fields
                  dateDisplay = format(parseISO(apptData.scheduledDate), 'MMM d, yyyy');
                  
                  // Parse start time
                  const [startHours, startMinutes] = apptData.startTime.split(':').map(Number);
                  const startAmpm = startHours >= 12 ? 'PM' : 'AM';
                  const startDisplayHour = startHours % 12 || 12;
                  
                  // Parse end time
                  const [endHours, endMinutes] = apptData.endTime.split(':').map(Number);
                  const endAmpm = endHours >= 12 ? 'PM' : 'AM';
                  const endDisplayHour = endHours % 12 || 12;
                  
                  timeDisplay = `${startDisplayHour}:${String(startMinutes).padStart(2, '0')} ${startAmpm} - ${endDisplayHour}:${String(endMinutes).padStart(2, '0')} ${endAmpm}`;
                } else {
                  // ISO format fallback
                  startTime = parseISO(appointment.startTime);
                  endTime = parseISO(appointment.endTime);
                  dateDisplay = format(startTime, 'MMM d, yyyy');
                  timeDisplay = `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
                }
              } catch (error) {
                console.error('Error parsing appointment times:', error, appointment);
                dateDisplay = 'Date not available';
                timeDisplay = 'Time not available';
              }
              
              return (
                <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={mentor.profilePhoto} alt={mentor.fullName} />
                          <AvatarFallback>
                            {mentor.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{mentor.fullName}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {dateDisplay}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {timeDisplay}
                            </span>
                          </div>
                        </div>
                      </div>
                      {appointment.meetingLink && (
                        <Button asChild size="sm">
                          <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-2" />
                            Join
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Continue Learning */}
      {dashboardData?.recent_content && dashboardData.recent_content.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Continue Learning</h2>
            <Button variant="ghost" asChild>
              <Link href="/content">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardData.recent_content.map((content) => (
              <Card key={content.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary">{content.content_type}</Badge>
                    <span className="text-sm font-semibold">${content.price}</span>
                  </div>
                  <CardTitle className="mt-2">{content.title}</CardTitle>
                  <CardDescription>{content.mentor_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {content.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/content/${content.id}/view`}>Continue</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Suggested Content */}
      {dashboardData?.suggested_content && dashboardData.suggested_content.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Suggested for You</h2>
            <Button variant="ghost" asChild>
              <Link href="/content">
                Browse all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardData.suggested_content.slice(0, 3).map((content) => (
              <Card key={content.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary">{content.content_type}</Badge>
                    <span className="text-sm font-semibold">${content.price}</span>
                  </div>
                  <CardTitle className="mt-2">{content.title}</CardTitle>
                  <CardDescription>{content.mentor_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {content.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/content/${content.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Explore More</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/mentors')}>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Browse Mentors</CardTitle>
              <CardDescription>
                Find expert mentors in your field of interest
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/content')}>
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Explore Courses</CardTitle>
              <CardDescription>
                Discover frameworks and courses to accelerate your growth
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/ai/chat')}>
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-primary mb-4" />
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Get instant guidance from our AI mentor assistant
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}
