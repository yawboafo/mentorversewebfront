'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireRole } from '@/hooks/use-require-auth';
import { mentorsApi } from '@/lib/api/mentors';
import { MenteeDetails } from '@/lib/api/types';
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  Clock,
  Video,
  Phone,
  MapPin,
  CheckCircle2,
  Loader2,
  Mail,
  User,
} from 'lucide-react';
import { format } from 'date-fns';

export default function MenteeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const menteeId = params?.menteeId as string;
  const { user, isLoading: authLoading } = useRequireRole(['mentor', 'admin']);
  
  const [menteeDetails, setMenteeDetails] = useState<MenteeDetails | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && menteeId) {
      fetchMenteeDetails();
    }
  }, [user, menteeId]);

  const fetchMenteeDetails = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch mentee details
      const details = await mentorsApi.getMenteeDetails(menteeId);
      setMenteeDetails(details);
      
      // Fetch mentee's courses
      try {
        const coursesResponse = await mentorsApi.getMenteeCourses(menteeId);
        setCourses(coursesResponse.data || []);
      } catch (courseErr) {
        console.log('⚠️ Could not fetch courses:', courseErr);
        setCourses([]);
      }
    } catch (err: any) {
      console.error('Error fetching mentee details:', err);
      setError(err.message || 'Failed to load mentee details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-4" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !menteeDetails) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">{error || 'Mentee not found'}</p>
          <Button onClick={() => router.push('/mentor/mentees')}>
            Return to My Mentees
          </Button>
        </Card>
      </div>
    );
  }

  const mentee = menteeDetails.mentee;
  const initials = mentee.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
  const joinedDate = format(new Date(menteeDetails.first_connected_at), 'MMMM yyyy');
  const isSubscriber = menteeDetails.relationship_type === 'subscription';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to My Mentees
      </Button>

      {/* Profile Header */}
      <Card className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 flex-shrink-0">
              <AvatarImage src={mentee.avatar_url} alt={mentee.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{mentee.full_name}</h1>
                {isSubscriber ? (
                  <Badge className="bg-blue-500">Subscriber</Badge>
                ) : (
                  <Badge className="bg-green-500">Student</Badge>
                )}
                <Badge variant="outline" className="capitalize">
                  {menteeDetails.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {mentee.email}
                </div>
                {mentee.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {mentee.country}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {mentee.account_type}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {isSubscriber ? 'Subscriber' : 'Mentee'} since {joinedDate}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-xs text-muted-foreground">Courses Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {courses.filter((c) => c.progress === 100).length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold capitalize">{menteeDetails.status}</p>
                <p className="text-xs text-muted-foreground">Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Appointments</CardTitle>
            <Button size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No appointments yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Schedule your first session with this mentee.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Courses with You</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground mb-4">
                This mentee hasn't enrolled in any of your courses yet.
              </p>
              <Button asChild variant="outline">
                <Link href="/mentor/content">View Your Content</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {course.thumbnail && (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1 truncate">{course.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                              style={{ width: `${course.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {course.progress || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
