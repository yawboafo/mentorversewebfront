'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireRole } from '@/hooks/use-require-auth';
import { contentApi } from '@/lib/api/content';
import { Content } from '@/lib/api/types';
import { formatCurrency } from '@/lib/utils/currency';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Eye,
  Trash2,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Video,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function MentorContentPage() {
  const { user, isLoading: authLoading } = useRequireRole(['mentor']);
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user]);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      // Fetch ALL content created by current mentor (including drafts)
      console.log('📚 Fetching content for mentor:', user?.id);
      // Note: Backend might filter published content only by default
      // Mentors should see their own content regardless of status
      const response = await contentApi.getContent({ 
        mentor_id: user?.id,
        limit: 100 // Get more results to ensure we see all content
      });
      console.log('📚 Content response:', response);
      const contentArray = Array.isArray(response) ? response : response.data || [];
      console.log('📚 Content array:', contentArray, 'Count:', contentArray.length);
      setContents(contentArray);
    } catch (err: any) {
      console.error('Failed to load content:', err);
      toast.error('Failed to load your content');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContents = contents.filter(content =>
    content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    content.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      published: { color: 'bg-green-100 text-green-800', label: 'Published' },
      archived: { color: 'bg-red-100 text-red-800', label: 'Archived' },
    };
    const variant = variants[status] || variants.draft;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const getFormatIcon = (format: string) => {
    const icons: Record<string, any> = {
      video: Video,
      text: FileText,
      pdf: FileText,
      mixed: BookOpen,
    };
    const Icon = icons[format] || BookOpen;
    return <Icon className="h-4 w-4" />;
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto py-8 max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                My Content
              </h1>
              <p className="text-muted-foreground">
                Manage your courses and frameworks
              </p>
            </div>
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Link href="/mentor/content/create">
                <Plus className="h-5 w-5 mr-2" />
                Create New Content
              </Link>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search your content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Content</p>
                  <p className="text-2xl font-bold">{contents.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">
                    {contents.filter(c => c.status === 'published').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold">
                    {contents.filter(c => c.status === 'draft').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">$0</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Grid */}
        {filteredContents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="py-16 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery ? 'No content found' : 'No content yet'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search query'
                    : 'Create your first course or framework to get started'}
                </p>
                {!searchQuery && (
                  <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Link href="/mentor/content/create">
                      <Plus className="h-5 w-5 mr-2" />
                      Create Content
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredContents.map((content, index) => (
              <motion.div
                key={content.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      {getStatusBadge(content.status)}
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getFormatIcon(content.format)}
                        {content.content_type}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{content.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {content.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold">{formatCurrency(content.price, content.currency || 'USD')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Level:</span>
                        <Badge variant="secondary">{content.level}</Badge>
                      </div>
                      {content.tags && content.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {content.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/content/${content.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button asChild variant="default" size="sm" className="flex-1">
                      <Link href={`/mentor/content/${content.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
