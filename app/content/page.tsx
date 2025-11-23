'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { contentApi, ContentQuery } from '@/lib/api/content';
import { Content } from '@/lib/api/types';
import { Search, Award, Briefcase, Lightbulb, TrendingUp, Users, Target, BookOpen, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { CourseLearningCard } from '@/components/course-learning-card';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 12;

const CATEGORIES = [
  { label: 'All Courses', value: 'all', icon: Target },
  { label: 'Entrepreneurship', value: 'entrepreneurship', icon: Briefcase },
  { label: 'Leadership', value: 'leadership', icon: Award },
  { label: 'Business Strategy', value: 'business', icon: TrendingUp },
  { label: 'Marketing', value: 'marketing', icon: Users },
  { label: 'Creative Skills', value: 'creative', icon: Lightbulb },
];

const LEVELS = [
  { label: 'All Levels', value: 'all' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

export default function ContentPage() {
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [contentType, setContentType] = useState<'all' | 'framework' | 'course'>('all');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchContent();
  }, [currentPage]);

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

      const response = await contentApi.getContent(query);
      let contentData = response.data || [];
      
      // Apply client-side filters
      if (selectedLevel !== 'all') {
        contentData = contentData.filter(c => 
          c.level?.toLowerCase() === selectedLevel.toLowerCase()
        );
      }

      if (selectedCategory !== 'all') {
        contentData = contentData.filter(c =>
          c.tags?.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()))
        );
      }
      
      setAllContent(contentData);
      setTotalItems(contentData.length);
      setTotalPages(Math.ceil(contentData.length / ITEMS_PER_PAGE));
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
    setSelectedCategory('all');
    setSelectedLevel('all');
    setContentType('all');
    setCurrentPage(1);
    fetchContent({});
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedLevel !== 'all' || contentType !== 'all';

  // Group content for discovery sections
  const getContentBySection = () => {
    const entrepreneurship = allContent.filter(c => 
      c.tags?.some(tag => tag.toLowerCase().includes('entrepreneur'))
    );
    const leadership = allContent.filter(c => 
      c.tags?.some(tag => tag.toLowerCase().includes('leadership'))
    );
    const beginners = allContent.filter(c => c.level?.toLowerCase() === 'beginner');
    const topMentors = allContent.slice(0, 4);
    
    return {
      entrepreneurship: entrepreneurship.slice(0, 4),
      leadership: leadership.slice(0, 4),
      beginners: beginners.slice(0, 4),
      topMentors: topMentors,
    };
  };

  const sections = getContentBySection();

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-background via-background to-accent/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,197,253,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(147,197,253,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]" />
        
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Main Headline */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Explore <span className="bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">Courses</span>
            </h1>
            
            <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
              Learn practical skills from experienced mentors across industries
            </p>

            {/* Premium Search Bar */}
            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for courses, mentors, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-14 rounded-2xl border-border/50 bg-card pl-14 pr-4 text-base shadow-soft transition-all focus:shadow-soft-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gen Z Pill Filters Section */}
      <section className="sticky top-0 z-30 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className="mb-3 flex w-full items-center justify-between rounded-xl bg-muted/50 px-4 py-3 transition-colors hover:bg-muted md:hidden"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
                  •
                </Badge>
              )}
            </div>
            {isFiltersExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {/* Filters Content */}
          <div className={`space-y-4 ${isFiltersExpanded ? 'block' : 'hidden'} md:block`}>
            {/* Category Filter Pills */}
            <div>
              <div className="mb-3 hidden items-center gap-2 md:flex">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Categories</span>
              </div>
              <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.value;
                return (
                  <motion.button
                    key={category.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCategory(category.value);
                      setCurrentPage(1);
                      fetchContent();
                    }}
                    className={`
                      inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium
                      transition-all duration-300
                      ${isSelected
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </motion.button>
                );
              })}
              </div>
            </div>

            {/* Level & Type Filter Pills */}
            <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Level</span>
            </div>
            {LEVELS.map((level) => {
              const isSelected = selectedLevel === level.value;
              return (
                <motion.button
                  key={level.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedLevel(level.value);
                    setCurrentPage(1);
                    fetchContent();
                  }}
                  className={`
                    rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300
                    ${isSelected
                      ? 'bg-accent/10 text-accent border border-accent/30'
                      : 'bg-muted text-muted-foreground border border-transparent hover:border-border'
                    }
                  `}
                >
                  {level.label}
                </motion.button>
              );
            })}

            <div className="mx-2 h-6 w-px bg-border" />

            <span className="text-sm font-semibold text-foreground">Type</span>
            {['all', 'course', 'framework'].map((type) => {
              const isSelected = contentType === type;
              return (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setContentType(type as any);
                    setCurrentPage(1);
                    fetchContent();
                  }}
                  className={`
                    capitalize rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300
                    ${isSelected
                      ? 'bg-secondary/10 text-secondary border border-secondary/30'
                      : 'bg-muted text-muted-foreground border border-transparent hover:border-border'
                    }
                  `}
                >
                  {type === 'all' ? 'All' : type}
                </motion.button>
              );
            })}
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <>
                <div className="mx-2 h-6 w-px bg-border" />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-1.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/20"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear filters
                </motion.button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-soft">
                <div className="aspect-[16/10] animate-pulse bg-muted" />
                <div className="space-y-3 p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                  <div className="h-5 animate-pulse rounded bg-muted" />
                  <div className="h-4 animate-pulse rounded bg-muted" />
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
            className="py-20 text-center"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-muted">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-2xl font-bold">No courses found</h3>
            <p className="mb-6 text-muted-foreground">
              Try adjusting your search or filters
            </p>
            {hasActiveFilters && (
              <Button onClick={handleClearFilters} variant="outline" size="lg">
                Clear all filters
              </Button>
            )}
          </motion.div>
        )}

        {/* Discovery Sections (when no search/filters active) */}
        {!isLoading && !hasActiveFilters && currentPage === 1 && allContent.length > 0 && (
          <div className="space-y-16">
            {/* Most Popular for Entrepreneurs */}
            {sections.entrepreneurship.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="mb-8">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">
                      Most Popular for Entrepreneurs
                    </h2>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    Build and scale your business with proven strategies
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sections.entrepreneurship.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CourseLearningCard content={content} priority={index < 3} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Build Practical Skills for Beginners */}
            {sections.beginners.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mb-8">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                      <Lightbulb className="h-6 w-6 text-accent" />
                    </div>
                    <h2 className="text-3xl font-bold">
                      Build Practical Skills
                    </h2>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    Perfect starting point for beginners
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sections.beginners.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CourseLearningCard content={content} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Leadership & Communication */}
            {sections.leadership.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="mb-8">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                      <Award className="h-6 w-6 text-secondary" />
                    </div>
                    <h2 className="text-3xl font-bold">
                      Leadership & Communication
                    </h2>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    Develop the skills to lead and inspire teams
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sections.leadership.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CourseLearningCard content={content} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Courses by Top Mentors */}
            {sections.topMentors.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="mb-8">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">
                      Courses by Top Mentors
                    </h2>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    Learn from industry leaders and experts
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sections.topMentors.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CourseLearningCard content={content} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        )}

        {/* All Content Grid (when searching/filtering) */}
        {!isLoading && (hasActiveFilters || currentPage > 1) && allContent.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold">
                {hasActiveFilters ? 'Search Results' : 'All Courses'}
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                {totalItems} {totalItems === 1 ? 'course' : 'courses'} found
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allContent.map((content, index) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CourseLearningCard content={content} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Load More */}
        {!isLoading && totalPages > 1 && currentPage < totalPages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center"
          >
            <Button
              onClick={() => {
                setCurrentPage(currentPage + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              size="lg"
              className="rounded-xl px-8 shadow-soft transition-all hover:shadow-soft-lg"
            >
              Load More Courses
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
