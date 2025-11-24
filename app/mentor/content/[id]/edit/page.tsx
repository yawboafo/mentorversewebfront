'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRequireRole } from '@/hooks/use-require-auth';
import { contentApi } from '@/lib/api/content';
import { ContentForm } from '@/components/content/content-form';
import type { Content } from '@/lib/api/types';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditContentPage() {
  const router = useRouter();
  const params = useParams();
  const contentId = params.id as string;
  const { user, isLoading: authLoading } = useRequireRole(['mentor', 'admin']);
  
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!contentId) return;
    
    const loadContent = async () => {
      try {
        setIsLoading(true);
        const data = await contentApi.getContentById(contentId);
        setContent(data);
      } catch (error: any) {
        console.error('Failed to load content:', error);
        toast.error('Failed to load content');
        router.push('/mentor/content');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [contentId, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Content not found</p>
          </CardContent>
        </Card>
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
        <div className="flex items-center gap-4 mb-8">
          <Link href="/mentor/content">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Content</h1>
            <p className="text-muted-foreground mt-1">
              Update your content, modules, resources, and more
            </p>
          </div>
        </div>

        {/* Content Form */}
        <ContentForm
          mode="edit"
          initialData={content}
          onSuccess={() => router.push('/mentor/content')}
        />
      </motion.div>
    </div>
  );
}
