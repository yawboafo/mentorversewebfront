'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { authApi } from '@/lib/api/auth';
import { CheckCircle, Mail, ArrowRight, Key, Sparkles, Shield } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
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
            <CardHeader className="text-center space-y-4">
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
                  <CheckCircle className="relative h-16 w-16 text-green-500" strokeWidth={2} />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Check your email! 📧
                </CardTitle>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <CardDescription className="text-base">
                  We've sent a password reset link to
                  <br />
                  <strong className="text-green-600">{email}</strong>
                </CardDescription>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-2"
              >
                <Badge variant="secondary" className="gap-2 px-4 py-2 text-sm">
                  <Mail className="h-4 w-4" />
                  Check your inbox & spam folder
                </Badge>
              </motion.div>
            </CardHeader>
            
            <CardFooter className="flex justify-center pb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button asChild size="lg" className="gap-2">
                  <Link href="/auth/login">
                    <ArrowRight className="h-4 w-4" />
                    Back to login
                  </Link>
                </Button>
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 overflow-hidden">
      {/* Animated background - Orange/Amber theme */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-amber-500/20 to-yellow-500/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-orange-500/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/30 rounded-full blur-3xl"
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
                Password Recovery 🔑
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Forgot password?
              </CardTitle>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CardDescription className="text-base">
                No worries! Enter your email and we'll send you a reset link ✨
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
                <Label htmlFor="email" className="text-base font-semibold">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-11 h-12 text-base border-2 focus:border-orange-500"
                  />
                </div>
              </motion.div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          ✉️
                        </motion.div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="w-full"
              >
                <Button asChild variant="ghost" className="w-full h-11 text-base">
                  <Link href="/auth/login">← Back to login</Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="pt-2"
              >
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure password recovery</span>
                </div>
              </motion.div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
