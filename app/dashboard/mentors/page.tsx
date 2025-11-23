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
import { appointmentsApi } from '@/lib/api/appointments';
import { Users, Loader2, Calendar, Star, Sparkles, ExternalLink, Clock, CheckCircle2, Award } from 'lucide-react';
import { BookAppointmentModal } from '@/components/book-appointment-modal';

export default function MyMentorsPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [mentors, setMentors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [selectedMentorName, setSelectedMentorName] = useState<string>('');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMentors();
      fetchAppointments();
    }
  }, [user]);

  const fetchMentors = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await mentorsApi.getMyMentors();
      setMentors(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch mentors:', err);
      setError(err.message || 'Failed to load mentors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await appointmentsApi.getAppointments({});
      setAppointments(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Simple Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Mentors</h1>
        <p className="text-muted-foreground">Manage your mentorship connections</p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Mentors</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={fetchMentors}>Try Again</Button>
            <Button asChild variant="outline">
              <Link href="/mentors">Browse Mentors</Link>
            </Button>
          </div>
        </Card>
      ) : mentors.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Mentors Yet</h3>
          <p className="text-muted-foreground mb-6">
            Start your learning journey by connecting with expert mentors
          </p>
          <Button asChild size="lg">
            <Link href="/mentors">
              <Sparkles className="h-4 w-4 mr-2" />
              Explore Mentors
            </Link>
          </Button>
        </Card>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {/* Consolidated Mentors Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold mb-1">{mentors.length}</div>
                    <p className="text-sm font-medium text-muted-foreground">My Mentors</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-3 border-t text-sm">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">{mentors.filter(m => m.availability === 'available').length} available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-muted-foreground">{mentors.filter(m => (m.rating || 0) >= 4.5).length} top rated</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold mb-1">{appointments.length}</div>
                    <p className="text-sm font-medium text-muted-foreground">Upcoming Sessions</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <Button asChild variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400">
                  <Link href="/dashboard/appointments">
                    View all sessions <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Total Sessions */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold mb-1">
                      {appointments.filter((a: any) => a.status === 'completed').length}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Completed Sessions</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Track your learning progress</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mentors Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => {
              if (!mentor || !mentor.user) return null;
              
              const user = mentor.user;
              const mentorId = mentor.id;
              const fullName = user.fullName || 'Unknown Mentor';
              const avatarUrl = user.profilePhoto;
              const bio = mentor.bio || '';
              const expertise = mentor.expertise || [];
              const rating = mentor.rating || 0;
              const totalReviews = mentor.totalReviews || 0;
              const totalStudents = mentor.totalStudents || 0;
              const availability = mentor.availability || 'available';
              
              return (
                <Card key={mentorId} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={avatarUrl} alt={fullName} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            {fullName.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {availability === 'available' && (
                          <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full ring-2 ring-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 truncate">{fullName}</h3>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({totalReviews})</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {bio}
                      </p>
                    )}

                    {/* Expertise */}
                    {expertise.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {expertise.slice(0, 3).map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {expertise.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{expertise.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 py-3 mb-4 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{totalStudents} students</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`h-2 w-2 rounded-full ${availability === 'available' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="capitalize">{availability}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        asChild
                        className="flex-1"
                        variant="default"
                      >
                        <Link href={`/mentors/${mentorId}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSelectedMentorId(mentorId);
                          setSelectedMentorName(fullName);
                          setShowAppointmentModal(true);
                        }}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA */}
          <Card className="mt-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0">
            <CardContent className="pt-8 pb-8 text-center">
              <h3 className="text-xl font-bold mb-2">Expand Your Network</h3>
              <p className="text-purple-100 mb-6">
                Discover more expert mentors to accelerate your growth
              </p>
              <Button 
                asChild 
                size="lg"
                className="bg-white text-purple-600 hover:bg-white/90"
              >
                <Link href="/mentors">
                  Explore All Mentors
                  <Sparkles className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </>
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
