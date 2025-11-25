import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, Clock, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { MenteeDetails } from '@/lib/api/types';

interface MenteeCardProps {
  mentee: MenteeDetails;
}

export function MenteeCard({ mentee }: MenteeCardProps) {
  const menteeUser = mentee.mentee;
  const initials = menteeUser.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const joinedDate = format(new Date(mentee.first_connected_at), 'MMM yyyy');
  const hasCourses = mentee.purchased_content && mentee.purchased_content.length > 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar className="h-14 w-14 flex-shrink-0">
              <AvatarImage src={menteeUser.avatar_url} alt={menteeUser.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg truncate">{menteeUser.full_name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{menteeUser.email}</p>
                </div>
                {mentee.relationship_type === 'subscription' ? (
                  <Badge variant="secondary" className="flex-shrink-0 bg-blue-100 text-blue-700">
                    Subscriber
                  </Badge>
                ) : (
                  <Badge variant="default" className="flex-shrink-0 bg-green-100 text-green-700">
                    Student
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Since {joinedDate}</span>
                </div>
                {hasCourses && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>{mentee.purchased_content.length} {mentee.purchased_content.length === 1 ? 'course' : 'courses'}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="capitalize">{mentee.status}</span>
                </div>
              </div>

              {/* Quick chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                {hasCourses ? (
                  <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
                    Has courses
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    No courses yet
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Link href={`/mentor/mentees/${menteeUser.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Link href={`/messages/${menteeUser.id}`}>
                  <Button size="sm" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}
