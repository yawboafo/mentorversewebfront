'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { mentorsApi, MentorsQuery } from '@/lib/api/mentors';
import { Mentor } from '@/lib/api/types';
import { 
  Search, 
  Filter, 
  Briefcase, 
  Code, 
  TrendingUp, 
  Heart, 
  DollarSign,
  Users,
  Sparkles,
  Award,
  Target
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-amber-50/30 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      {/* Hero Header Section */}
      <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700 dark:from-orange-900 dark:via-amber-900 dark:to-orange-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                Find a Mentor
              </h1>
            </motion.div>
            
            <p className="text-xl md:text-2xl text-orange-50 mb-8 font-light">
              Learn from real experts, leaders, and creators
            </p>

            {/* Centered Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by name, expertise, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 pr-4 h-14 text-base bg-white dark:bg-zinc-900 border-0 shadow-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          {/* Expertise Pills */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Areas of Expertise</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 md:max-h-none overflow-y-auto md:overflow-visible">
              {EXPERTISE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    onClick={() => {
                      setSelectedExpertise(category.value);
                      setCurrentPage(1);
                      fetchMentors();
                    }}
                    className={`
                      inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${selectedExpertise === category.value
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

          {/* Experience & Type Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Experience:</span>
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => {
                  setSelectedExperience(level.value);
                  setCurrentPage(1);
                  fetchMentors();
                }}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${selectedExperience === level.value
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-700'
                    : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-700'
                  }
                `}
              >
                {level.label}
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
        {/* Featured Mentors Section */}
        {!isLoading && !hasActiveFilters && featuredMentors.length > 0 && (
          <section className="mb-16">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <Sparkles className="h-7 w-7 text-orange-600" />
                Featured Mentors
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with our most experienced and highly-rated mentors
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredMentors.map((mentor) => (
                <MentorProfileCard 
                  key={mentor.id} 
                  mentor={mentor} 
                  featured 
                  priority
                />
              ))}
            </div>
          </section>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/5] w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && mentors.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Users className="h-20 w-20 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">No mentors found</h3>
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

        {/* All Mentors Section */}
        {!isLoading && mentors.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {hasActiveFilters ? 'Search Results' : 'All Mentors'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {totalItems} {totalItems === 1 ? 'mentor' : 'mentors'} available
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor, index) => (
                <MentorProfileCard 
                  key={mentor.id} 
                  mentor={mentor}
                  priority={index < 6}
                />
              ))}
            </div>
          </section>
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
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 shadow-lg hover:shadow-xl transition-all"
            >
              Load More Mentors
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
