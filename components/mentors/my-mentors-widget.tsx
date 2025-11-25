'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { mentorSubscriptionsApi } from '@/lib/api/mentor-subscriptions';
import { PaidMentorSubscription, MentorSettings } from '@/lib/api/types';
import { Users, MessageCircle, Calendar, ArrowRight, ExternalLink, Crown } from 'lucide-react';
import { MentorTypeBadge, SubscriptionStatusBadge } from './mentor-badges';

interface SubscriptionWithSettings {
  subscription: PaidMentorSubscription;
  settings: MentorSettings | null;
}

interface MyMentorsWidgetProps {
  maxDisplay?: number;
  showViewAll?: boolean;
}

export function MyMentorsWidget({ maxDisplay = 3, showViewAll = true }: MyMentorsWidgetProps) {
  const [subscriptionsData, setSubscriptionsData] = useState<SubscriptionWithSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await mentorSubscriptionsApi.getMyPaidSubscriptions({});
        // Filter only active subscriptions
        const activeSubscriptions = response.data.filter(sub => sub.status === 'active');
        
        // Fetch settings for each mentor
        const subscriptionsWithSettings = await Promise.all(
          activeSubscriptions.map(async (subscription) => {
            try {
              const settingsResponse = await mentorSubscriptionsApi.getPublicMentorSettings(subscription.mentorId);
              return { subscription, settings: settingsResponse.data };
            } catch (error) {
              return { subscription, settings: null };
            }
          })
        );
        
        setSubscriptionsData(subscriptionsWithSettings);
      } catch (error: any) {
        console.error('Failed to fetch subscriptions:', error);
        // Silently fail - user might not have any subscriptions
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">My Mentors</h2>
            <p className="text-sm text-muted-foreground mt-1">Your active mentorship subscriptions</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (subscriptionsData.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">My Mentors</h2>
            <p className="text-sm text-muted-foreground mt-1">Your active mentorship subscriptions</p>
          </div>
        </div>
        <Card className="p-12 text-center border-dashed">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">No active mentorships yet</h3>
          <p className="text-muted-foreground mb-6">
            Subscribe to a mentor to get personalized guidance and unlock exclusive content
          </p>
          <Button asChild>
            <Link href="/mentors">
              <Users className="h-4 w-4 mr-2" />
              Browse Mentors
            </Link>
          </Button>
        </Card>
      </section>
    );
  }

  const displayedSubscriptions = subscriptionsData.slice(0, maxDisplay);

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">My Mentors</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {subscriptionsData.length} active {subscriptionsData.length === 1 ? 'subscription' : 'subscriptions'}
          </p>
        </div>
        {showViewAll && subscriptionsData.length > maxDisplay && (
          <Button variant="ghost" asChild>
            <Link href="/mentors/my-mentors">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayedSubscriptions.map(({ subscription, settings }) => {
          const mentor = subscription.mentor;
          if (!mentor) return null;
          
          const mentorName = mentor.fullName || mentor.mentorProfile?.headline || 'Mentor';
          const initials = mentorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

          return (
            <Card 
              key={subscription.id} 
              className="group hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Premium indicator */}
              {settings && settings.accessType === 'vip' && (
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div className="absolute top-3 right-[-20px] rotate-45 bg-gradient-to-r from-purple-500 to-pink-500 w-20 text-center py-1">
                    <Crown className="h-3 w-3 text-white inline" />
                  </div>
                </div>
              )}

              <CardContent className="pt-6 pb-4">
                {/* Mentor Info */}
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                    <AvatarImage src={mentor.avatarUrl} alt={mentorName} />
                    <AvatarFallback className="text-lg font-bold bg-primary/20 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                      {mentorName}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {mentor.mentorProfile?.headline || mentor.email}
                    </p>
                  </div>
                </div>

                {/* Badges */}
                {settings && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <MentorTypeBadge accessType={settings.accessType} />
                    <SubscriptionStatusBadge status={subscription.status} />
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                    disabled={!settings?.allowsMessaging}
                  >
                    <Link href={`/messages/${subscription.mentorId}`}>
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                    disabled={!settings?.offers1to1Sessions}
                  >
                    <Link href={`/mentors/${subscription.mentorId}?action=book`}>
                      <Calendar className="h-4 w-4 mr-1" />
                      Book
                    </Link>
                  </Button>
                </div>
              </CardContent>

              <CardContent className="pt-0 pb-4 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild 
                  className="w-full text-xs text-muted-foreground hover:text-primary"
                >
                  <Link href={`/mentors/${subscription.mentorId}`}>
                    View Profile <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
