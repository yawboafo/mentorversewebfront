'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { contentApi, ContentQuery } from '@/lib/api/content';
import { Content } from '@/lib/api/types';
import { Search, Filter, Award, Briefcase, Lightbulb, TrendingUp, Users, Target } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Hero Header Section - Clean & Professional */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Explore Courses
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Learn directly from experienced mentors across industries
            </p>

            {/* Centered Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for courses, mentors, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 pr-4 h-14 text-base border-gray-300 dark:border-zinc-700 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filter Pills Section */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          {/* Category Pills */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Categories</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    onClick={() => {
                      setSelectedCategory(category.value);
                      setCurrentPage(1);
                      fetchContent();
                    }}
                    className={`
                      inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${selectedCategory === category.value
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level & Type Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Level:</span>
            {LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => {
                  setSelectedLevel(level.value);
                  setCurrentPage(1);
                  fetchContent();
                }}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${selectedLevel === level.value
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-700'
                    : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-700'
                  }
                `}
              >
                {level.label}
              </button>
            ))}

            <div className="h-6 w-px bg-gray-300 dark:bg-zinc-700 mx-2" />

            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Type:</span>
            {['all', 'course', 'framework'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setContentType(type as any);
                  setCurrentPage(1);
                  fetchContent();
                }}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all
                  ${contentType === type
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-700'
                    : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-700'
                  }
                `}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}

            {hasActiveFilters && (
              <>
                <div className="h-6 w-px bg-gray-300 dark:bg-zinc-700 mx-2" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  Clear all filters
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-[16/10] bg-gray-200 dark:bg-zinc-800 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded w-2/3" />
                      <div className="h-3 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-5 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded" />
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
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">No courses found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
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
        {!isLoading && !hasActiveFilters && currentPage === 1 && allContent.length > 0 && (
          <div className="space-y-16">
            {/* Most Popular for Entrepreneurs */}
            {sections.entrepreneurship.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Most Popular for Entrepreneurs
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Build and scale your business with proven strategies
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sections.entrepreneurship.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CourseLearningCard content={content} priority={index < 4} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Build Practical Skills for Beginners */}
            {sections.beginners.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Build Practical Skills
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Perfect starting point for beginners
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sections.beginners.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CourseLearningCard content={content} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Leadership & Communication */}
            {sections.leadership.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Leadership & Communication
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Develop the skills to lead and inspire teams
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sections.leadership.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CourseLearningCard content={content} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Courses by Top Mentors */}
            {sections.topMentors.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Courses by Top Mentors
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Learn from industry leaders and experts
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sections.topMentors.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CourseLearningCard content={content} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* All Content Grid (when searching/filtering) */}
        {!isLoading && (hasActiveFilters || currentPage > 1) && allContent.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                {totalItems} {totalItems === 1 ? 'course' : 'courses'} found
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          </div>
        )}

        {/* Load More */}
        {!isLoading && totalPages > 1 && currentPage < totalPages && (
          <div className="mt-12 text-center">
            <Button
              onClick={() => {
                setCurrentPage(currentPage + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8"
            >
              Load More Courses
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
