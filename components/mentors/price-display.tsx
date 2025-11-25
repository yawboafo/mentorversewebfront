import { BillingPeriod } from '@/lib/api/types';

interface PriceDisplayProps {
  amount: number;
  currency: string;
  billingPeriod: BillingPeriod;
  className?: string;
}

export function PriceDisplay({ amount, currency, billingPeriod, className }: PriceDisplayProps) {
  const formatPrice = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  const periodText = {
    [BillingPeriod.MONTHLY]: 'month',
    [BillingPeriod.QUARTERLY]: '3 months',
    [BillingPeriod.YEARLY]: 'year',
  };

  return (
    <span className={`font-bold ${className}`}>
      {formatPrice(amount, currency)} / {periodText[billingPeriod]}
    </span>
  );
}

interface PriceRangeProps {
  amount: number;
  currency: string;
  className?: string;
}

export function PriceRange({ amount, currency, className }: PriceRangeProps) {
  const formatPrice = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(0)}`;
    }
  };

  return (
    <span className={`font-semibold ${className}`}>
      From {formatPrice(amount, currency)}/month
    </span>
  );
}
