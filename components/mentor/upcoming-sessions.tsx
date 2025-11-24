'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Video, Phone, MapPin, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Appointment } from '@/lib/api/appointments';

interface UpcomingSessionsProps {
  appointments: Appointment[];
  isLoading?: boolean;
}

const getSessionIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'call':
    case 'phone':
      return <Phone className="h-4 w-4" />;
    case 'in-person':
    case 'in_person':
      return <MapPin className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Confirmed</Badge>;
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="text-red-600">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function UpcomingSessions({ appointments, isLoading }: UpcomingSessionsProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-7 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Appointments</h2>
            <p className="text-sm text-muted-foreground">Manage your sessions with mentees</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild size="sm" variant="outline" className="hidden sm:flex">
              <Link href="/mentor/appointments">
                <Calendar className="h-4 w-4 mr-2" />
                Manage appointments
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary">
              <Link href="/mentor/appointments">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground mb-4">No upcoming sessions</p>
            <Button asChild variant="link" className="text-primary">
              <Link href="/mentor/appointments">View all appointments</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 5).map((appointment) => {
              const mentee = appointment.mentee;
              const apptData = appointment as any;
              
              // Format date and time
              let dateDisplay: string;
              let timeDisplay: string;
              
              try {
                if (apptData.scheduledDate && apptData.startTime) {
                  dateDisplay = format(parseISO(apptData.scheduledDate), 'MMM d, yyyy');
                  
                  const [startHours, startMinutes] = apptData.startTime.split(':').map(Number);
                  const startAmpm = startHours >= 12 ? 'PM' : 'AM';
                  const startDisplayHour = startHours % 12 || 12;
                  
                  let endTime = '';
                  if (apptData.endTime) {
                    const [endHours, endMinutes] = apptData.endTime.split(':').map(Number);
                    const endAmpm = endHours >= 12 ? 'PM' : 'AM';
                    const endDisplayHour = endHours % 12 || 12;
                    endTime = ` - ${endDisplayHour}:${endMinutes.toString().padStart(2, '0')} ${endAmpm}`;
                  }
                  
                  timeDisplay = `${startDisplayHour}:${startMinutes.toString().padStart(2, '0')} ${startAmpm}${endTime}`;
                } else {
                  const date = parseISO(apptData.scheduled_at || apptData.date);
                  dateDisplay = format(date, 'MMM d, yyyy');
                  timeDisplay = format(date, 'h:mm a');
                }
              } catch (e) {
                dateDisplay = 'Invalid date';
                timeDisplay = '';
              }
              
              const initials = mentee?.fullName
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase() || '?';

              return (
                <div
                  key={appointment.id}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800 transition-colors"
                >
                  {/* Date & Time */}
                  <div className="flex-shrink-0 w-24 text-sm">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{dateDisplay}</div>
                    <div className="text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {timeDisplay}
                    </div>
                  </div>

                  {/* Mentee Info */}
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <Link href={`/mentor/mentees/${mentee?.id}`}>
                      <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-white dark:ring-gray-950 hover:ring-purple-200 dark:hover:ring-purple-800 transition-all">
                        <AvatarImage src={mentee?.profilePhoto} alt={mentee?.fullName} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/mentor/mentees/${mentee?.id}`}
                        className="font-medium hover:text-purple-600 dark:hover:text-purple-400 transition-colors block truncate"
                      >
                        {mentee?.fullName || 'Unknown Mentee'}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {getSessionIcon(apptData.type || apptData.session_type)}
                        <span className="capitalize">{apptData.type || apptData.session_type || 'Session'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {getStatusBadge(apptData.status)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
