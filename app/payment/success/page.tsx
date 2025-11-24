'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { purchasesApi, Purchase } from '@/lib/api/purchases';

type VerificationStatus = 'verifying' | 'pending' | 'success' | 'error';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const { isAuthenticated } = useAuth();
  
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!reference) {
      setStatus('error');
      return;
    }

    verifyPayment(reference);
  }, [reference, isAuthenticated, router]);

  const verifyPayment = async (ref: string) => {
    try {
      // Get user purchases to verify payment status
      const purchases = await purchasesApi.getMyPurchases();
      const matchingPurchase = purchases.find((p: Purchase) => p.id === ref);

      if (matchingPurchase) {
        setPurchase(matchingPurchase);

        if (matchingPurchase.status === 'paid') {
          setStatus('success');
          // Redirect to content after 3 seconds
          setTimeout(() => {
            router.push(`/content/${matchingPurchase.contentId}`);
          }, 3000);
        } else if (matchingPurchase.status === 'pending') {
          setStatus('pending');
          // Retry after 3 seconds, max 10 retries (30 seconds total)
          if (retryCount < 10) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              verifyPayment(ref);
            }, 3000);
          } else {
            // After 10 retries, show success but with pending message
            setStatus('success');
          }
        } else {
          setStatus('error');
        }
      } else {
        // Purchase not found yet, retry
        setStatus('pending');
        if (retryCount < 10) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            verifyPayment(ref);
          }, 3000);
        } else {
          setStatus('error');
        }
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          {/* Verifying */}
          {status === 'verifying' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Verifying Payment</h2>
                <p className="text-muted-foreground">
                  Please wait while we confirm your payment...
                </p>
              </div>
            </>
          )}

          {/* Pending */}
          {status === 'pending' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mx-auto">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Processing Payment</h2>
                <p className="text-muted-foreground">
                  Your payment is being processed. This may take a few moments...
                </p>
                <p className="text-sm text-muted-foreground">
                  Retry {retryCount} of 10
                </p>
              </div>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Payment Successful!</h2>
                <p className="text-muted-foreground">
                  {purchase?.status === 'paid' 
                    ? "Your enrollment is complete. Redirecting to your course..."
                    : "Your payment is being processed. You'll receive confirmation shortly."}
                </p>
                {purchase?.content && (
                  <p className="text-sm font-medium text-primary mt-4">
                    {purchase.content.title}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {purchase?.contentId && (
                  <Button asChild size="lg">
                    <Link href={`/content/${purchase.contentId}`}>
                      Go to Course
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mx-auto">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Verification Failed</h2>
                <p className="text-muted-foreground">
                  We couldn't verify your payment. Please check your purchases or contact support.
                </p>
                {reference && (
                  <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                    Reference: {reference}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={() => window.location.reload()} size="lg">
                  Try Again
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">View Purchases</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Loading...</h2>
              <p className="text-muted-foreground">Please wait...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
