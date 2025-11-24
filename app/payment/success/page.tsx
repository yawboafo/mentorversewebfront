'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight, Play } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { purchasesApi, Purchase } from '@/lib/api/purchases';

type VerificationStatus = 'verifying' | 'pending' | 'success' | 'error';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Wait for auth to load before checking authentication
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!reference) {
      setStatus('error');
      return;
    }

    verifyPayment(reference);
  }, [reference, isAuthenticated, authLoading, router]);

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-xl border-2">
        <CardContent className="pt-8 space-y-6">
          {/* Verifying */}
          {status === 'verifying' && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Verifying Payment</h2>
                <p className="text-muted-foreground">
                  Please wait while we confirm your payment...
                </p>
              </div>
            </div>
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
            <div className="space-y-8">
              {/* Success Icon & Message */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mx-auto animate-in zoom-in duration-300">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">You're in!</h1>
                  <p className="text-xl text-muted-foreground">
                    {purchase?.content?.title && `Welcome to ${purchase.content.title}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your journey starts now
                  </p>
                </div>
              </div>

              {/* Course Preview Card */}
              {purchase?.content && (
                <div className="bg-muted/50 rounded-xl p-6 space-y-4 border-2 border-dashed">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{purchase.content.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {purchase.content.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Learn at your pace</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-4">
                    Ready to begin?
                  </p>
                </div>
                
                {/* Primary CTA */}
                {purchase?.contentId && (
                  <Button asChild size="lg" className="w-full text-lg h-14 shadow-lg">
                    <Link href={`/content/${purchase.contentId}`}>
                      <Play className="mr-2 h-5 w-5" />
                      Start Your First Lesson
                    </Link>
                  </Button>
                )}

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="h-12">
                    <Link href="/dashboard">
                      View Dashboard
                    </Link>
                  </Button>
                  {purchase?.contentId && (
                    <Button asChild variant="outline" className="h-12">
                      <Link href={`/content/${purchase.contentId}`}>
                        View Syllabus
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Confirmation Note */}
              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <p>Receipt sent to your email • Access anytime from your dashboard</p>
              </div>
            </div>
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
