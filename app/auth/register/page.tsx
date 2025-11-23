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
import { Briefcase, UserCircle, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    account_type: 'individual' as 'individual' | 'business',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match 🚫');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long 🔐');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Sending registration data:', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        account_type: formData.account_type,
      });
      
      const response = await authApi.register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        account_type: formData.account_type,
        signup_intent: 'user',
      });
      
      // Refresh user context
      await refreshUser();
      
      toast.success('Account created successfully! 🎉');
      
      // Redirect based on onboarding status
      if (!response.user.onboarding_completed) {
        router.push('/onboarding');
      } else if (response.user.role === 'mentor') {
        router.push('/mentor/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        errors: err.errors
      });
      
      // Display more detailed error message
      let errorMessage = '';
      if (err.errors) {
        const errorMessages = Object.entries(err.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('; ');
        errorMessage = errorMessages;
        setError(errorMessages);
      } else {
        errorMessage = err.message || 'Failed to create account. Please try again.';
        setError(errorMessage);
      }
      
      toast.error(errorMessage);
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
      setError(err.message || `Failed to initiate ${provider} sign up. Please try again.`);
      setIsSocialLoading(false);
      setLoadingProvider(null);
    }
  };

  const passwordStrength = formData.password.length >= 8 ? 'strong' : formData.password.length >= 6 ? 'medium' : 'weak';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-950 dark:to-gray-900 px-4 py-12">
      <motion.div
        className="w-full max-w-[420px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-800/60 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create your account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Learn from real mentors and level up your life
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
              <Label htmlFor="full_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Full name
              </Label>
              <Input
                id="full_name"
                type="text"
                placeholder="John Doe"
                className="h-12 text-base rounded-xl"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

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
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Account type
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  onClick={() => setFormData({ ...formData, account_type: 'individual' })}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    formData.account_type === 'individual'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                >
                  <UserCircle className={`h-8 w-8 mx-auto mb-2 ${
                    formData.account_type === 'individual' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className={`font-semibold text-sm ${
                    formData.account_type === 'individual' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
                  }`}>Individual</p>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setFormData({ ...formData, account_type: 'business' })}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    formData.account_type === 'business'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                >
                  <Briefcase className={`h-8 w-8 mx-auto mb-2 ${
                    formData.account_type === 'business' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className={`font-semibold text-sm ${
                    formData.account_type === 'business' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
                  }`}>Business</p>
                </motion.button>
              </div>
            </div>
              
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
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
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2"
                >
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${
                        passwordStrength === 'strong' ? 'bg-green-500' :
                        passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: passwordStrength === 'strong' ? '100%' :
                               passwordStrength === 'medium' ? '66%' : '33%'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {passwordStrength === 'strong' ? 'Strong' :
                     passwordStrength === 'medium' ? 'Good' : 'Weak'}
                  </span>
                </motion.div>
              )}
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
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </motion.div>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                Log in
              </Link>
            </p>
          </form>

          {/* Social Sign Up - BELOW email form */}
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
                Sign up with
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
