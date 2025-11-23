import { apiClient } from './client';

// =============== TYPES ===============

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled_by_mentee'
  | 'cancelled_by_mentor'
  | 'no_show'
  | 'rescheduled';

export interface TimeSlot {
  startTime: string; // HH:mm format (e.g., "09:00")
  endTime: string;   // HH:mm format (e.g., "10:00")
}

export interface RecurringAvailability {
  dayOfWeek: DayOfWeek;
  slots: TimeSlot[];
}

export interface AvailabilityException {
  id: string;
  mentorId: string;
  date: string; // YYYY-MM-DD format
  isAvailable: boolean;
  reason?: string;
  slots?: TimeSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface MentorAvailability {
  id: string;
  mentorId: string;
  timezone: string;
  recurringSchedule: RecurringAvailability[];
  exceptions: AvailabilityException[];
  bufferTimeBetweenSessions: number; // minutes
  advanceBookingDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlot {
  startTime: string; // ISO 8601 timestamp
  endTime: string;   // ISO 8601 timestamp
  duration: number;  // minutes
}

export interface Appointment {
  id: string;
  mentorId: string;
  menteeId: string;
  startTime: string; // ISO 8601 timestamp
  endTime: string;   // ISO 8601 timestamp
  duration: number;  // minutes
  status: AppointmentStatus;
  meetingLink?: string;
  notes?: string;
  cancellationReason?: string;
  rescheduledFrom?: string;
  createdAt: string;
  updatedAt: string;
  mentor: {
    id: string;
    fullName: string;
    email: string;
    profilePhoto?: string;
  };
  mentee: {
    id: string;
    fullName: string;
    email: string;
    profilePhoto?: string;
  };
}

export interface AppointmentsListResponse {
  data: Appointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============== REQUEST TYPES ===============

export interface SetAvailabilityRequest {
  timezone: string;
  recurringSchedule: RecurringAvailability[];
  bufferTimeBetweenSessions?: number;
  advanceBookingDays?: number;
}

export interface AddExceptionRequest {
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  reason?: string;
  slots?: TimeSlot[];
}

export interface BookAppointmentRequest {
  mentorId: string;
  startTime: string; // ISO 8601 timestamp
  duration: number;  // minutes (typically 30, 60, etc.)
  notes?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
  cancellationReason?: string;
}

export interface RescheduleAppointmentRequest {
  newStartTime: string; // ISO 8601 timestamp
  reason?: string;
}

export interface GetAvailableSlotsQuery {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  duration?: number; // minutes (default: 60)
}

export interface GetAppointmentsQuery {
  status?: AppointmentStatus;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  page?: number;
  limit?: number;
}

// =============== API FUNCTIONS ===============

export const appointmentsApi = {
  // =============== AVAILABILITY MANAGEMENT (Mentor Only) ===============
  
  /**
   * Set or update mentor's recurring availability schedule
   * @param data - Availability configuration
   */
  async setAvailability(data: SetAvailabilityRequest): Promise<MentorAvailability> {
    return apiClient.post<MentorAvailability>('/mentors/me/availability', data);
  },

  /**
   * Get mentor's availability schedule
   * @param mentorId - Mentor user ID
   */
  async getMentorAvailability(mentorId: string): Promise<MentorAvailability> {
    return apiClient.get<MentorAvailability>(`/mentors/${mentorId}/availability`);
  },

  /**
   * Add an exception to recurring availability (e.g., day off, special hours)
   * @param data - Exception details
   */
  async addAvailabilityException(data: AddExceptionRequest): Promise<AvailabilityException> {
    return apiClient.post<AvailabilityException>('/mentors/me/availability/exceptions', data);
  },

  /**
   * Get all availability exceptions for a mentor
   * @param mentorId - Mentor user ID
   */
  async getAvailabilityExceptions(mentorId: string): Promise<AvailabilityException[]> {
    return apiClient.get<AvailabilityException[]>(`/mentors/${mentorId}/availability/exceptions`);
  },

  /**
   * Delete an availability exception
   * @param exceptionId - Exception ID to delete
   */
  async deleteAvailabilityException(exceptionId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/availability/exceptions/${exceptionId}`);
  },

  // =============== AVAILABLE SLOTS DISCOVERY ===============

  /**
   * Get available time slots for a mentor within a date range
   * @param mentorId - Mentor user ID
   * @param query - Date range and duration filters
   */
  async getAvailableSlots(
    mentorId: string,
    query: GetAvailableSlotsQuery
  ): Promise<AvailableSlot[]> {
    const params = new URLSearchParams();
    params.append('startDate', query.startDate);
    params.append('endDate', query.endDate);
    if (query.duration) params.append('duration', query.duration.toString());

    return apiClient.get<AvailableSlot[]>(
      `/mentors/${mentorId}/available-slots?${params.toString()}`
    );
  },

  // =============== APPOINTMENT BOOKING ===============

  /**
   * Book an appointment with a mentor
   * @param data - Appointment booking details
   */
  async bookAppointment(data: BookAppointmentRequest): Promise<Appointment> {
    return apiClient.post<Appointment>('/appointments', data);
  },

  /**
   * Get list of appointments (for current user - mentor or mentee)
   * @param query - Optional filters
   */
  async getAppointments(query?: GetAppointmentsQuery): Promise<AppointmentsListResponse> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    const endpoint = `/appointments${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get<AppointmentsListResponse>(endpoint);
  },

  /**
   * Get a specific appointment by ID
   * @param appointmentId - Appointment ID
   */
  async getAppointment(appointmentId: string): Promise<Appointment> {
    return apiClient.get<Appointment>(`/appointments/${appointmentId}`);
  },

  /**
   * Update appointment status
   * @param appointmentId - Appointment ID
   * @param data - Status update data
   */
  async updateAppointmentStatus(
    appointmentId: string,
    data: UpdateAppointmentStatusRequest
  ): Promise<Appointment> {
    return apiClient.patch<Appointment>(`/appointments/${appointmentId}/status`, data);
  },

  /**
   * Cancel an appointment
   * @param appointmentId - Appointment ID
   * @param reason - Cancellation reason
   */
  async cancelAppointment(
    appointmentId: string,
    reason?: string
  ): Promise<Appointment> {
    return apiClient.post<Appointment>(`/appointments/${appointmentId}/cancel`, {
      reason,
    });
  },

  /**
   * Reschedule an appointment
   * @param appointmentId - Appointment ID
   * @param data - Reschedule details
   */
  async rescheduleAppointment(
    appointmentId: string,
    data: RescheduleAppointmentRequest
  ): Promise<Appointment> {
    return apiClient.post<Appointment>(`/appointments/${appointmentId}/reschedule`, data);
  },

  // =============== HELPER FUNCTIONS ===============

  /**
   * Get upcoming appointments for the current user
   */
  async getUpcomingAppointments(limit: number = 10): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await this.getAppointments({
      startDate: today,
      status: 'scheduled',
      limit,
    });
    return response.data;
  },

  /**
   * Get past appointments for the current user
   */
  async getPastAppointments(page: number = 1, limit: number = 20): Promise<AppointmentsListResponse> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointments({
      endDate: today,
      status: 'completed',
      page,
      limit,
    });
  },

  /**
   * Get cancelled appointments
   */
  async getCancelledAppointments(page: number = 1, limit: number = 20): Promise<Appointment[]> {
    const response = await this.getAppointments({
      page,
      limit,
    });
    // Filter cancelled appointments
    return response.data.filter(
      (apt) =>
        apt.status === 'cancelled_by_mentee' || apt.status === 'cancelled_by_mentor'
    );
  },

  /**
   * Check if a mentor has availability set up
   */
  async hasMentorSetUpAvailability(mentorId: string): Promise<boolean> {
    try {
      const response = await this.getMentorAvailability(mentorId);
      
      // Handle wrapped response {success: true, data: [...]}
      const availabilityData = (response as any).data || response;
      const availability = (response as any).success ? availabilityData : response;
      
      // Check if it's a direct array (flat structure)
      if (Array.isArray(availability)) {
        return availability.length > 0;
      }
      
      // Check nested structure
      if (availability.recurringSchedule && Array.isArray(availability.recurringSchedule)) {
        return availability.recurringSchedule.length > 0;
      }
      
      // Check availability field
      if ((availability as any).availability && Array.isArray((availability as any).availability)) {
        return (availability as any).availability.length > 0;
      }
      
      return false;
    } catch (error: any) {
      if (error.status === 404) return false;
      throw error;
    }
  },

  /**
   * Get available slots for the next N days
   */
  async getAvailableSlotsForNextDays(
    mentorId: string,
    days: number = 7,
    duration: number = 60
  ): Promise<AvailableSlot[]> {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    return this.getAvailableSlots(mentorId, {
      startDate,
      endDate,
      duration,
    });
  },

  /**
   * Confirm an appointment (mentor only)
   */
  async confirmAppointment(appointmentId: string): Promise<Appointment> {
    return this.updateAppointmentStatus(appointmentId, {
      status: 'confirmed',
    });
  },

  /**
   * Mark appointment as completed (mentor only)
   */
  async completeAppointment(appointmentId: string): Promise<Appointment> {
    return this.updateAppointmentStatus(appointmentId, {
      status: 'completed',
    });
  },

  /**
   * Mark appointment as no-show (mentor only)
   */
  async markNoShow(appointmentId: string): Promise<Appointment> {
    return this.updateAppointmentStatus(appointmentId, {
      status: 'no_show',
    });
  },
};
