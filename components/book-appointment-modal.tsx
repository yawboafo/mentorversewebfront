'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { appointmentsApi } from '@/lib/api/appointments';
import type { AvailableSlot } from '@/lib/api/appointments';
import { format, parseISO } from 'date-fns';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorId: string;
  mentorName: string;
}

export function BookAppointmentModal({ isOpen, onClose, mentorId, mentorName }: BookAppointmentModalProps) {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAvailability, setHasAvailability] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAvailableSlots();
    }
  }, [isOpen, mentorId, duration]);

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      
      // Check if mentor has availability set up
      const hasSetup = await appointmentsApi.hasMentorSetUpAvailability(mentorId);
      setHasAvailability(hasSetup);

      if (!hasSetup) {
        setLoadingSlots(false);
        return;
      }

      // Load available slots for the next 14 days
      const slots = await appointmentsApi.getAvailableSlotsForNextDays(mentorId, 14, duration);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Failed to load available slots:', error);
      toast.error('Failed to load available time slots');
      setHasAvailability(false);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    setIsSubmitting(true);

    try {
      await appointmentsApi.bookAppointment({
        mentorId,
        startTime: selectedSlot.startTime,
        duration,
        notes: notes.trim() || undefined,
      });

      toast.success('Appointment booked successfully!', {
        description: `Your session with ${mentorName} has been scheduled.`,
      });

      // Reset form
      setSelectedSlot(null);
      setNotes('');
      onClose();
    } catch (error: any) {
      console.error('Failed to book appointment:', error);
      toast.error(error.message || 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedSlot(null);
    setNotes('');
    onClose();
  };

  const groupSlotsByDate = () => {
    const grouped: Record<string, AvailableSlot[]> = {};
    availableSlots.forEach((slot) => {
      const date = format(parseISO(slot.startTime), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });
    return grouped;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Book Appointment with {mentorName}
          </DialogTitle>
          <DialogDescription>
            Schedule a one-on-one session with your mentor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {/* Loading State */}
            {loadingSlots && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-3" />
                <span className="text-muted-foreground">Loading available times...</span>
              </div>
            )}

            {/* No Availability Set Up */}
            {!loadingSlots && hasAvailability === false && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      No Availability Set
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      This mentor hasn't set up their availability yet. Please check back later or contact them directly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Available Slots */}
            {!loadingSlots && hasAvailability && availableSlots.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label>Session Duration</Label>
                  <Select
                    value={duration.toString()}
                    onValueChange={(val) => {
                      setDuration(Number(val));
                      setSelectedSlot(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Select a Time Slot</Label>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {Object.entries(groupSlotsByDate()).map(([date, slots]) => (
                      <div key={date} className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground sticky top-0 bg-background py-1">
                          {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map((slot, idx) => {
                            const isSelected = selectedSlot?.startTime === slot.startTime;
                            return (
                              <Button
                                key={idx}
                                type="button"
                                variant={isSelected ? 'default' : 'outline'}
                                size="sm"
                                className={`justify-start ${isSelected ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                                onClick={() => setSelectedSlot(slot)}
                              >
                                {isSelected && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                <Clock className="h-3 w-3 mr-1" />
                                {format(parseISO(slot.startTime), 'h:mm a')}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Let your mentor know what you'd like to discuss..."
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Help your mentor prepare by briefly describing your goals
                  </p>
                </div>
              </>
            )}

            {/* No Available Slots */}
            {!loadingSlots && hasAvailability && availableSlots.length === 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      No Available Slots
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      There are no available time slots in the next 14 days for the selected duration. Try changing the duration or check back later.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {hasAvailability && availableSlots.length > 0 && (
            <DialogFooter className="mt-4 gap-2 sm:gap-0 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedSlot}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
