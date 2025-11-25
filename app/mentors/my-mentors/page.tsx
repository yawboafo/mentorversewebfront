'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mentorSubscriptionsApi } from '@/lib/api/mentor-subscriptions';
import { PaidMentorSubscription, MentorSettings, PaidSubscriptionStatus } from '@/lib/api/types';
import { 
  Users, MessageCircle, Calendar, ExternalLink, Crown, AlertCircle, 
  CheckCircle2, Clock, XCircle, ArrowLeft, CreditCard 
} from 'lucide-react';
import { MentorTypeBadge, SubscriptionStatusBadge } from '@/components/mentors/mentor-badges';
import { PriceDisplay } from '@/components/mentors/price-display';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

interface SubscriptionWithSettings {
  subscription: PaidMentorSubscription;
  settings: MentorSettings | null;
}

export default function MyMentorsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireAuth();
  const [subscriptionsData, setSubscriptionsData] = useState<SubscriptionWithSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedSubscription, setSelectedSubscription] = useState<PaidMentorSubscription | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await mentorSubscriptionsApi.getMyPaidSubscriptions({});
        
        // Fetch settings for each mentor
        const subscriptionsWithSettings = await Promise.all(
          response.data.map(async (subscription) => {
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
        toast.error('Failed to load subscriptions');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return;

    try {
      setIsCancelling(true);
      await mentorSubscriptionsApi.cancelSubscription(selectedSubscription.id);
      toast.success('Subscription cancelled successfully');
      
      // Refresh subscriptions
      const response = await mentorSubscriptionsApi.getMyPaidSubscriptions({});
      const subscriptionsWithSettings = await Promise.all(
        response.data.map(async (subscription) => {
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
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
      setSelectedSubscription(null);
    }
  };

  const filterSubscriptions = (status: string) => {
    if (status === 'all') return subscriptionsData;
    return subscriptionsData.filter(({ subscription }) => subscription.status === status);
  };

  const getStatusIcon = (status: PaidSubscriptionStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'pending_payment':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusCounts = () => {
    return {
      all: subscriptionsData.length,
      active: subscriptionsData.filter(({ subscription }) => subscription.status === 'active').length,
      pending_payment: subscriptionsData.filter(({ subscription }) => subscription.status === 'pending_payment').length,
      cancelled: subscriptionsData.filter(({ subscription }) => subscription.status === 'cancelled').length,
      expired: subscriptionsData.filter(({ subscription }) => subscription.status === 'expired').length,
    };
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();
  const filteredSubscriptions = filterSubscriptions(activeTab);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold mb-2">My Mentors</h1>
          <p className="text-lg text-muted-foreground">
            Manage your mentorship subscriptions and access
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({statusCounts.active})
            </TabsTrigger>
            <TabsTrigger value="pending_payment">
              Pending ({statusCounts.pending_payment})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({statusCounts.cancelled})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired ({statusCounts.expired})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {filteredSubscriptions.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  No {activeTab !== 'all' && activeTab} subscriptions
                </h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === 'all' 
                    ? "You haven't subscribed to any mentors yet"
                    : `No ${activeTab} subscriptions found`}
                </p>
                {activeTab === 'all' && (
                  <Button asChild>
                    <Link href="/mentors">
                      <Users className="h-4 w-4 mr-2" />
                      Browse Mentors
                    </Link>
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredSubscriptions.map(({ subscription, settings }) => {
                  const mentor = subscription.mentor;
                  if (!mentor) return null;

                  const mentorName = mentor.fullName || mentor.mentorProfile?.headline || 'Mentor';
                  const initials = mentorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

                  return (
                    <Card key={subscription.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Left: Mentor Info */}
                          <div className="flex items-start gap-4 flex-1">
                            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                              <AvatarImage src={mentor.avatarUrl} alt={mentorName} />
                              <AvatarFallback className="text-lg font-bold bg-primary/20 text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-xl font-semibold mb-1">{mentorName}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {mentor.mentorProfile?.headline || mentor.email}
                                  </p>
                                </div>
                                {settings && settings.accessType === 'vip' && (
                                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                    <Crown className="h-3 w-3 mr-1" />
                                    VIP
                                  </Badge>
                                )}
                              </div>

                              {/* Badges */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {settings && <MentorTypeBadge accessType={settings.accessType} />}
                                <SubscriptionStatusBadge status={subscription.status} />
                              </div>

                              {/* Subscription Details */}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground mb-1">Price</p>
                                  <PriceDisplay
                                    amount={subscription.priceAmount}
                                    currency={subscription.currency}
                                    billingPeriod={subscription.billingPeriod}
                                  />
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1">Started</p>
                                  <p className="font-medium">
                                    {format(parseISO(subscription.startsAt), 'MMM d, yyyy')}
                                  </p>
                                </div>
                                {subscription.renewsAt && subscription.status === 'active' && (
                                  <div>
                                    <p className="text-muted-foreground mb-1">Renews</p>
                                    <p className="font-medium">
                                      {format(parseISO(subscription.renewsAt), 'MMM d, yyyy')}
                                    </p>
                                  </div>
                                )}
                                {subscription.expiresAt && subscription.status !== 'active' && (
                                  <div>
                                    <p className="text-muted-foreground mb-1">Expires</p>
                                    <p className="font-medium">
                                      {format(parseISO(subscription.expiresAt), 'MMM d, yyyy')}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex flex-col gap-2 md:w-48">
                            {subscription.status === 'pending_payment' && (
                              <Button className="w-full" variant="default">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Complete Payment
                              </Button>
                            )}
                            {subscription.status === 'active' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  className="w-full"
                                  asChild
                                  disabled={!settings?.allowsMessaging}
                                >
                                  <Link href={`/messages/${subscription.mentorId}`}>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Message
                                  </Link>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="w-full"
                                  asChild
                                  disabled={!settings?.offers1to1Sessions}
                                >
                                  <Link href={`/mentors/${subscription.mentorId}?action=book`}>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Book Session
                                  </Link>
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="ghost" 
                              className="w-full"
                              asChild
                            >
                              <Link href={`/mentors/${subscription.mentorId}`}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Profile
                              </Link>
                            </Button>
                            {subscription.status === 'active' && (
                              <Button 
                                variant="destructive" 
                                className="w-full"
                                onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setShowCancelDialog(true);
                                }}
                              >
                                Cancel Subscription
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription to{' '}
              <span className="font-semibold">
                {selectedSubscription?.mentor?.fullName}
              </span>
              ? You will lose access to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Direct messaging</li>
                <li>1:1 mentorship sessions</li>
                <li>Exclusive content and courses</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
