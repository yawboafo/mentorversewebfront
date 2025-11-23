'use client';

import { formatPriceWithOriginal } from '@/lib/utils/currency';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PriceDisplayProps {
  price: number;
  currency: string;
  basePrice?: number;
  baseCurrency?: string;
  conversionRate?: number;
  conversionDate?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOriginal?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    display: 'text-lg font-semibold',
    original: 'text-xs',
  },
  md: {
    display: 'text-2xl font-bold',
    original: 'text-sm',
  },
  lg: {
    display: 'text-3xl font-bold',
    original: 'text-sm',
  },
  xl: {
    display: 'text-4xl font-bold',
    original: 'text-base',
  },
};

/**
 * PriceDisplay Component
 * 
 * Displays price with support for currency conversion.
 * Shows original price when converted and provides conversion details.
 */
export function PriceDisplay({
  price,
  currency,
  basePrice,
  baseCurrency,
  conversionRate,
  conversionDate,
  size = 'md',
  showOriginal = true,
  className = '',
}: PriceDisplayProps) {
  const formatted = formatPriceWithOriginal(
    price,
    currency,
    basePrice,
    baseCurrency,
    showOriginal
  );

  const classes = sizeClasses[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div>
        {/* Display price (converted to user's currency) */}
        <p className={classes.display}>{formatted.display}</p>

        {/* Show original price if converted */}
        {formatted.isConverted && formatted.original && (
          <p className={`${classes.original} text-muted-foreground mt-1`}>
            Original: {formatted.original}
          </p>
        )}
      </div>

      {/* Conversion info tooltip */}
      {formatted.isConverted && conversionRate && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="space-y-1 text-sm">
                <p className="font-medium">Currency Conversion</p>
                <p>
                  Rate: 1 {baseCurrency} = {conversionRate.toFixed(4)} {currency}
                </p>
                {conversionDate && (
                  <p className="text-xs text-muted-foreground">
                    Updated: {new Date(conversionDate).toLocaleDateString()}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Price automatically converted to your local currency
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

/**
 * Compact price display without original price
 */
export function PriceDisplayCompact({
  price,
  currency,
  className = '',
}: {
  price: number;
  currency: string;
  className?: string;
}) {
  const formatted = formatPriceWithOriginal(price, currency, undefined, undefined, false);
  
  return (
    <span className={`font-semibold ${className}`}>
      {formatted.display}
    </span>
  );
}
