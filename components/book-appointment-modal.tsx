'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorId: string;
  mentorName: string;
}

export function BookAppointmentModal({ isOpen, onClose, mentorId, mentorName }: BookAppointmentModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedDate || !selectedTime || !appointmentType || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call preparation
    const appointmentData = {
      mentor_id: mentorId,
      date: selectedDate,
      time: selectedTime,
      appointment_type: appointmentType,
      message: message.trim(),
      requested_at: new Date().toISOString(),
    };

    console.log('📅 Appointment request data (ready for API):', appointmentData);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);

    // Show coming soon message
    toast.success('Appointment request feature is coming soon! 🚀', {
      description: 'We\'re setting up mentor appointments. Your request has been logged.',
    });

    // Reset form
    setSelectedDate('');
    setSelectedTime('');
    setAppointmentType('');
    setMessage('');
    onClose();
  };

  const handleCancel = () => {
    setSelectedDate('');
    setSelectedTime('');
    setAppointmentType('');
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Book Appointment with {mentorName}
          </DialogTitle>
          <DialogDescription>
            Schedule a one-on-one session with your mentor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Coming Soon Notice */}
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Preview Feature
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  We're setting up mentor appointments. This is a preview of what's coming soon!
                </p>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="appointment-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Preferred Date
            </Label>
            <Input
              id="appointment-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full"
            />
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="appointment-time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Preferred Time
            </Label>
            <Input
              id="appointment-time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
              className="w-full"
            />
          </div>

          {/* Appointment Type */}
          <div className="space-y-2">
            <Label htmlFor="appointment-type">Session Type</Label>
            <Select value={appointmentType} onValueChange={setAppointmentType} required>
              <SelectTrigger id="appointment-type">
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video_call">Video Call</SelectItem>
                <SelectItem value="phone_call">Phone Call</SelectItem>
                <SelectItem value="in_person">In Person</SelectItem>
                <SelectItem value="messaging">Messaging Session</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message/Reason */}
          <div className="space-y-2">
            <Label htmlFor="appointment-message">
              Message / Reason for Appointment
            </Label>
            <Textarea
              id="appointment-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell your mentor what you'd like to discuss..."
              rows={4}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Help your mentor prepare by briefly describing your goals
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
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
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Appointment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
