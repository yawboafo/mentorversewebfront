'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/hooks/use-auth';
import { SocialLoginGroup, type SocialProvider } from '@/components/auth/social-login-buttons';
import { toast } from 'sonner';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Globe, 
  Award,
  Zap,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon
} from 'lucide-react';

export default function MentorJoinPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleEmailRegister = async (e: React.FormEvent) => {
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
      // Register as mentor (backend will set role to 'user' initially, needs mentor application)
      const response = await authApi.register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        account_type: 'individual',
      });
      
      await refreshUser();
      toast.success('Account created! Please complete your mentor application 🎉');
      
      // Redirect to mentor application page
      router.push('/mentor/apply');
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.errors 
        ? Object.entries(err.errors).map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`).join('; ')
        : err.message || 'Failed to create account. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    setError('');
    setIsLoading(true);
    setLoadingProvider(provider);

    try {
      const response = await authApi.getOAuthUrl(provider, 'mentor');
      // Store intent for callback handling
      localStorage.setItem('oauth_intent', 'mentor');
      // Redirect to provider
      window.location.href = response.url;
    } catch (err: any) {
      setError(err.message || `Failed to initiate ${provider} login. Please try again.`);
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Earn While You Share',
      description: 'Set your own rates and monetize your expertise',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Build Your Community',
      description: 'Connect with motivated learners worldwide',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Award,
      title: 'Establish Authority',
      description: 'Become a recognized expert in your field',
      color: 'from-orange-500 to-yellow-500'
    },
    {
      icon: Globe,
      title: 'Flexible Schedule',
      description: 'Mentor on your time, from anywhere',
      color: 'from-green-500 to-emerald-500'
    },
  ];

  const features = [
    'One-click sign up with social login',
    'Complete your profile in under 5 minutes',
    'Start earning immediately after approval',
    'No subscription fees, only performance-based',
    'Access to thousands of eager learners',
    'Professional mentor dashboard & analytics',
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/auth/login">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Benefits & Features */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Badge variant="secondary" className="gap-2 px-4 py-2 text-base">
                <Zap className="h-5 w-5" />
                Fast Track to Mentorship ⚡
              </Badge>

              <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Join as a Mentor
              </h1>

              <p className="text-xl text-muted-foreground">
                Share your expertise, inspire others, and earn while making an impact. Sign up in seconds with your social account.
              </p>
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative group"
                >
                  <Card className="h-full border-2 hover:border-purple-500 transition-all backdrop-blur-sm bg-white/80">
                    <CardContent className="pt-6">
                      <div className={`mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${benefit.color}`}>
                        <benefit.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <h3 className="text-2xl font-bold">What You Get</h3>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-base">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sign Up Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:sticky lg:top-8"
          >
            <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/90">
              <CardHeader className="space-y-4 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  <Badge variant="secondary" className="gap-2 px-4 py-2 text-base">
                    <Sparkles className="h-5 w-5" />
                    Get Started in 60 Seconds ✨
                  </Badge>
                </motion.div>

                <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Join as a Mentor
                </CardTitle>

                <CardDescription className="text-base">
                  Sign up with social or create an account
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Tabs defaultValue="social" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="social">Social Login</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="social" className="space-y-4 mt-6">
                    <SocialLoginGroup
                      onProviderClick={handleSocialLogin}
                      isLoading={isLoading}
                      loadingProvider={loadingProvider}
                    />
                  </TabsContent>
                  
                  <TabsContent value="email" className="space-y-4 mt-6">
                    <form onSubmit={handleEmailRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="full_name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="pl-10"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="pl-10"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="pl-10"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="pl-10"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="space-y-4 pt-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-600" />
                      What happens next?
                    </h4>
                    <ol className="text-sm space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-purple-600">1.</span>
                        <span>Sign in with your preferred social account</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-purple-600">2.</span>
                        <span>Complete your mentor profile (5 min)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-purple-600">3.</span>
                        <span>Get approved by our team (within 48hrs)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-purple-600">4.</span>
                        <span>Start mentoring and earning! 🎉</span>
                      </li>
                    </ol>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </CardContent>

              <CardFooter>
                <p className="text-center text-sm text-muted-foreground w-full">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-bold text-purple-600 hover:text-pink-600 transition-colors">
                    Sign in →
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
