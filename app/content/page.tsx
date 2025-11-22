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
import { Search, BookOpen, Play, Clock, Award, TrendingUp, Sparkles } from 'lucide-react';

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
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
          Level Up Your Skills
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Discover frameworks and courses built by real mentors. 🎯
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 animate-pulse bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-6 animate-pulse bg-muted rounded" />
                <div className="h-4 animate-pulse bg-muted rounded w-3/4" />
                <div className="h-10 animate-pulse bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-semibold mb-2">No content found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {content.map((item) => (
            <Link key={item.id} href={`/content/${item.id}`}>
              <Card className="group h-full overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-orange-200 dark:hover:border-orange-800">
                {/* Cover Image/Video Section */}
                <div className="relative h-48 bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 dark:from-orange-900/30 dark:via-pink-900/30 dark:to-purple-900/30">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {item.mediaType === 'video' ? (
                      <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-10 w-10 fill-white text-white" />
                      </div>
                    ) : (
                      <div className="text-7xl opacity-20">
                        {item.contentType === 'course' ? '🎯' : '✨'}
                      </div>
                    )}
                  </div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-bold">
                    ${item.price}
                  </div>
                  
                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-orange-600 hover:bg-orange-700 capitalize">
                      {item.contentType}
                    </Badge>
                  </div>
                  
                  {/* Level Badge */}
                  {item.level && (
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="backdrop-blur-sm">
                        {item.level}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg line-clamp-2 group-hover:text-orange-600 transition-colors mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">by {item.mentor.fullName}</p>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {(item.tags?.length || 0) > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{(item.tags?.length || 0) - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                    {item.estimatedDuration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.estimatedDuration}</span>
                      </div>
                    )}
                    {item.contentType === 'course' && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-medium">Popular</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
