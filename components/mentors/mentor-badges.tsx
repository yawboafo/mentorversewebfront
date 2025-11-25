import { MentorAccessType, PaidSubscriptionStatus } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';

interface MentorTypeBadgeProps {
  accessType: MentorAccessType;
  className?: string;
}

export function MentorTypeBadge({ accessType, className }: MentorTypeBadgeProps) {
  const config = {
    [MentorAccessType.OPEN]: {
      label: 'Open Mentor',
      color: 'bg-green-500/10 text-green-700 border-green-500/20',
      icon: '✨',
    },
    [MentorAccessType.PAID]: {
      label: 'Premium Mentor',
      color: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
      icon: '💎',
    },
    [MentorAccessType.VIP]: {
      label: 'VIP Mentor',
      color: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
      icon: '👑',
    },
  };

  const { label, color, icon } = config[accessType];

  return (
    <Badge className={`${color} ${className}`}>
      <span className="mr-1">{icon}</span>
      {label}
    </Badge>
  );
}

interface SubscriptionStatusBadgeProps {
  status: PaidSubscriptionStatus;
  className?: string;
}

export function SubscriptionStatusBadge({ status, className }: SubscriptionStatusBadgeProps) {
  const config = {
    [PaidSubscriptionStatus.ACTIVE]: {
      label: 'Subscribed',
      color: 'bg-green-500/10 text-green-700 border-green-500/20',
      icon: '✅',
    },
    [PaidSubscriptionStatus.PENDING_PAYMENT]: {
      label: 'Payment Pending',
      color: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
      icon: '⏳',
    },
    [PaidSubscriptionStatus.CANCELLED]: {
      label: 'Cancelled',
      color: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
      icon: '❌',
    },
    [PaidSubscriptionStatus.EXPIRED]: {
      label: 'Expired',
      color: 'bg-red-500/10 text-red-700 border-red-500/20',
      icon: '⛔',
    },
  };

  const { label, color, icon } = config[status];

  return (
    <Badge className={`${color} ${className}`}>
      <span className="mr-1">{icon}</span>
      {label}
    </Badge>
  );
}
