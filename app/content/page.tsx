'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { contentApi, ContentQuery } from '@/lib/api/content';
import { Content } from '@/lib/api/types';
import { Search, SlidersHorizontal, TrendingUp, Sparkles, Clock, X } from 'lucide-react';
import { CourseVideoCard } from '@/components/course-video-card';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 18;

export default function ContentPage() {
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [featuredContent, setFeaturedContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [contentType, setContentType] = useState<'all' | 'framework' | 'course'>('all');
  const [level, setLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'price_low' | 'price_high'>('trending');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchContent();
  }, [currentPage, sortBy]);

  const fetchContent = async (customQuery?: Partial<ContentQuery>) => {
    try {
      setIsLoading(true);
      
      const query: ContentQuery = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...customQuery
      };

      // Add filters
      if (searchQuery) query.q = searchQuery;
      if (contentType !== 'all') query.content_type = contentType;
      // Note: level filter is applied client-side since API doesn't support it yet

      const response = await contentApi.getContent(query);
      let contentData = response.data || [];
      
      // Apply client-side level filter (since API doesn't support it yet)
      if (level !== 'all') {
        contentData = contentData.filter(c => 
          c.level?.toLowerCase() === level.toLowerCase()
        );
      }
      
      setAllContent(contentData);
      setTotalItems(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / ITEMS_PER_PAGE));
      
      // Set featured content (first trending or newest item)
      if (contentData.length > 0 && currentPage === 1) {
        setFeaturedContent(contentData[0]);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
      setAllContent([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchContent();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setContentType('all');
    setLevel('all');
    setSortBy('trending');
    setCurrentPage(1);
    fetchContent({});
  };

  const hasActiveFilters = searchQuery || contentType !== 'all' || level !== 'all';

  // Group content for discovery sections
  const getContentBySection = () => {
    const courses = allContent.filter(c => c.contentType === 'course');
    const frameworks = allContent.filter(c => c.contentType === 'framework');
    const beginnerContent = allContent.filter(c => c.level?.toLowerCase() === 'beginner');
    
    return {
      trending: allContent.slice(0, 6),
      courses: courses.slice(0, 6),
      frameworks: frameworks.slice(0, 6),
      beginners: beginnerContent.slice(0, 6)
    };
  };

  const sections = getContentBySection();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar / Filters */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="flex gap-3 items-center mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search courses, mentors, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button 
              onClick={handleSearch}
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
            >
              Search
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="hidden sm:flex"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>

          {/* Filters Row */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-3 pt-3 pb-1">
                  {/* Content Type */}
                  <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="course">Courses</SelectItem>
                      <SelectItem value="framework">Frameworks</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Level */}
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trending">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Trending
                        </div>
                      </SelectItem>
                      <SelectItem value="newest">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Newest
                        </div>
                      </SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="gap-1"
                    >
                      <X className="h-4 w-4" />
                      Clear filters
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Featured / Hero Section */}
        {!isLoading && featuredContent && currentPage === 1 && !hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-orange-600" />
              <h2 className="text-2xl font-bold">Featured Course</h2>
            </div>
            <CourseVideoCard content={featuredContent} variant="featured" priority />
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-video rounded-xl bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted animate-pulse rounded w-16" />
                    <div className="h-6 bg-muted animate-pulse rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && allContent.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters
            </p>
            {hasActiveFilters && (
              <Button onClick={handleClearFilters} variant="outline">
                Clear all filters
              </Button>
            )}
          </motion.div>
        )}

        {/* Discovery Sections (when no search/filters active) */}
        {!isLoading && !hasActiveFilters && currentPage === 1 && (
          <div className="space-y-12">
            {/* Trending Section */}
            {sections.trending.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                    <h2 className="text-2xl font-bold">Trending Now</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sections.trending.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CourseVideoCard content={content} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Courses Section */}
            {sections.courses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎓</span>
                    <h2 className="text-2xl font-bold">Popular Courses</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sections.courses.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CourseVideoCard content={content} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Wins for Beginners */}
            {sections.beginners.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold">Quick Wins for Beginners</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sections.beginners.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CourseVideoCard content={content} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Frameworks Section */}
            {sections.frameworks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    <h2 className="text-2xl font-bold">Proven Frameworks</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sections.frameworks.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CourseVideoCard content={content} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Content Grid (when searching/filtering or pagination) */}
        {!isLoading && (hasActiveFilters || currentPage > 1) && allContent.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-muted-foreground">
                {totalItems} {totalItems === 1 ? 'result' : 'results'}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allContent.map((content, index) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CourseVideoCard content={content} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Load More / Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            {currentPage < totalPages ? (
              <Button
                size="lg"
                onClick={() => {
                  setCurrentPage(currentPage + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
              >
                Load More
              </Button>
            ) : (
              <p className="text-muted-foreground">
                You've reached the end! 🎉
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
