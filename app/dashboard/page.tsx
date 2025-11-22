'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardApi } from '@/lib/api/dashboard';
import { MessageSquare, Users, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { DashboardData } from '@/lib/api/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
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

    if (user && user.onboarding_completed) {
      fetchDashboard();
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchased Content</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.purchased_content_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Courses and frameworks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Mentors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.mentors_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Learning from
            </p>
            {(dashboardData?.mentors_count || 0) > 0 && (
              <Button asChild size="sm" variant="link" className="px-0 mt-2">
                <Link href="/dashboard/mentors">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.recent_ai_sessions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Recent conversations
            </p>
          </CardContent>
        </Card>
      </div>

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
