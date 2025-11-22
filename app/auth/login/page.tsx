'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { authApi } from '@/lib/api/auth';
import { SocialLoginGroup, type SocialProvider } from '@/components/auth/social-login-buttons';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { Mail, Lock, ArrowRight, Sparkles, Shield, Users } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login(formData.email, formData.password);
      
      // Refresh user context
      await refreshUser();
      
      toast.success('Welcome back! 🎉');
      
      // Redirect based on user role and onboarding status
      if (!response.user.onboarding_completed) {
        router.push('/onboarding');
      } else if (response.user.role === 'mentor') {
        router.push('/mentor/dashboard');
      } else if (response.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    setError('');
    setIsSocialLoading(true);
    setLoadingProvider(provider);

    try {
      const response = await authApi.getOAuthUrl(provider, 'user');
      // Store intent for callback handling
      localStorage.setItem('oauth_intent', 'user');
      // Redirect to provider
      window.location.href = response.url;
    } catch (err: any) {
      setError(err.message || `Failed to initiate ${provider} login. Please try again.`);
      setIsSocialLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 px-4 py-12">
      {/* Animated Background Blobs */}
      <motion.div 
        className="absolute top-20 left-20 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl"
        animate={{ 
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400/20 dark:bg-pink-600/20 rounded-full blur-3xl"
        animate={{ 
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
          <CardHeader className="space-y-4 pb-8">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="flex justify-center"
            >
              <Badge className="px-5 py-2 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
                <Sparkles className="w-4 h-4 mr-2 inline animate-pulse" />
                Welcome back! ✨
              </Badge>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-4xl font-black text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Sign in
              </CardTitle>
              <CardDescription className="text-center text-base font-medium mt-2">
                Continue your journey with MentorVerse 🚀
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-2">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Alert variant="destructive" className="border-2">
                  <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Social Login Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <SocialLoginGroup
                onProviderClick={handleSocialLogin}
                isLoading={isSocialLoading}
                loadingProvider={loadingProvider}
              />
            </motion.div>

            {/* Divider */}
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Separator />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 px-4">
                <span className="text-sm font-semibold text-muted-foreground">or continue with email</span>
              </div>
            </motion.div>
          </CardContent>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pb-2">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="email" className="text-base font-bold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-11 h-12 text-base border-2 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base font-bold">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-semibold text-purple-600 hover:text-pink-600 transition-colors"
                  >
                    Forgot? 🤔
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 h-12 text-base border-2 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200 dark:border-purple-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Shield className="h-5 w-5 text-purple-600" />
                <p className="text-sm font-medium text-foreground/80">
                  Your data is secure and encrypted 🔒
                </p>
              </motion.div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-black rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all group" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        ⚡
                      </motion.div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in 
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.div>
              
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-center text-base font-medium text-foreground/70">
                  New here?{' '}
                  <Link href="/auth/register" className="font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text hover:from-purple-700 hover:to-pink-700 transition-all">
                    Create account →
                  </Link>
                </p>

                <div className="relative">
                  <Separator />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 px-4">
                    <span className="text-xs font-semibold text-muted-foreground">Are you a mentor?</span>
                  </div>
                </div>

                <Link href="/mentor/join">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 gap-2 border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
                  >
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="font-bold">Join as a Mentor</span>
                  </Button>
                </Link>
              </motion.div>
            </CardFooter>
          </form>
        </Card>

        <motion.p
          className="text-center mt-6 text-sm font-medium text-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Join thousands leveling up their game 🎯
        </motion.p>
      </motion.div>
    </div>
  );
}
