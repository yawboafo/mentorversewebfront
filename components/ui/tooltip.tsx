'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
}

export const TooltipProvider = ({ children }: TooltipProps) => <>{children}</>;

interface TooltipRootProps {
  children: React.ReactNode;
}

export const Tooltip = ({ children }: TooltipRootProps) => {
  return <div className="relative inline-block">{children}</div>;
};

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ asChild, children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('group', className)} {...props}>
        {children}
      </div>
    );
  }
);
TooltipTrigger.displayName = 'TooltipTrigger';

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, children, sideOffset = 4, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-50 invisible group-hover:visible',
          'bottom-full left-1/2 -translate-x-1/2 mb-2',
          'overflow-hidden rounded-md bg-primary px-3 py-2',
          'text-xs text-primary-foreground shadow-md',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          className
        )}
        style={{ marginBottom: `${sideOffset}px` }}
        {...props}
      >
        {children}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary" />
      </div>
    );
  }
);
TooltipContent.displayName = 'TooltipContent';
