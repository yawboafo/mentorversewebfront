'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { appointmentsApi } from '@/lib/api/appointments';
import type { DayOfWeek, RecurringAvailability, TimeSlot, MentorAvailability } from '@/lib/api/appointments';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export function AvailabilityCalendar() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timezone, setTimezone] = useState('America/New_York');
  const [bufferTime, setBufferTime] = useState(15);
  const [advanceBookingDays, setAdvanceBookingDays] = useState(30);
  const [schedule, setSchedule] = useState<RecurringAvailability[]>([]);
  const [availability, setAvailability] = useState<MentorAvailability | null>(null);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      // Get current user's mentor ID (you'll need to get this from your auth context)
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        // Initialize empty schedule if no user
        setSchedule(
          DAYS.map((day) => ({
            dayOfWeek: day,
            slots: [],
          }))
        );
        return;
      }
      
      const user = JSON.parse(userStr);
      const response = await appointmentsApi.getMentorAvailability(user.id);
      
      console.log('Loaded availability from backend:', response);
      
      // Handle wrapped response {success: true, data: [...]}
      const availabilityData = (response as any).data || response;
      const availability = (response as any).success ? availabilityData : response;
      
      setAvailability(availability as any);
      
      // Extract settings from the response or array
      if (Array.isArray(availability)) {
        // Backend returned flat array directly
        const firstSlot = availability[0];
        if (firstSlot) {
          setTimezone(firstSlot.timezone || 'America/New_York');
        }
      } else {
        // Backend returned object with settings
        setTimezone(availability.timezone || 'America/New_York');
        setBufferTime(availability.bufferTimeBetweenSessions || 15);
        setAdvanceBookingDays(availability.advanceBookingDays || 30);
      }
      
      // Handle different data structures
      let existingSchedule: any[] = [];
      
      if (Array.isArray(availability)) {
        // Backend returned flat array - convert to nested
        console.log('Converting flat array to nested structure');
        const grouped = availability.reduce((acc: any, slot: any) => {
          const day = slot.dayOfWeek;
          if (!acc[day]) {
            acc[day] = { dayOfWeek: day, slots: [] };
          }
          acc[day].slots.push({
            startTime: slot.startTime,
            endTime: slot.endTime,
          });
          return acc;
        }, {});
        existingSchedule = Object.values(grouped);
      } else if (Array.isArray(availability.recurringSchedule)) {
        // Old nested structure
        console.log('Using nested structure');
        existingSchedule = availability.recurringSchedule;
      } else if (Array.isArray((availability as any).availability)) {
        // Another flat structure variant
        console.log('Converting availability field to nested');
        const flatAvailability = (availability as any).availability;
        const grouped = flatAvailability.reduce((acc: any, slot: any) => {
          const day = slot.dayOfWeek;
          if (!acc[day]) {
            acc[day] = { dayOfWeek: day, slots: [] };
          }
          acc[day].slots.push({
            startTime: slot.startTime,
            endTime: slot.endTime,
          });
          return acc;
        }, {});
        existingSchedule = Object.values(grouped);
      }
      
      console.log('Existing schedule:', existingSchedule);
      
      const fullSchedule = DAYS.map((day) => {
        const existing = existingSchedule.find((s: any) => s && s.dayOfWeek === day);
        return existing || { dayOfWeek: day, slots: [] };
      });
      
      console.log('Full schedule with all days:', fullSchedule);
      setSchedule(fullSchedule);
    } catch (error: any) {
      if (error.status === 404) {
        // No availability set yet, initialize empty schedule
        setSchedule(
          DAYS.map((day) => ({
            dayOfWeek: day,
            slots: [],
          }))
        );
      } else {
        console.error('Failed to load availability:', error);
        // Initialize empty schedule on error too
        setSchedule(
          DAYS.map((day) => ({
            dayOfWeek: day,
            slots: [],
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = (dayOfWeek: DayOfWeek) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              slots: [
                ...day.slots,
                { startTime: '09:00', endTime: '10:00' },
              ],
            }
          : day
      )
    );
  };

  const removeTimeSlot = (dayOfWeek: DayOfWeek, slotIndex: number) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              slots: day.slots.filter((_, i) => i !== slotIndex),
            }
          : day
      )
    );
  };

  const updateTimeSlot = (
    dayOfWeek: DayOfWeek,
    slotIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              slots: day.slots.map((slot, i) =>
                i === slotIndex ? { ...slot, [field]: value } : slot
              ),
            }
          : day
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Filter out days with no slots
      const filteredSchedule = schedule.filter((day) => day.slots.length > 0);

      // Validate that at least one time slot exists
      if (filteredSchedule.length === 0) {
        alert('Please add at least one time slot before saving.');
        setSaving(false);
        return;
      }

      // Flatten slots into individual availability entries as backend expects
      const availabilityArray = filteredSchedule.flatMap(day => 
        day.slots.map(slot => ({
          dayOfWeek: day.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          timezone: timezone,
        }))
      );

      const payload = {
        availability: availabilityArray,
        bufferTimeBetweenSessions: bufferTime,
        advanceBookingDays: advanceBookingDays,
      };

      console.log('Sending availability payload:', JSON.stringify(payload, null, 2));

      await appointmentsApi.setAvailability(payload as any);

      alert('Availability saved successfully!');
      // Reload to get the saved data from backend
      await loadAvailability();
    } catch (error: any) {
      console.error('Failed to save availability:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        response: error.response
      });
      const errorMessage = error.message || 'Failed to save availability. Please try again.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
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

  // Calculate total available hours per week
  const totalSlotsCount = schedule.reduce((total, day) => total + day.slots.length, 0);
  const hasAvailability = totalSlotsCount > 0;

  return (
    <div className="space-y-6">
      {/* Current Availability Summary */}
      {hasAvailability && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Current Availability
                </CardTitle>
                <CardDescription className="mt-1">
                  You have {totalSlotsCount} time slot{totalSlotsCount !== 1 ? 's' : ''} configured
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedule
                .filter(day => day.slots.length > 0)
                .map((day) => (
                  <div key={day.dayOfWeek} className="rounded-lg border bg-background p-3">
                    <div className="font-semibold text-sm mb-2">{DAY_LABELS[day.dayOfWeek]}</div>
                    <div className="space-y-1">
                      {day.slots.map((slot, idx) => (
                        <div key={idx} className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {slot.startTime} - {slot.endTime}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                Timezone: {timezone}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Buffer: {bufferTime} min
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  Advance booking: {advanceBookingDays} days
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure your availability preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buffer">Buffer Time (minutes)</Label>
              <Input
                id="buffer"
                type="number"
                min={0}
                max={60}
                value={bufferTime}
                onChange={(e) => setBufferTime(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="advance">Advance Booking (days)</Label>
              <Input
                id="advance"
                type="number"
                min={1}
                max={90}
                value={advanceBookingDays}
                onChange={(e) => setAdvanceBookingDays(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>Set your available hours for each day of the week</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {DAYS.map((day) => {
            const daySchedule = (schedule || []).find((s) => s.dayOfWeek === day);
            if (!daySchedule) return null;

            return (
              <div key={day} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{DAY_LABELS[day]}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTimeSlot(day)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time Slot
                  </Button>
                </div>

                {daySchedule.slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No availability set</p>
                ) : (
                  <div className="space-y-2">
                    {daySchedule.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            updateTimeSlot(day, slotIndex, 'startTime', e.target.value)
                          }
                          className="w-32"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) =>
                            updateTimeSlot(day, slotIndex, 'endTime', e.target.value)
                          }
                          className="w-32"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTimeSlot(day, slotIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Availability
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
