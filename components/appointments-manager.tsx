'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, parseISO, addDays, startOfWeek, addWeeks } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { appointmentsApi } from '@/lib/api/appointments';
import type { Appointment, AppointmentStatus } from '@/lib/api/appointments';

interface AppointmentsManagerProps {
  userRole: 'mentor' | 'mentee';
}

export function AppointmentsManager({ userRole }: AppointmentsManagerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  useEffect(() => {
    loadAppointments();
  }, [selectedTab]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      let data: Appointment[] = [];

      if (selectedTab === 'upcoming') {
        data = await appointmentsApi.getUpcomingAppointments();
      } else if (selectedTab === 'past') {
        const response = await appointmentsApi.getPastAppointments();
        data = response.data;
      } else {
        data = await appointmentsApi.getCancelledAppointments();
      }

      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentsApi.cancelAppointment(appointmentId, 'User requested cancellation');
      loadAppointments();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await appointmentsApi.confirmAppointment(appointmentId);
      loadAppointments();
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await appointmentsApi.completeAppointment(appointmentId);
      loadAppointments();
    } catch (error) {
      console.error('Failed to complete appointment:', error);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig: Record<AppointmentStatus, { variant: any; label: string; icon: any }> = {
      scheduled: { variant: 'default', label: 'Scheduled', icon: Clock },
      confirmed: { variant: 'default', label: 'Confirmed', icon: CheckCircle },
      completed: { variant: 'secondary', label: 'Completed', icon: CheckCircle },
      cancelled_by_mentee: { variant: 'destructive', label: 'Cancelled', icon: XCircle },
      cancelled_by_mentor: { variant: 'destructive', label: 'Cancelled', icon: XCircle },
      no_show: { variant: 'destructive', label: 'No Show', icon: AlertCircle },
      rescheduled: { variant: 'secondary', label: 'Rescheduled', icon: Clock },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Appointments</h2>
        <p className="text-muted-foreground">
          Manage your {userRole === 'mentor' ? 'mentoring' : 'learning'} sessions
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Appointments</h3>
                <p className="text-muted-foreground">
                  {selectedTab === 'upcoming'
                    ? 'You have no upcoming appointments'
                    : selectedTab === 'past'
                    ? 'You have no past appointments'
                    : 'You have no cancelled appointments'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appointment) => {
                const otherUser = userRole === 'mentor' ? appointment.mentee : appointment.mentor;
                const apptData = appointment as any;
                
                // Handle both ISO format and backend's format
                let dateDisplay: string;
                let timeDisplay: string;
                
                try {
                  if (apptData.scheduledDate && apptData.startTime && apptData.startTime.includes(':')) {
                    // Backend format: separate date and time fields
                    dateDisplay = format(parseISO(apptData.scheduledDate), 'EEEE, MMMM d, yyyy');
                    
                    // Parse start time
                    const [startHours, startMinutes] = apptData.startTime.split(':').map(Number);
                    const startAmpm = startHours >= 12 ? 'PM' : 'AM';
                    const startDisplayHour = startHours % 12 || 12;
                    
                    // Parse end time
                    const [endHours, endMinutes] = apptData.endTime.split(':').map(Number);
                    const endAmpm = endHours >= 12 ? 'PM' : 'AM';
                    const endDisplayHour = endHours % 12 || 12;
                    
                    timeDisplay = `${startDisplayHour}:${String(startMinutes).padStart(2, '0')} ${startAmpm} - ${endDisplayHour}:${String(endMinutes).padStart(2, '0')} ${endAmpm}`;
                  } else {
                    // ISO format fallback
                    const startTime = parseISO(appointment.startTime);
                    const endTime = parseISO(appointment.endTime);
                    dateDisplay = format(startTime, 'EEEE, MMMM d, yyyy');
                    timeDisplay = `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
                  }
                } catch (error) {
                  console.error('Error parsing appointment times:', error, appointment);
                  dateDisplay = 'Date not available';
                  timeDisplay = 'Time not available';
                }

                return (
                  <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14">
                            <AvatarImage src={otherUser.profilePhoto} alt={otherUser.fullName} />
                            <AvatarFallback>
                              {otherUser.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{otherUser.fullName}</h3>
                            <p className="text-sm text-muted-foreground">{otherUser.email}</p>
                          </div>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>

                      <Separator className="my-4" />

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{dateDisplay}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{timeDisplay}</span>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Notes:</p>
                          <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                        </div>
                      )}

                      {appointment.cancellationReason && (
                        <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                          <p className="text-sm font-medium mb-1 text-destructive">
                            Cancellation Reason:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.cancellationReason}
                          </p>
                        </div>
                      )}

                      {selectedTab === 'upcoming' && (
                        <div className="flex gap-2 mt-4">
                          {appointment.meetingLink && (
                            <Button asChild className="flex-1">
                              <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer">
                                <Video className="h-4 w-4 mr-2" />
                                Join Meeting
                              </a>
                            </Button>
                          )}

                          {userRole === 'mentor' && appointment.status === 'scheduled' && (
                            <Button
                              variant="outline"
                              onClick={() => handleConfirmAppointment(appointment.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm
                            </Button>
                          )}

                          {userRole === 'mentor' &&
                            appointment.status === 'confirmed' &&
                            new Date(appointment.endTime) < new Date() && (
                              <Button
                                variant="outline"
                                onClick={() => handleCompleteAppointment(appointment.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                              </Button>
                            )}

                          {appointment.status === 'scheduled' || appointment.status === 'confirmed' ? (
                            <Button
                              variant="destructive"
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          ) : null}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
