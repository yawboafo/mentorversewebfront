'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { contentApi, ContentQuery } from '@/lib/api/content';
import { Content } from '@/lib/api/types';
import { Search, BookOpen } from 'lucide-react';

export default function ContentPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState<'all' | 'framework' | 'course'>('all');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async (query?: ContentQuery) => {
    try {
      setIsLoading(true);
      console.log('Fetching content with query:', query);
      const data = await contentApi.getContent(query);
      console.log('Received content data:', data);
      console.log('Is array:', Array.isArray(data));
      console.log('Data length:', data?.length);
      setContent(data || []);
    } catch (error) {
      console.error('Failed to fetch content:', error);
      setContent([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const query: ContentQuery = { q: searchQuery };
    if (contentType !== 'all') {
      query.content_type = contentType;
    }
    fetchContent(query);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Courses & Frameworks</h1>
        <p className="text-muted-foreground mb-6">
          Discover frameworks and courses to accelerate your growth
        </p>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="course">Courses</SelectItem>
              <SelectItem value="framework">Frameworks</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-80 animate-pulse bg-muted" />
          ))}
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No content found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="secondary">{item.content_type}</Badge>
                  <span className="text-sm font-semibold">${item.price} {item.currency}</span>
                </div>
                <CardTitle className="mt-2 line-clamp-2">{item.title}</CardTitle>
                <CardDescription className="line-clamp-1">by {item.mentor_name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.estimated_duration}
                </div>
                <Button asChild className="w-full">
                  <Link href={`/content/${item.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
