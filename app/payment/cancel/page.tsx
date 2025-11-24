'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 mx-auto">
            <XCircle className="h-8 w-8 text-orange-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Payment Cancelled</h2>
            <p className="text-muted-foreground">
              Your payment was cancelled. No charges were made to your account.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg text-left space-y-2">
            <p className="text-sm font-medium">What happened?</p>
            <p className="text-sm text-muted-foreground">
              You closed the payment window or cancelled the transaction. 
              Your course selection is still available if you'd like to try again.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              size="lg" 
              onClick={() => window.history.back()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button asChild variant="outline">
              <Link href="/content">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse Courses
              </Link>
            </Button>

            <Button asChild variant="ghost">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Need help? <Link href="/support" className="text-primary hover:underline">Contact Support</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
