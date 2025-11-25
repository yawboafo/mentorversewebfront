'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, MessageCircle, Video, BookOpen, Users } from 'lucide-react';
import { MentorAccessType, MentorSettings, MentorAccessStatus } from '@/lib/api/types';
import { MentorTypeBadge } from './mentor-badges';
import { PriceDisplay } from './price-display';
import { SubscriptionButton } from './subscription-button';

interface MentorAccessCardProps {
  mentorId: string;
  mentorName: string;
  settings: MentorSettings;
  accessStatus?: MentorAccessStatus | null;
  isLoading?: boolean;
  onSubscribeSuccess?: () => void;
}

export function MentorAccessCard({
  mentorId,
  mentorName,
  settings,
  accessStatus,
  isLoading = false,
  onSubscribeSuccess,
}: MentorAccessCardProps) {
  
  if (isLoading) {
    return (
      <Card className="border-2 border-primary/20 shadow-xl overflow-hidden" data-subscription-card>
        <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
        <CardContent className="p-8 space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-40" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }
  const benefits = [];

  if (settings.allowsMessaging) {
    benefits.push({
      icon: <MessageCircle className="h-5 w-5" />,
      text: 'Direct messaging',
      available: true,
    });
  }

  if (settings.offers1to1Sessions) {
    benefits.push({
      icon: <Video className="h-5 w-5" />,
      text: '1:1 mentoring sessions',
      available: true,
    });
  }

  if (settings.offersGroupSessions) {
    benefits.push({
      icon: <Users className="h-5 w-5" />,
      text: 'Group mentoring calls',
      available: true,
    });
  }

  if (settings.offersCourses) {
    benefits.push({
      icon: <BookOpen className="h-5 w-5" />,
      text: 'Exclusive courses & resources',
      available: true,
    });
  }

  return (
    <Card className="border-2 border-primary/20 shadow-xl overflow-hidden" data-subscription-card>
      <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
      <CardContent className="p-8 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <MentorTypeBadge accessType={settings.accessType} />
          <h3 className="text-2xl font-bold text-foreground">
            Work with {mentorName.split(' ')[0]}
          </h3>
          
          {settings.accessType !== MentorAccessType.OPEN && settings.baseSubscriptionPrice && (
            <div className="flex items-baseline gap-2">
              <PriceDisplay
                amount={settings.baseSubscriptionPrice}
                currency={settings.currency}
                billingPeriod={settings.billingPeriod}
                className="text-2xl text-primary"
              />
            </div>
          )}
        </div>

        {/* Benefits */}
        {benefits.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              What you get:
            </p>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {benefit.icon}
                  </div>
                  <span className="text-foreground font-medium">{benefit.text}</span>
                  <CheckCircle2 className="h-5 w-5 text-green-600 ml-auto" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Message limit info */}
        {settings.messageLimitPerPeriod && settings.allowsMessaging && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-700">
              💬 {settings.messageLimitPerPeriod} messages per {settings.billingPeriod.replace('ly', '')}
            </p>
          </div>
        )}

        {/* Subscribe Button */}
        <SubscriptionButton
          mentorId={mentorId}
          mentorName={mentorName}
          accessType={settings.accessType}
          accessStatus={accessStatus || undefined}
          price={settings.baseSubscriptionPrice}
          currency={settings.currency}
          onSubscribeSuccess={onSubscribeSuccess}
        />

        {/* Additional info for VIP */}
        {settings.accessType === MentorAccessType.VIP && (
          <p className="text-xs text-center text-muted-foreground">
            VIP mentors review applications before accepting subscribers
          </p>
        )}

        {/* Free access info */}
        {settings.accessType === MentorAccessType.OPEN && (
          <p className="text-xs text-center text-muted-foreground">
            This mentor offers free access to all features
          </p>
        )}
      </CardContent>
    </Card>
  );
}
