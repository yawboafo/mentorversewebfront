'use client';

import { AppointmentsManager } from '@/components/appointments-manager';

export default function UserAppointmentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <p className="text-muted-foreground mt-2">
          Manage your mentorship sessions
        </p>
      </div>
      
      <AppointmentsManager role="mentee" />
    </div>
  );
}
