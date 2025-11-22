'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { mentorsApi, MentorsQuery } from '@/lib/api/mentors';
import { Mentor } from '@/lib/api/types';
import { Search, Users } from 'lucide-react';

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async (query?: MentorsQuery) => {
    try {
      setIsLoading(true);
      console.log('Fetching mentors with query:', query);
      const data = await mentorsApi.getMentors(query);
      console.log('Received mentors data:', data);
      console.log('Is array:', Array.isArray(data));
      console.log('Data length:', data?.length);
      setMentors(data || []);
    } catch (error) {
      console.error('Failed to fetch mentors:', error);
      setMentors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchMentors({ q: searchQuery });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Browse Mentors</h1>
        <p className="text-muted-foreground mb-6">
          Find expert mentors to guide your growth journey
        </p>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentors..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-1">{mentor.full_name}</CardTitle>
                <CardDescription className="line-clamp-1">{mentor.headline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {mentor.short_bio}
                </p>
                <div className="flex flex-wrap gap-2">
                  {mentor.areas_of_expertise.slice(0, 3).map((area) => (
                    <Badge key={area} variant="secondary">{area}</Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {mentor.experience_years} years experience
                </div>
                <Button asChild className="w-full">
                  <Link href={`/mentors/${mentor.id}`}>View Profile</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
