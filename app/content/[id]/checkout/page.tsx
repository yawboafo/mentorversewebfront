'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { contentApi } from '@/lib/api/content';
import { Content } from '@/lib/api/types';
import { PriceDisplay } from '@/components/ui/price-display';
import { 
  ShoppingCart, 
  ArrowLeft, 
  CheckCircle2, 
  Shield, 
  Lock,
  CreditCard,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id as string;
  const { user, isAuthenticated } = useAuth();

  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/content/${contentId}/checkout`);
      return;
    }

    const fetchContent = async () => {
      try {
        // Check enrollment status first
        const enrollmentStatus = await contentApi.getEnrollmentStatus(contentId);
        if (enrollmentStatus.isEnrolled) {
          toast.info('You are already enrolled in this course');
          router.push(`/content/${contentId}`);
          return;
        }

        const contentData = await contentApi.getContentById(contentId);
        setContent(contentData);
      } catch (error) {
        console.error('Failed to fetch content:', error);
        setError('Failed to load course details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [contentId, isAuthenticated, router]);

  const handleCheckout = async () => {
    if (!content) return;

    setIsProcessing(true);
    try {
      // Initialize Paystack payment
      const checkoutResponse = await contentApi.checkout({
        contentId: content.id,
      });

      // Redirect to Paystack checkout
      window.location.href = checkoutResponse.checkoutUrl;
    } catch (error: any) {
      console.error('Checkout failed:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already purchased')) {
        toast.error('You have already purchased this content');
        router.push(`/content/${contentId}`);
      } else if (error.message?.includes('not found')) {
        toast.error('Course not found');
        router.push('/content');
      } else {
        toast.error(error.message || 'Failed to initialize payment');
        setError(error.message || 'Failed to initialize payment');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground">{error || 'Course not found'}</p>
            <Button asChild>
              <Link href="/content">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const price = content.display_price || content.price || 0;
  const currency = content.display_currency || content.currency || 'USD';

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`/content/${contentId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Checkout</h1>
              <p className="text-muted-foreground">Complete your enrollment</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Course Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  {content.thumbnailUrl && (
                    <img 
                      src={content.thumbnailUrl} 
                      alt={content.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{content.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{content.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{content.contentType}</Badge>
                      <Badge variant="outline">{content.level || 'All Levels'}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Course Price</span>
                    <PriceDisplay price={price} currency={currency} />
                  </div>
                  {content.estimatedDuration && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{content.estimatedDuration}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Lifetime Access</p>
                      <p className="text-sm text-muted-foreground">Access all course materials forever</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Direct Mentor Support</p>
                      <p className="text-sm text-muted-foreground">Get help from {content.mentor.fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Certificate of Completion</p>
                      <p className="text-sm text-muted-foreground">Earn a certificate when you finish</p>
                    </div>
                  </div>
                  {content.deliveryModes?.includes('self_paced') && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Learn at Your Own Pace</p>
                        <p className="text-sm text-muted-foreground">No deadlines, learn whenever works for you</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Course Price</span>
                    <PriceDisplay price={price} currency={currency} className="text-lg font-bold" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Processing Fee</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total Due</span>
                    <PriceDisplay price={price} currency={currency} />
                  </div>
                </div>

                <Separator />

                {/* Payment Button - In production, this would show payment form */}
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full h-14 text-base font-semibold"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Complete Enrollment
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    By enrolling, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>

                <Separator />

                {/* Trust Badges */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span>Secure payment processing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
