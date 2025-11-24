'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { learningApi, ActiveCourse } from '@/lib/api/learning';
import { Play, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ContinueLearning() {
  const [activeCourses, setActiveCourses] = useState<ActiveCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveCourses = async () => {
      try {
        const courses = await learningApi.getActiveCourses();
        setActiveCourses(courses);
      } catch (error) {
        console.error('Failed to fetch active courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveCourses();
  }, []);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Continue Learning</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (activeCourses.length === 0) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Continue Learning</h2>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="rounded-full bg-muted p-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Ready to start learning?</h3>
              <p className="text-muted-foreground max-w-md">
                Enroll in courses from expert mentors and start building real skills
              </p>
            </div>
            <Button asChild size="lg" className="mt-4">
              <Link href="/content">
                Browse Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Continue Learning</h2>
          <p className="text-muted-foreground mt-1">Pick up where you left off</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeCourses.map((course) => (
          <Card key={course.id} className="group hover:shadow-lg transition-all overflow-hidden">
            <CardContent className="p-0">
              {/* Course Thumbnail */}
              <div className="relative aspect-video bg-muted overflow-hidden">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/5">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Progress Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t">
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{course.progress.percent}% complete</span>
                      <span>{course.estimatedDuration}</span>
                    </div>
                    <Progress value={course.progress.percent} className="h-1.5" />
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-6 space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  
                  {/* Mentor */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={course.mentor.avatarUrl} alt={course.mentor.fullName} />
                      <AvatarFallback className="text-xs">
                        {course.mentor.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{course.mentor.fullName}</span>
                  </div>
                </div>

                {/* Next Lesson */}
                {course.progress.nextResourceName && (
                  <div className="flex items-start gap-2 text-sm bg-muted/50 rounded-lg p-3">
                    <Play className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">Next up:</p>
                      <p className="font-medium line-clamp-1">{course.progress.nextResourceName}</p>
                    </div>
                  </div>
                )}

                {/* Last Accessed */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Last accessed{' '}
                    {formatDistanceToNow(new Date(course.progress.lastAccessedAt), { addSuffix: true })}
                  </span>
                </div>

                {/* CTA */}
                <Button asChild className="w-full" size="lg">
                  <Link href={`/content/${course.contentId}`}>
                    <Play className="mr-2 h-4 w-4" />
                    {course.progress.percent === 0 ? 'Start Course' : 'Continue Learning'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View All Link */}
      {activeCourses.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button asChild variant="ghost">
            <Link href="/dashboard/courses">
              View all your courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
