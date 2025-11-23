'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mentorsApi, MentorsQuery } from '@/lib/api/mentors';
import { Mentor } from '@/lib/api/types';
import { 
  Search, 
  Briefcase, 
  Code, 
  TrendingUp, 
  Heart, 
  DollarSign,
  Users,
  Sparkles,
  Award,
  Target,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MentorProfileCard } from '@/components/mentor-profile-card';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 12;

const EXPERTISE_CATEGORIES = [
  { label: 'All Mentors', value: 'all', icon: Target },
  { label: 'Entrepreneurship', value: 'entrepreneurship', icon: Briefcase },
  { label: 'Business Strategy', value: 'business', icon: TrendingUp },
  { label: 'Technology', value: 'technology', icon: Code },
  { label: 'Leadership', value: 'leadership', icon: Award },
  { label: 'Finance', value: 'finance', icon: DollarSign },
  { label: 'Health & Wellness', value: 'health', icon: Heart },
  { label: 'Media & Creative', value: 'media', icon: Sparkles },
];

const EXPERIENCE_LEVELS = [
  { label: 'All Levels', value: 'all' },
  { label: '5+ Years', value: '5' },
  { label: '10+ Years', value: '10' },
  { label: 'Industry Leaders (15+)', value: '15' },
];

// Temporarily disabled until backend adds mentorType field
// const MENTOR_TYPES = [
//   { label: 'All Types', value: 'all' },
//   { label: 'Individual', value: 'individual' },
//   { label: 'Business', value: 'business' },
// ];

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [featuredMentors, setFeaturedMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [selectedExpertise, setSelectedExpertise] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchMentors();
  }, [currentPage]);

  useEffect(() => {
    // Fetch featured mentors on initial load
    fetchFeaturedMentors();
  }, []);

  const fetchFeaturedMentors = async () => {
    try {
      const response = await mentorsApi.getMentors({ 
        page: 1, 
        limit: 2,
        // Could add a "featured" flag in the API
      });
      // For now, just take the first 2 mentors as featured
      setFeaturedMentors((response.data || []).slice(0, 2));
    } catch (error) {
      console.error('Failed to fetch featured mentors:', error);
    }
  };

  const fetchMentors = async (customQuery?: Partial<MentorsQuery>) => {
    try {
      setIsLoading(true);
      
      const query: MentorsQuery = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...customQuery
      };

      // Add filters
      if (searchQuery) query.q = searchQuery;

      const response = await mentorsApi.getMentors(query);
      let mentorsData = response.data || [];
      
      // Apply client-side filters
      if (selectedExpertise !== 'all') {
        mentorsData = mentorsData.filter(m =>
          m.areasOfExpertise?.some(area => 
            area.toLowerCase().includes(selectedExpertise.toLowerCase())
          )
        );
      }

      if (selectedExperience !== 'all') {
        const minYears = parseInt(selectedExperience);
        mentorsData = mentorsData.filter(m => 
          (m.experienceYears || 0) >= minYears
        );
      }
      
      setMentors(mentorsData);
      setTotalItems(mentorsData.length);
      setTotalPages(Math.ceil(mentorsData.length / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Failed to fetch mentors:', error);
      setMentors([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchMentors();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedExpertise('all');
    setSelectedExperience('all');
    setCurrentPage(1);
    fetchMentors({});
  };

  const hasActiveFilters = searchQuery || selectedExpertise !== 'all' || selectedExperience !== 'all';

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,197,253,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(147,197,253,0.1),transparent_50%)]" />
        
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Main Headline */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Find Your <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Mentor</span>
            </h1>
            
            <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
              Connect with experienced mentors who can guide your journey
            </p>

            {/* Premium Search Bar */}
            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, expertise, or industry..."
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
              <Target className="h-4 w-4 text-muted-foreground" />
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
            {/* Expertise Filter Pills */}
            <div>
              <div className="mb-3 hidden items-center gap-2 md:flex">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Expertise</span>
              </div>
              <div className="flex flex-wrap gap-2">
              {EXPERTISE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedExpertise === category.value;
                return (
                  <motion.button
                    key={category.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedExpertise(category.value);
                      setCurrentPage(1);
                      fetchMentors();
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
              )}
              </div>
            </div>

            {/* Experience Filter Pills */}
            <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Experience</span>
            </div>
            {EXPERIENCE_LEVELS.map((level) => {
              const isSelected = selectedExperience === level.value;
              return (
                <motion.button
                  key={level.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedExperience(level.value);
                    setCurrentPage(1);
                    fetchMentors();
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
        {/* Featured Mentors Section */}
        {!isLoading && !hasActiveFilters && featuredMentors.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="mb-8">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Featured Mentors</h2>
              </div>
              <p className="text-lg text-muted-foreground">
                Connect with our most experienced and highly-rated mentors
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredMentors.map((mentor, index) => (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <MentorProfileCard 
                    mentor={mentor} 
                    featured 
                    priority
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-soft">
                <div className="aspect-[4/5] animate-pulse bg-muted" />
                <div className="space-y-3 p-6">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && mentors.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-muted">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-2xl font-bold">No mentors found</h3>
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

        {/* All Mentors Section */}
        {!isLoading && mentors.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold">
                {hasActiveFilters ? 'Search Results' : 'All Mentors'}
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                {totalItems} {totalItems === 1 ? 'mentor' : 'mentors'} available
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mentors.map((mentor, index) => (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <MentorProfileCard 
                    mentor={mentor}
                    priority={index < 6}
                  />
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
              Load More Mentors
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
