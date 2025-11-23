'use client';

import { AppointmentsManager } from '@/components/appointments-manager';

export default function MentorAppointmentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <p className="text-muted-foreground mt-2">
          Manage your mentorship sessions with students
        </p>
      </div>
      
      <AppointmentsManager role="mentor" />
    </div>
  );
}
