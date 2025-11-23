'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { mentorsApi } from '@/lib/api/mentors';
import { MentorDetails } from '@/lib/api/types';
import { Users, Loader2, MapPin, Calendar as CalendarIcon, BookOpen, Award, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { BookAppointmentModal } from '@/components/book-appointment-modal';

export default function MyMentorsPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [mentors, setMentors] = useState<MentorDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [selectedMentorName, setSelectedMentorName] = useState<string>('');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMentors();
    }
  }, [user]);

  const fetchMentors = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await mentorsApi.getMyMentors();
      setMentors(response.data);
    } catch (err: any) {
      console.error('Failed to fetch mentors:', err);
      
      // Handle specific error types
      if (err.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.status === 403) {
        setError('You do not have permission to view this page.');
      } else if (err.status === 404) {
        setError('Subscriptions service is temporarily unavailable.');
      } else if (err.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.message?.toLowerCase().includes('network')) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message || 'Failed to load mentors. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      paused: { variant: 'secondary', label: 'Paused' },
      ended: { variant: 'outline', label: 'Ended' },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Mentors</h1>
            <p className="text-muted-foreground mt-1">
              All the mentors you're learning from
            </p>
          </div>
        </div>

        {/* Stats Card */}
        {mentors.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Users className="h-10 w-10 text-purple-500" />
                <div>
                  <div className="text-3xl font-bold">{mentors.length}</div>
                  <p className="text-sm text-muted-foreground">Active Mentors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-12 text-center border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <Users className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Unable to Load Mentors</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={fetchMentors} variant="default">
              <Loader2 className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/mentors">Browse Mentors</Link>
            </Button>
          </div>
        </Card>
      ) : mentors.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/50 dark:border-purple-800/30">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-bold mb-2">No Mentors Yet</h3>
          <p className="text-muted-foreground mb-6">
            Start learning by purchasing content from amazing mentors.
          </p>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Link href="/mentors">
              <Sparkles className="h-4 w-4 mr-2" />
              Discover Mentors
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {mentors.map((mentorship) => {
            const { mentor } = mentorship;
            return (
              <Card key={mentor.id} className="hover:shadow-lg transition-all group">
                <CardContent className="pt-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-20 w-20 ring-2 ring-purple-500/20">
                      <AvatarImage src={mentorship.mentor.avatar_url || mentorship.mentor.mentor_profile.profile_image_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg">
                        {mentorship.mentor.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold truncate">
                            {mentorship.mentor.full_name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {mentorship.mentor.mentor_profile.headline}
                          </p>
                        </div>
                        {mentorship.mentor.mentor_profile.is_verified && (
                          <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                            <Award className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      {mentorship.mentor.country && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {mentorship.mentor.country}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {mentorship.mentor.mentor_profile.short_bio}
                  </p>

                  {/* Expertise */}
                  {mentorship.mentor.mentor_profile.areas_of_expertise.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {mentorship.mentor.mentor_profile.areas_of_expertise.slice(0, 3).map((area, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                        {mentorship.mentor.mentor_profile.areas_of_expertise.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{mentorship.mentor.mentor_profile.areas_of_expertise.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{mentorship.purchased_content_count} course{mentorship.purchased_content_count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Since {format(new Date(mentorship.first_connected_at), 'MMM yyyy')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(mentorship.status)}
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedMentorId(mentorship.mentor.id);
                          setSelectedMentorName(mentorship.mentor.full_name);
                          setShowAppointmentModal(true);
                        }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Book Appointment
                      </Button>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="group-hover:bg-purple-500/10">
                      <Link href={`/mentors/${mentorship.mentor.id}`}>
                        View Profile
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* CTA to discover more */}
      {mentors.length > 0 && (
        <Card className="mt-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Want to learn from more mentors?</h3>
            <p className="text-muted-foreground mb-4">
              Discover amazing mentors and expand your knowledge
            </p>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Link href="/mentors">
                <Sparkles className="h-4 w-4 mr-2" />
                Browse All Mentors
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Book Appointment Modal */}
      {selectedMentorId && (
        <BookAppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => {
            setShowAppointmentModal(false);
            setSelectedMentorId(null);
            setSelectedMentorName('');
          }}
          mentorId={selectedMentorId}
          mentorName={selectedMentorName}
        />
      )}
    </div>
  );
}
