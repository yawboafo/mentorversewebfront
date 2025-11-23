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
      const availability = await appointmentsApi.getMentorAvailability(user.id);
      
      setAvailability(availability);
      setTimezone(availability.timezone || 'America/New_York');
      setBufferTime(availability.bufferTimeBetweenSessions || 15);
      setAdvanceBookingDays(availability.advanceBookingDays || 30);
      
      // Ensure recurringSchedule is an array and fill in missing days
      const existingSchedule = availability.recurringSchedule || [];
      const fullSchedule = DAYS.map((day) => {
        const existing = existingSchedule.find((s: RecurringAvailability) => s.dayOfWeek === day);
        return existing || { dayOfWeek: day, slots: [] };
      });
      
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

      await appointmentsApi.setAvailability({
        timezone,
        recurringSchedule: filteredSchedule,
        bufferTimeBetweenSessions: bufferTime,
        advanceBookingDays,
      });

      alert('Availability saved successfully!');
      loadAvailability();
    } catch (error) {
      console.error('Failed to save availability:', error);
      alert('Failed to save availability. Please try again.');
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

  return (
    <div className="space-y-6">
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
