'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRequireRole } from '@/hooks/use-require-auth';
import { ContentForm } from '@/components/content/content-form';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CreateContentPage() {
  const { user, isLoading: authLoading } = useRequireRole(['mentor', 'admin']);
  const router = useRouter();

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/mentor/content">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Content</h1>
              <p className="text-muted-foreground mt-1">
                Build engaging courses and frameworks manually
              </p>
            </div>
          </div>
          <Link href="/mentor/ai-builder">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Use AI Builder
            </Button>
          </Link>
        </div>

        {/* Content Form */}
        <ContentForm
          mode="create"
          onSuccess={() => router.push('/mentor/content')}
        />
      </motion.div>
    </div>
  );
}
