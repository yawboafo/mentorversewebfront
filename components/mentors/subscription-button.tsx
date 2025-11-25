'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { MentorAccessType, MentorAccessStatus, PaidSubscriptionStatus } from '@/lib/api/types';
import { mentorSubscriptionsApi } from '@/lib/api/mentor-subscriptions';

interface SubscriptionButtonProps {
  mentorId: string;
  mentorName: string;
  accessType: MentorAccessType;
  accessStatus?: MentorAccessStatus;
  price?: number;
  currency?: string;
  onSubscribeSuccess?: () => void;
  className?: string;
}

export function SubscriptionButton({
  mentorId,
  mentorName,
  accessType,
  accessStatus,
  price,
  currency = 'USD',
  onSubscribeSuccess,
  className,
}: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSubscribed = accessStatus?.hasActiveSubscription;
  const isPending = accessStatus?.subscriptionStatus === PaidSubscriptionStatus.PENDING_PAYMENT;

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await mentorSubscriptionsApi.subscribeToPaidMentor(mentorId);

      if (result.requiresPayment && result.checkoutUrl) {
        // Redirect to payment
        window.location.href = result.checkoutUrl;
      } else {
        // Free subscription or already paid
        if (onSubscribeSuccess) {
          onSubscribeSuccess();
        } else {
          window.location.reload();
        }
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to subscribe';
      setError(errorMessage);
      console.error('Subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Already subscribed
  if (isSubscribed) {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          size="lg"
          disabled
          className={`w-full ${className}`}
        >
          <span className="mr-2">✅</span>
          Subscribed
        </Button>
      </div>
    );
  }

  // Pending payment
  if (isPending) {
    return (
      <div className="space-y-2">
        <Button
          size="lg"
          onClick={handleSubscribe}
          disabled={loading}
          className={`w-full bg-orange-600 hover:bg-orange-700 ${className}`}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <span className="mr-2">⏳</span>
              Complete Payment
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Your subscription is pending payment
        </p>
      </div>
    );
  }

  // Open/Free mentor
  if (accessType === MentorAccessType.OPEN) {
    return (
      <div className="space-y-2">
        <Button
          size="lg"
          onClick={handleSubscribe}
          disabled={loading}
          className={`w-full bg-green-600 hover:bg-green-700 ${className}`}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Subscribing...
            </>
          ) : (
            <>
              <span className="mr-2">✨</span>
              Subscribe (Free)
            </>
          )}
        </Button>
        {error && (
          <p className="text-xs text-center text-destructive">{error}</p>
        )}
      </div>
    );
  }

  // Paid/VIP mentor
  const buttonText =
    accessType === MentorAccessType.VIP
      ? `Apply to work with ${mentorName.split(' ')[0]}`
      : price
      ? `Subscribe for ${currency} ${price}/month`
      : 'Subscribe';

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        onClick={handleSubscribe}
        disabled={loading}
        className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <span className="mr-2">{accessType === MentorAccessType.VIP ? '👑' : '💎'}</span>
            {buttonText}
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-center text-destructive">{error}</p>
      )}
    </div>
  );
}
