'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/auth';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for errors from OAuth provider
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
          throw new Error(errorDescription || `OAuth error: ${errorParam}`);
        }

        // Check if backend already redirected with tokens (direct flow)
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const intent = searchParams.get('intent');

        if (accessToken) {
          // Backend already processed OAuth and redirected with tokens
          localStorage.setItem('access_token', accessToken);
          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }
          localStorage.removeItem('oauth_intent');

          // Get user info
          const user = await authApi.getCurrentUser();

          setStatus('success');

          // Wait a moment to show success message
          setTimeout(async () => {
            // Check role first - admin and mentor skip onboarding
            if (user.role === 'admin') {
              router.push('/admin');
            } else if (user.role === 'mentor') {
              router.push('/mentor/dashboard');
            } else if (!user.onboarding_completed) {
              router.push('/onboarding');
            } else if (user.role === 'user') {
              // Check for pending mentor application
              try {
                const { mentorsApi } = await import('@/lib/api/mentors');
                const mentorStatus = await mentorsApi.checkMentorApplicationStatus();
                if (mentorStatus.hasApplication && mentorStatus.status === 'pending') {
                  router.push('/mentor/pending');
                  return;
                }
              } catch (err) {
                console.log('No pending mentor application');
              }
              router.push('/dashboard');
            } else {
              router.push('/dashboard');
            }
          }, 1500);
          return;
        }

        // Fallback: Handle code/state flow (if backend doesn't redirect directly)
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (code && state) {
          // Exchange code for tokens
          const response = await authApi.handleOAuthCallback(code, state);

          // Clear stored intent
          localStorage.removeItem('oauth_intent');

          setStatus('success');

          // Wait a moment to show success message
          setTimeout(async () => {
            // Check role first - admin and mentor skip onboarding
            if (response.user.role === 'admin') {
              router.push('/admin');
            } else if (response.user.role === 'mentor') {
              router.push('/mentor/dashboard');
            } else if (!response.user.onboarding_completed) {
              router.push('/onboarding');
            } else if (response.user.role === 'user') {
              // Check for pending mentor application
              try {
                const { mentorsApi } = await import('@/lib/api/mentors');
                const mentorStatus = await mentorsApi.checkMentorApplicationStatus();
                if (mentorStatus.hasApplication && mentorStatus.status === 'pending') {
                  router.push('/mentor/pending');
                  return;
                }
              } catch (err) {
                console.log('No pending mentor application');
              }
              router.push('/dashboard');
            } else {
              router.push('/dashboard');
            }
          }, 1500);
          return;
        }

        // No valid parameters
        throw new Error('Missing required OAuth parameters');
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Failed to complete authentication. Please try again.');
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 px-4 py-12">
      {/* Animated Background */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/80">
          <CardHeader className="text-center space-y-4">
            {status === 'loading' && (
              <>
                <motion.div
                  className="flex justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <Loader2 className="relative h-16 w-16 text-purple-600 animate-spin" />
                  </div>
                </motion.div>
                <CardTitle className="text-2xl font-extrabold">
                  Completing Sign In...
                </CardTitle>
                <CardDescription>
                  Please wait while we set up your account ✨
                </CardDescription>
              </>
            )}

            {status === 'success' && (
              <>
                <motion.div
                  className="flex justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <CheckCircle2 className="relative h-16 w-16 text-green-600" />
                  </div>
                </motion.div>
                <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Success! 🎉
                </CardTitle>
                <CardDescription>
                  Redirecting you to your dashboard...
                </CardDescription>
              </>
            )}

            {status === 'error' && (
              <>
                <motion.div
                  className="flex justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <XCircle className="h-16 w-16 text-red-600" />
                </motion.div>
                <CardTitle className="text-2xl font-extrabold text-red-600">
                  Authentication Failed
                </CardTitle>
                <CardDescription>
                  We encountered an issue signing you in
                </CardDescription>
              </>
            )}
          </CardHeader>

          {status === 'error' && (
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Link href="/auth/login" className="block">
                  <Button className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Try Again
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full">
                    Go to Homepage
                  </Button>
                </Link>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
