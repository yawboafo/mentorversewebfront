'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRequireRole } from '@/hooks/use-require-auth';
import { mentorsApi } from '@/lib/api/mentors';
import { appointmentsApi } from '@/lib/api/appointments';
import { contentApi } from '@/lib/api/content';
import type { Appointment } from '@/lib/api/appointments';
import { MentorDashboard } from '@/lib/api/types';
import { DollarSign, BookOpen, TrendingUp, Users, Plus, BarChart3, Loader2, ArrowRight, Sparkles, Calendar, Clock, Video } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/utils/currency';
import { UpcomingSessions } from '@/components/mentor/upcoming-sessions';

export default function MentorDashboardPage() {
  const { user, isLoading: authLoading } = useRequireRole(['mentor', 'admin']);
  const [dashboardData, setDashboardData] = useState<MentorDashboard | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [publishedContentCount, setPublishedContentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await mentorsApi.getMentorDashboard();
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

    const fetchPublishedContent = async () => {
      try {
        // Fetch mentor's published content
        const response = await contentApi.getContent({
          mentor_id: user?.id,
          limit: 1000 // Get all to count
        });
        // Count only published content
        const publishedCount = response.data.filter(c => c.status === 'published').length;
        setPublishedContentCount(publishedCount);
      } catch (err: any) {
        console.error('Failed to fetch published content count:', err);
      }
    };

    if (user) {
      fetchDashboard();
      fetchAppointments();
      fetchPublishedContent();
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

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="p-12 text-center">
          <h3 className="text-2xl font-bold mb-2">Error Loading Dashboard</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {user.full_name}!</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 w-full sm:w-auto justify-center">
            <Link href="/mentor/content/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Content
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(dashboardData?.total_sales || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">From all content sales</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.total_mentees || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active mentees</p>
            {(dashboardData?.total_mentees || 0) > 0 && (
              <Button asChild size="sm" variant="link" className="px-0 mt-2">
                <Link href="/mentor/mentees">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.total_purchases || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Content purchases</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Content</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedContentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Courses & frameworks</p>
            {publishedContentCount > 0 && (
              <Button asChild size="sm" variant="link" className="px-0 mt-2">
                <Link href="/mentor/content">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
            <Button asChild size="sm" variant="link" className="px-0 mt-2">
              <Link href="/mentor/appointments">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Section */}
      <UpcomingSessions appointments={upcomingAppointments} isLoading={isLoading} />

      {/* Legacy Section - Can be removed */}
      {false && upcomingAppointments.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Upcoming Sessions</h2>
            <Button variant="ghost" asChild>
              <Link href="/mentor/appointments">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4">
            {upcomingAppointments.map((appointment) => {
              const mentee = appointment.mentee;
              const apptData = appointment as any;
              
              // Handle both ISO format and backend's format
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
                  const startTime = parseISO(appointment.startTime);
                  const endTime = parseISO(appointment.endTime);
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
                          <AvatarImage src={mentee.profilePhoto} alt={mentee.fullName} />
                          <AvatarFallback>
                            {mentee.fullName.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{mentee.fullName}</h3>
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
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {appointment.status === 'scheduled' && (
                          <Button size="sm" variant="outline" onClick={() => {
                            appointmentsApi.confirmAppointment(appointment.id)
                              .then(() => window.location.reload())
                              .catch(console.error);
                          }}>
                            Confirm
                          </Button>
                        )}
                        {appointment.meetingLink && (
                          <Button asChild size="sm">
                            <a href={appointment.meetingLink} target="__blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4 mr-2" />
                              Join
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* AI Builder CTA - Removed to reduce duplicate CTAs */}
      {false && (!dashboardData?.top_content || dashboardData?.top_content.length === 0) && (
        <Card className="mb-12 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">
                  Create Your First Course with AI
                </h3>
                <p className="text-muted-foreground mb-4">
                  Let our AI assistant help you design a professional course in minutes. 
                  Just describe what you want to teach, and we'll handle the rest.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Link href="/mentor/ai-builder">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start with AI Builder
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/mentor/content/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Manually
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Content */}
      {dashboardData?.top_content && dashboardData.top_content.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Top Performing Content
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.top_content.map((item: any) => (
              <Card key={item.content.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary">{item.content.content_type}</Badge>
                    <Badge variant="outline">{item.purchase_count} sales</Badge>
                  </div>
                  <CardTitle className="mt-2 line-clamp-2">{item.content.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-semibold">${(item.revenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-semibold">${item.content?.price || 0}</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href={`/content/${item.content.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Recent Purchases */}
      {dashboardData?.recent_purchases && dashboardData.recent_purchases.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Purchases</h2>
            <Button variant="ghost" asChild>
              <Link href="/mentor/sales">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {dashboardData.recent_purchases.map((purchase: any) => (
                  <div key={purchase.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium">{purchase.content_title || 'Unknown Content'}</p>
                      <p className="text-sm text-muted-foreground">
                        {purchase.purchased_at ? new Date(purchase.purchased_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(purchase.amount || 0, purchase.currency || 'USD')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Empty State - Removed to reduce duplicate CTAs */}
      {false && (!dashboardData?.top_content || dashboardData?.top_content.length === 0) && (
        <Card className="p-12 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-bold mb-2">Start Creating Content</h3>
          <p className="text-muted-foreground mb-6">
            Create your first course or framework to start earning
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Link href="/mentor/content/create">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Content
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
