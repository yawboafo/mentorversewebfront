'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireRole } from '@/hooks/use-require-auth';
import { mentorsApi } from '@/lib/api/mentors';
import { MentorDashboard } from '@/lib/api/types';
import { DollarSign, BookOpen, TrendingUp, Users, Plus, BarChart3, Loader2, ArrowRight } from 'lucide-react';

export default function MentorDashboardPage() {
  const { user, isLoading: authLoading } = useRequireRole(['mentor', 'admin']);
  const [dashboardData, setDashboardData] = useState<MentorDashboard | null>(null);
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

    if (user) {
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {user.full_name}!</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
          <Link href="/mentor/content/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Content
          </Link>
        </Button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData?.total_sales.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">From all content sales</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.total_purchases || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Students enrolled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Content</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.top_content?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Courses & frameworks</p>
          </CardContent>
        </Card>
      </div>

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
            {dashboardData.top_content.map((item) => (
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
                      <span className="font-semibold">${item.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-semibold">${item.content.price}</span>
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
                {dashboardData.recent_purchases.map((purchase) => (
                  <div key={purchase.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium">{purchase.content_title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(purchase.purchased_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${purchase.amount}</p>
                      <p className="text-xs text-muted-foreground">{purchase.currency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Empty State */}
      {(!dashboardData?.top_content || dashboardData.top_content.length === 0) && (
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
