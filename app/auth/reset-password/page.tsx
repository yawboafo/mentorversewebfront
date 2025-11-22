'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { authApi } from '@/lib/api/auth';
import { CheckCircle, Lock, ArrowRight, Key, Check, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 33, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 10) return { strength: 66, label: 'Medium', color: 'bg-yellow-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword(token, formData.password);
      setSuccess(true);
      toast.success('Password reset successfully!');
      
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 overflow-hidden">
        {/* Animated background - Green/Emerald theme for success */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-green-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/80">
            <CardHeader className="text-center space-y-4 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <CheckCircle className="relative h-20 w-20 text-green-500" strokeWidth={2} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  All set! 🎉
                </CardTitle>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <CardDescription className="text-base">
                  Your password has been reset successfully!
                  <br />
                  <span className="text-green-600 font-semibold">Redirecting you to login...</span>
                </CardDescription>
              </motion.div>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 overflow-hidden">
      {/* Animated background - Blue/Indigo theme */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-violet-500/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/80">
          <CardHeader className="space-y-4">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <Badge variant="secondary" className="w-fit gap-2 px-3 py-1.5">
                <Key className="h-4 w-4" />
                Create New Password 🔐
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Reset your password
              </CardTitle>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CardDescription className="text-base">
                Choose a strong password to secure your account ✨
              </CardDescription>
            </motion.div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-base font-semibold">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading || !token}
                    className="pl-11 pr-11 h-12 text-base border-2 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className={`font-semibold ${passwordStrength.strength === 100 ? 'text-green-600' : passwordStrength.strength === 66 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${passwordStrength.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength.strength}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="confirmPassword" className="text-base font-semibold">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    disabled={isLoading || !token}
                    className="pl-11 pr-11 h-12 text-base border-2 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  {passwordsMatch && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute right-12 top-1/2 -translate-y-1/2"
                    >
                      <Check className="h-5 w-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 gap-2"
                    disabled={isLoading || !token}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          🔄
                        </motion.div>
                        Resetting...
                      </>
                    ) : (
                      <>
                        Reset password
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="w-full"
              >
                <Button asChild variant="ghost" className="w-full h-11 text-base">
                  <Link href="/auth/login">← Back to login</Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-2"
              >
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure & encrypted</span>
                </div>
              </motion.div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-200px)] items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
