'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mentorsApi, MentorsQuery } from '@/lib/api/mentors';
import { Mentor } from '@/lib/api/types';
import { Search, Users, Play, MapPin, Verified, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchMentors();
  }, [currentPage]);

  const fetchMentors = async (query?: MentorsQuery) => {
    try {
      setIsLoading(true);
      const finalQuery: MentorsQuery = {
        ...query,
        page: query?.page || currentPage,
        limit: ITEMS_PER_PAGE
      };
      
      const response = await mentorsApi.getMentors(finalQuery);
      setMentors(response.data || []);
      setTotalItems(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / ITEMS_PER_PAGE));
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
    fetchMentors({ q: searchQuery, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Meet Your Mentors
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Real people. Real stories. Real growth. 🚀
        </p>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentors by name, expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-20">
          <Users className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-semibold mb-2">No mentors found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mentors.map((mentor) => (
            <Link key={mentor.id} href={`/mentors/${mentor.id}`}>
              <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-purple-200 dark:hover:border-purple-800">
                {/* Profile Image Section */}
                <div className="relative h-48 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-orange-900/30">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <AvatarImage 
                        src={mentor.user.avatarUrl || mentor.profileImageUrl || undefined} 
                        alt={mentor.user.fullName}
                      />
                      <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {getInitials(mentor.user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Video indicator */}
                  {mentor.introVideoUrl && (
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs">
                      <Play className="h-3 w-3 fill-white" />
                      <span>Intro</span>
                    </div>
                  )}
                  
                  {/* Verified badge */}
                  {mentor.isVerified && (
                    <div className="absolute top-3 left-3">
                      <div className="bg-blue-500 text-white p-1 rounded-full">
                        <Verified className="h-4 w-4 fill-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg line-clamp-1 group-hover:text-purple-600 transition-colors">
                      {mentor.user.fullName}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {mentor.headline}
                    </p>
                  </div>

                  {/* Expertise badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.areasOfExpertise?.slice(0, 3).map((area) => (
                      <Badge 
                        key={area} 
                        variant="secondary" 
                        className="text-xs px-2 py-0.5"
                      >
                        {area}
                      </Badge>
                    ))}
                    {(mentor.areasOfExpertise?.length || 0) > 3 && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                        +{(mentor.areasOfExpertise?.length || 0) - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">{mentor.experienceYears} years experience</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Results info */}
      {!isLoading && mentors.length > 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} mentors
        </div>
      )}
    </div>
  );
}
