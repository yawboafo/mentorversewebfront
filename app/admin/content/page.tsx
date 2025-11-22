'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireRole } from '@/hooks/use-require-auth';
import { contentApi } from '@/lib/api/content';
import { adminApi } from '@/lib/api/admin';
import type { Content } from '@/lib/api/types';
import { toast } from 'sonner';
import { 
  Shield,
  ArrowLeft,
  Loader2,
  Archive,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminContentPage() {
  const { user, isLoading: authLoading } = useRequireRole(['admin']);
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user]);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const response = await contentApi.getContent({ limit: 50 });
      setContent(response.data || []);
    } catch (err: any) {
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (contentId: string) => {
    if (!confirm('Archive this content? It will no longer be visible to users.')) {
      return;
    }

    setProcessingId(contentId);
    try {
      await adminApi.updateContentStatus(contentId, 'archived');
      toast.success('Content archived');
      setContent(prev => prev.map(item => 
        item.id === contentId ? { ...item, status: 'archived' } : item
      ));
    } catch (err: any) {
      toast.error('Failed to archive content');
    } finally {
      setProcessingId(null);
    }
  };

  const handlePublish = async (contentId: string) => {
    setProcessingId(contentId);
    try {
      await adminApi.updateContentStatus(contentId, 'published');
      toast.success('Content published');
      setContent(prev => prev.map(item => 
        item.id === contentId ? { ...item, status: 'published' } : item
      ));
    } catch (err: any) {
      toast.error('Failed to publish content');
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Panel
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Content Moderation</h1>
            <p className="text-muted-foreground mt-1">
              Manage and moderate platform content
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : content.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-bold mb-2">No Content Yet</h3>
          <p className="text-muted-foreground">
            Content will appear here once mentors start creating courses
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground opacity-50" />
                  </div>
                )}
                <Badge 
                  className="absolute top-2 right-2"
                  variant={item.status === 'published' ? 'default' : 'secondary'}
                >
                  {item.status}
                </Badge>
              </div>

              <CardHeader>
                <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="mr-2">{item.contentType}</Badge>
                  ${item.price}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {item.description}
                </p>
                
                <div className="flex gap-2">
                  {item.status === 'published' ? (
                    <Button
                      onClick={() => handleArchive(item.id)}
                      disabled={processingId === item.id}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      {processingId === item.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Archive className="h-4 w-4 mr-2" />
                      )}
                      Archive
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePublish(item.id)}
                      disabled={processingId === item.id}
                      size="sm"
                      className="flex-1"
                    >
                      {processingId === item.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Publish
                    </Button>
                  )}
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                  >
                    <Link href={`/content/${item.id}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
