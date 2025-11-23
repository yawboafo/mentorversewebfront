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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { authApi } from '@/lib/api/auth';
import { SocialLoginGroup, type SocialProvider } from '@/components/auth/social-login-buttons';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { User, Mail, Lock, ArrowRight, Briefcase, UserCircle, Check, Users, GraduationCap, Eye, EyeOff } from 'lucide-react';

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-green-50/30 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12">
      {/* Subtle ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-100/40 via-transparent to-transparent dark:from-green-950/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-950/20" />

      <motion.div
        className="w-full max-w-xl relative z-10"
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
                <GraduationCap className="h-8 w-8 text-green-600" />
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
                Create your account
              </CardTitle>
              <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                Join as a learner or business and start learning from real mentors
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
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center">Or sign up with</p>
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
            <CardContent className="space-y-4 pb-3">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Label htmlFor="full_name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10 h-11 text-sm"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                transition={{ delay: 0.7 }}
              >
                <Label htmlFor="account_type" className="text-sm font-medium text-slate-700 dark:text-slate-300">Account type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setFormData({ ...formData, account_type: 'individual' })}
                    className={`relative p-3 rounded-lg border transition-all ${
                      formData.account_type === 'individual'
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                  >
                    <UserCircle className={`h-6 w-6 mx-auto mb-1.5 ${
                      formData.account_type === 'individual' ? 'text-green-600' : 'text-slate-400'
                    }`} />
                    <p className="font-semibold text-xs">Individual</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Personal growth</p>
                    {formData.account_type === 'individual' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </motion.div>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setFormData({ ...formData, account_type: 'business' })}
                    className={`relative p-3 rounded-lg border transition-all ${
                      formData.account_type === 'business'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                  >
                    <Briefcase className={`h-6 w-6 mx-auto mb-1.5 ${
                      formData.account_type === 'business' ? 'text-blue-600' : 'text-slate-400'
                    }`} />
                    <p className="font-semibold text-xs">Business</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Team development</p>
                    {formData.account_type === 'business' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <Check className="h-4 w-4 text-blue-600" />
                      </motion.div>
                    )}
                  </motion.button>
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</Label>
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
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
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
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {passwordStrength === 'strong' ? 'Strong' :
                       passwordStrength === 'medium' ? 'Good' : 'Weak'}
                    </span>
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 text-sm"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-10 top-1/2 -translate-y-1/2"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-4 pb-6">
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-11 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all" 
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
              
              <motion.div
                className="space-y-4 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors">
                    Log in
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
