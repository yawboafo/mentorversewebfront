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
import { Separator } from '@/components/ui/separator';
import { authApi } from '@/lib/api/auth';
import { SocialLoginGroup, type SocialProvider } from '@/components/auth/social-login-buttons';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { Mail, Lock, ArrowRight, GraduationCap, Users, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 Starting login process...');
      const response = await authApi.login(formData.email, formData.password);
      console.log('✅ Login successful, token stored');
      console.log('👤 User:', response.user.email, 'Role:', response.user.role, 'Onboarding:', response.user.onboarding_completed);
      
      // Verify token was stored
      const storedToken = localStorage.getItem('access_token');
      console.log('🔑 Token stored in localStorage:', storedToken ? 'YES' : 'NO');
      
      // Show success toast immediately
      toast.success('Welcome back! 🎉');
      
      // Determine redirect path based on user role and mentor status
      let redirectPath = '/dashboard';
      
      // Priority 1: Admin always goes to admin panel
      if (response.user.role === 'admin') {
        redirectPath = '/admin';
        console.log('👑 Admin user, redirecting to admin panel');
      } 
      // Priority 2: Approved mentors go to mentor dashboard
      else if (response.user.role === 'mentor') {
        redirectPath = '/mentor/dashboard';
        console.log('🎓 Approved mentor, redirecting to dashboard');
      }
      // Priority 3: Users with mentor signup intent
      else if (response.user.signup_intent === 'mentor') {
        // Check mentor status to determine routing
        const mentorStatus = response.user.mentor_status || 'none';
        
        if (mentorStatus === 'pending_approval') {
          redirectPath = '/mentor/pending';
          console.log('⏳ Mentor application pending approval');
        } else if (mentorStatus === 'none') {
          redirectPath = '/mentor/apply';
          console.log('🎓 Mentor intent, no application yet - redirecting to apply');
        } else {
          // Other statuses (suspended, etc.) - go to regular dashboard
          redirectPath = '/dashboard';
          console.log('📊 Mentor status:', mentorStatus, '- redirecting to dashboard');
        }
      }
      // Priority 4: Regular users without onboarding
      else if (!response.user.onboarding_completed) {
        redirectPath = '/onboarding';
        console.log('⚠️ Onboarding not completed, redirecting to onboarding');
      }
      // Priority 5: Regular users with onboarding complete
      else {
        redirectPath = '/dashboard';
        console.log('✅ Regular user, redirecting to dashboard');
      }
      
      console.log('🚀 Navigating to:', redirectPath);
      
      // Use window.location for full page reload (AuthProvider will load user on next page)
      window.location.href = redirectPath;
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12">
      {/* Subtle ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-950/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent dark:from-indigo-950/20" />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border border-slate-200/60 dark:border-slate-800/60 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
          <CardHeader className="space-y-3 pb-6 pt-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">MentorVerse</h1>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <CardTitle className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Welcome back
              </CardTitle>
              <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                Continue your learning journey with real mentors
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="space-y-5 pb-3">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Alert variant="destructive" className="border-l-4">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Social Login Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center">Or continue with</p>
              <SocialLoginGroup
                onProviderClick={handleSocialLogin}
                isLoading={isSocialLoading}
                loadingProvider={loadingProvider}
              />
            </motion.div>

            {/* Divider */}
            <motion.div
              className="relative py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Separator />
            </motion.div>
          </CardContent>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pb-3">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-11 text-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 text-sm"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-4 pb-6">
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-11 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Logging in...
                    </>
                  ) : (
                    'Log in'
                  )}
                </Button>
              </motion.div>
              
              <motion.div
                className="space-y-4 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                    Sign up
                  </Link>
                </p>

                <div className="relative">
                  <Separator />
                </div>

                <div className="space-y-2">
                  <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-500">Want to mentor others?</p>
                  <Link href="/mentor/join">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 gap-2 text-sm font-medium border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <Users className="h-4 w-4" />
                      I'm a mentor
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
