'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { authApi } from '@/lib/api/auth';
import { SocialLoginGroup, type SocialProvider } from '@/components/auth/social-login-buttons';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { Eye, EyeOff } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-950 dark:to-gray-900 px-4 py-12">
      <motion.div
        className="w-full max-w-[420px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">MentorVerse</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-800/60 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Jump back into your mentorship journey
            </p>
          </div>
          
          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <Alert variant="destructive" className="border-l-4">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-12 text-base rounded-xl"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-12 text-base rounded-xl pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all" 
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

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link href="/auth/register" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                Sign up
              </Link>
            </p>
          </form>

          {/* Social Login - BELOW email form */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">or</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center mb-4">
                Continue with
              </p>
              <SocialLoginGroup
                onProviderClick={handleSocialLogin}
                isLoading={isSocialLoading}
                loadingProvider={loadingProvider}
              />
            </div>
          </div>

          {/* Mentor CTA */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-center text-sm text-gray-500 dark:text-gray-500 mb-3">
              Want to mentor others?
            </p>
            <Link href="/mentor/join">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 text-sm font-medium rounded-xl border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                I'm a mentor
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
