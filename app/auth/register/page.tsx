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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { authApi } from '@/lib/api/auth';
import { SocialLoginGroup, type SocialProvider } from '@/components/auth/social-login-buttons';
import { toast } from 'sonner';
import { User, Mail, Lock, ArrowRight, Sparkles, Shield, Briefcase, UserCircle, Check, Users } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState('');
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
      const response = await authApi.register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        account_type: formData.account_type,
      });
      
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
      setError(err.message || 'Failed to create account. Please try again.');
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-cyan-950/20 dark:via-blue-950/20 dark:to-purple-950/20 px-4 py-12">
      {/* Animated Background Blobs */}
      <motion.div 
        className="absolute top-20 right-20 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-600/20 rounded-full blur-3xl"
        animate={{ 
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 left-20 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl"
        animate={{ 
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="w-full max-w-xl relative z-10"
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
              <Badge className="px-5 py-2 text-base font-bold bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-0 shadow-lg">
                <Sparkles className="w-4 h-4 mr-2 inline animate-pulse" />
                Let's get started! 🚀
              </Badge>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-4xl font-black text-center bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Create account
              </CardTitle>
              <CardDescription className="text-center text-base font-medium mt-2">
                Start your growth journey today ✨
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-5 pb-2">
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
                <span className="text-sm font-semibold text-muted-foreground">or register with email</span>
              </div>
            </motion.div>
          </CardContent>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pb-2">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="full_name" className="text-base font-bold">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-11 h-12 text-base border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 transition-all"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                <Label htmlFor="email" className="text-base font-bold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-11 h-12 text-base border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Label htmlFor="account_type" className="text-base font-bold">I'm signing up as...</Label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setFormData({ ...formData, account_type: 'individual' })}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      formData.account_type === 'individual'
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                  >
                    <UserCircle className={`h-8 w-8 mx-auto mb-2 ${
                      formData.account_type === 'individual' ? 'text-cyan-600' : 'text-muted-foreground'
                    }`} />
                    <p className="font-bold text-sm">Individual</p>
                    <p className="text-xs text-muted-foreground mt-1">Personal growth</p>
                    {formData.account_type === 'individual' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <Check className="h-5 w-5 text-cyan-600" />
                      </motion.div>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setFormData({ ...formData, account_type: 'business' })}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      formData.account_type === 'business'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                  >
                    <Briefcase className={`h-8 w-8 mx-auto mb-2 ${
                      formData.account_type === 'business' ? 'text-blue-600' : 'text-muted-foreground'
                    }`} />
                    <p className="font-bold text-sm">Business</p>
                    <p className="text-xs text-muted-foreground mt-1">Team development</p>
                    {formData.account_type === 'business' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <Check className="h-5 w-5 text-blue-600" />
                      </motion.div>
                    )}
                  </motion.button>
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Label htmlFor="password" className="text-base font-bold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 h-12 text-base border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-2"
                  >
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
                    <span className="text-xs font-semibold">
                      {passwordStrength === 'strong' ? '💪 Strong' :
                       passwordStrength === 'medium' ? '👍 Good' : '🔐 Weak'}
                    </span>
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Label htmlFor="confirmPassword" className="text-base font-bold">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 h-12 text-base border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 transition-all"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <Check className="h-5 w-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Shield className="h-5 w-5 text-cyan-600" />
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
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-black rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all group" 
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account 
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.div>
              
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <p className="text-center text-base font-medium text-foreground/70">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-black text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text hover:from-cyan-700 hover:to-blue-700 transition-all">
                    Sign in →
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
                    className="w-full h-12 gap-2 border-2 border-cyan-200 hover:border-cyan-500 hover:bg-cyan-50 transition-all"
                  >
                    <Users className="h-5 w-5 text-cyan-600" />
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
          transition={{ delay: 1.1 }}
        >
          Join thousands already on their growth journey 🌟
        </motion.p>
      </motion.div>
    </div>
  );
}
