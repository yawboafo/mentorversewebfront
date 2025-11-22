'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { 
  Clock, 
  CheckCircle2, 
  Mail, 
  Home,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function MentorPendingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already a mentor, redirect to mentor dashboard
    if (user?.role === 'mentor') {
      router.push('/mentor/dashboard');
    }
  }, [user, router]);

  const steps = [
    { icon: CheckCircle2, title: 'Application Submitted', status: 'complete' },
    { icon: Clock, title: 'Under Review', status: 'current' },
    { icon: Sparkles, title: 'Get Approved', status: 'pending' },
    { icon: CheckCircle2, title: 'Start Mentoring', status: 'pending' },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 px-4 py-12">
      {/* Animated Background */}
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-3xl"
      >
        <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-zinc-900/90">
          <CardHeader className="text-center space-y-4 pb-8">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 animate-pulse" />
                <Clock className="relative h-20 w-20 text-yellow-600 dark:text-yellow-400" />
              </div>
            </motion.div>

            <Badge variant="secondary" className="w-fit mx-auto px-6 py-2 text-base font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
              Application Pending Review
            </Badge>

            <CardTitle className="text-4xl font-extrabold">
              Your Application is Being Reviewed! 🎉
            </CardTitle>
            <CardDescription className="text-lg">
              Thank you for applying to become a mentor on MentorVerse
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Timeline */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className={`
                      flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                      ${step.status === 'complete' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-100' :
                        step.status === 'current' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-100' :
                        'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'}
                    `}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${step.status === 'current' ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                        {step.title}
                      </p>
                      {step.status === 'current' && (
                        <p className="text-sm text-muted-foreground">
                          Our team is reviewing your application
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-6 border border-purple-200 dark:border-purple-800"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                What's Next?
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Our team will review your application within <strong>48 hours</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>
                    You'll receive an email notification once your application is approved
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>
                    After approval, you'll gain access to the mentor dashboard and can start creating content
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Meanwhile, feel free to explore the platform and connect with other mentors
                  </span>
                </li>
              </ul>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button asChild className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Explore Platform
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/mentors">
                  Browse Mentors
                </Link>
              </Button>
            </motion.div>

            {/* Footer Note */}
            <p className="text-center text-sm text-muted-foreground">
              Questions? Contact us at{' '}
              <a href="mailto:support@mentorverse.com" className="text-purple-600 hover:underline">
                support@mentorverse.com
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
