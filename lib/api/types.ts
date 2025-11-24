// New Types for Mentor Flow
export type SignupIntent = 'user' | 'mentor';
export type MentorStatus = 'none' | 'pending_approval' | 'active' | 'suspended';

// Backend API Response Types (camelCase from backend)
interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  accountType: 'individual' | 'business';
  role: 'user' | 'mentor' | 'admin';
  onboardingCompleted?: boolean;
  createdAt: string;
  signupIntent?: SignupIntent;
  mentorStatus?: MentorStatus;
}

interface BackendLoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: BackendUser;
}

// Frontend Types (snake_case for consistency)
export interface User {
  id: string;
  email: string;
  full_name: string;
  account_type: 'individual' | 'business';
  role: 'user' | 'mentor' | 'admin';
  onboarding_completed: boolean;
  created_at: string;
  signup_intent?: SignupIntent;
  mentor_status?: MentorStatus;
  preferred_currency?: string; // v2.7.0: Auto-set from country
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: User;
}

// Helper to transform backend response to frontend format
export function transformLoginResponse(backend: BackendLoginResponse): LoginResponse {
  return {
    access_token: backend.accessToken,
    refresh_token: backend.refreshToken,
    token_type: 'Bearer',
    user: {
      id: backend.user.id,
      email: backend.user.email,
      full_name: backend.user.fullName,
      account_type: backend.user.accountType,
      role: backend.user.role,
      onboarding_completed: backend.user.onboardingCompleted ?? false,
      created_at: backend.user.createdAt,
      signup_intent: backend.user.signupIntent,
      mentor_status: backend.user.mentorStatus,
    },
  };
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  account_type: 'individual' | 'business';
}

// Onboarding Types
export interface IndividualOnboarding {
  bio?: string;
  goals: string[];
  primary_focus: 'career' | 'business' | 'mindset' | 'lifestyle' | 'other';
  current_challenges: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
}

export interface BusinessOnboarding {
  business_name: string;
  industry: string;
  company_size: string;
  website?: string;
  description: string;
  main_challenge: string;
  monthly_revenue_range?: string;
  location: string;
}

// Profile Types (Backend Response Format - camelCase)
interface BackendIndividualProfile {
  id: string;
  userId: string;
  bio?: string;
  goals: string[];
  primaryFocusArea: string;
  currentChallenges: string;
  experienceLevel: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendBusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  industry: string;
  companySize: string;
  website?: string;
  description: string;
  mainChallenge: string;
  monthlyRevenueRange?: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendOnboardingResponse {
  profile: BackendIndividualProfile | BackendBusinessProfile;
  user: BackendUser;
}

// Onboarding Response Type (Frontend Format)
export interface OnboardingResponse {
  profile: BackendIndividualProfile | BackendBusinessProfile;
  user: User;
}

// Helper to transform backend onboarding response to frontend format
export function transformOnboardingResponse(backend: BackendOnboardingResponse): OnboardingResponse {
  return {
    profile: backend.profile,
    user: {
      id: backend.user.id,
      email: backend.user.email,
      full_name: backend.user.fullName,
      account_type: backend.user.accountType,
      role: backend.user.role,
      onboarding_completed: backend.user.onboardingCompleted ?? true,
      created_at: backend.user.createdAt,
    },
  };
}

// Dashboard Types
export interface DashboardData {
  user: User;
  purchased_content_count: number;
  recent_content: ContentSummary[];
  suggested_content: ContentSummary[];
  recent_ai_sessions: AiSessionSummary[];
  mentors_count?: number;
  top_mentors?: TopMentor[];
}

export interface TopMentor {
  id: string;
  full_name: string;
  avatar_url?: string;
  mentor_profile?: {
    headline: string;
    short_bio: string;
    areas_of_expertise: string[];
    profile_image_url?: string;
    is_verified: boolean;
  };
}

// Mentor Types
export interface Mentor {
  id: string;
  userId: string;
  headline: string;
  shortBio: string;
  longBio: string;
  areasOfExpertise: string[];
  experienceYears: number;
  isVerified: boolean;
  socialLinks: Record<string, string>;
  languages: string[];
  status: string;
  profileImageUrl: string | null;
  introVideoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl: string;
    country: string;
  };
  // Convenience properties for display
  full_name?: string;
  areas_of_expertise?: string[];
  experience_years?: number;
}

export interface MentorApplication {
  headline: string;
  short_bio: string;
  long_bio: string;
  areas_of_expertise: string[];
  experience_years: number;
  languages: string[];
  social_links: Record<string, string>;
}

export interface MentorDashboard {
  mentor: Mentor;
  total_sales: number;
  total_purchases: number;
  top_content: ContentPerformance[];
  recent_purchases: Purchase[];
  total_mentees?: number;
  recent_mentees?: RecentMentee[];
}

export interface RecentMentee {
  id: string;
  full_name: string;
  avatar_url?: string;
  joined_at: string;
}

// Content Types
export type ContentType = 'framework' | 'course';
export type ContentFormat = 'video' | 'text' | 'interactive' | 'mixed';
export type DeliveryMode = 'self_paced' | 'one_on_one' | 'group' | 'in_person' | 'online';
export type ContentStatus = 'draft' | 'published' | 'archived';

export interface Content {
  id: string;
  mentorId: string;
  title: string;
  slug: string;
  description: string;
  contentType: ContentType;
  format: ContentFormat;
  targetAudience: string;
  problemItSolves: string | null;
  learningOutcomes: string[];
  deliveryModes: DeliveryMode[];
  estimatedDuration: string;
  maxParticipants?: number | null;
  location?: string | null;
  tools: string[];
  prerequisites: string | null;
  requiredTimePerWeek: string | null;
  supportModel: string | null;
  price: number;
  currency: string;
  // Currency conversion fields (when backend implements conversion)
  base_price?: number;
  base_currency?: string;
  display_price?: number;
  display_currency?: string;
  conversion_rate?: number;
  conversion_date?: string;
  thumbnailUrl: string | null;
  mediaUrl: string | null;
  mediaType: string;
  tags: string[];
  level: string;
  status: ContentStatus;
  outline: any[];
  aiContext: string | null;
  createdAt: string;
  updatedAt: string;
  mentor: {
    id: string;
    fullName: string;
    avatarUrl: string;
  };
  // Convenience properties for backward compatibility
  mentor_name?: string;
  content_type?: ContentType;
  estimated_duration?: string;
}

export interface ContentSummary {
  id: string;
  title: string;
  mentor_name: string;
  content_type: ContentType;
  price: number;
  currency: string;
  tags: string[];
  estimated_duration: string;
}

export interface ContentFull extends Content {
  outline: Module[];
}

// Legacy module type (kept for backward compatibility)
export interface Module {
  title: string;
  description: string;
  activities: Activity[];
  resources: Resource[];
}

export interface Activity {
  type: string;
  description: string;
}

export interface Resource {
  title: string;
  url: string;
  type: string;
}

// New enhanced types (imported from modules.ts for full functionality)
export type ResourceType = 'video' | 'image' | 'document' | 'link' | 'audio' | 'file';

export interface ContentModule {
  id: string;
  contentId: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentResource {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  resourceType: ResourceType;
  url: string;
  metadata?: {
    cloudinaryPublicId?: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    format?: string;
    [key: string]: any;
  };
  order: number;
  duration?: number; // For video/audio in seconds
  fileSize?: number; // In bytes
  mimeType?: string;
  isPreview: boolean; // For free preview content
  createdAt: string;
  updatedAt: string;
}

export interface ModuleWithResources extends ContentModule {
  resources: ContentResource[];
}

export interface ContentWithStructure {
  id: string;
  title: string;
  description: string;
  contentType: 'course' | 'framework';
  modules: ModuleWithResources[];
}

export interface ContentPerformance {
  content: ContentSummary;
  purchase_count: number;
  revenue: number;
}

// Purchase Types
export interface Purchase {
  id: string;
  user_id: string;
  content_id: string;
  content_title: string;
  amount: number;
  currency: string;
  purchased_at: string;
}

export interface CheckoutRequest {
  contentId: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  reference: string;
  access_code: string;
}

// AI Chat Types
export type ContextType = 'general' | 'content_specific';

export interface AiSession {
  id: string;
  user_id: string;
  context_type: ContextType;
  related_content_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface AiSessionSummary {
  id: string;
  context_type: ContextType;
  last_message: string;
  created_at: string;
}

export interface AiMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  response?: string;
  created_at: string;
  meta?: {
    used_content_ids?: string[];
    suggested_content?: ContentSummary[];
  };
}

export interface CreateSessionRequest {
  context_type: ContextType;
  related_content_ids?: string[];
}

export interface SendMessageRequest {
  content: string;
}

// AI Content Builder Types
export interface CourseIdea {
  title: string;
  description: string;
  target_audience: string;
  problem_it_solves: string;
  estimated_duration?: string;
  level?: string;
  key_topics?: string[];
}

// AI Content Generation Request Types (v2.6.0)
export interface GenerateIdeasRequest {
  prompt: string;
  target_audience?: string;
  focus_areas?: string[];
}

export interface GenerateDraftRequest {
  working_title: string;
  delivery_modes: string[];
  level: string;
  content_type: string;
  problem_it_solves: string;
  target_audience?: string;
  rough_outline?: string;
  estimated_duration?: string;
  additional_context?: string;
  auto_save?: boolean;
}

export interface RefineDraftRequest {
  instructions: string;
  content_id?: string;
  draft?: ContentDraft;
  fields_to_focus?: string[];
}

export interface ContentDraft {
  id?: string;
  title: string;
  description: string;
  content_type: ContentType;
  format?: ContentFormat;
  target_audience: string;
  problem_it_solves: string;
  learning_outcomes: string[];
  delivery_modes: DeliveryMode[];
  estimated_duration: string;
  level: string;
  prerequisites?: string;
  support_model?: string;
  outline: Module[];
  tags?: string[];
  tools?: string[];
  price?: number;
  currency?: string;
}

// Mentorship Types (v2.2.0)
export type RelationshipType = 'purchase_based' | 'one_on_one' | 'subscription' | 'group_program';
export type MentorshipStatus = 'active' | 'paused' | 'ended';

// Subscription Types
export interface SubscriptionStatus {
  is_subscribed: boolean;
  subscribed_at?: string;
}

export interface MenteeDetails {
  mentee: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    account_type: 'individual' | 'business';
    country?: string;
  };
  relationship_type: RelationshipType;
  status: MentorshipStatus;
  purchased_content: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url?: string;
    content_type: ContentType;
  }[];
  first_connected_at: string;
  last_activity_at?: string;
}

export interface MentorDetails {
  mentor: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    country?: string;
    mentor_profile: {
      headline: string;
      short_bio: string;
      areas_of_expertise: string[];
      profile_image_url?: string;
      is_verified: boolean;
    };
  };
  relationship_type: RelationshipType;
  status: MentorshipStatus;
  purchased_content_count: number;
  first_connected_at: string;
}

export interface MenteesResponse {
  data: MenteeDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface UserMentorsResponse {
  data: MentorDetails[];
}

// Admin Types
export interface MentorApplicationAdmin extends Omit<Mentor, 'user'> {
  user_email?: string;
  user?: {
    id: string;
    fullName: string;
    email?: string;
    avatarUrl?: string;
    country?: string;
  };
}

// Appointment Types (v2.4.0)
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
  startTime: string; // HH:mm format
  endTime: string;
}

export interface RecurringAvailability {
  dayOfWeek: DayOfWeek;
  slots: TimeSlot[];
}

export interface AvailabilityException {
  id: string;
  mentorId: string;
  date: string;
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
  bufferTimeBetweenSessions: number;
  advanceBookingDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  duration: number;
}

export interface Appointment {
  id: string;
  mentorId: string;
  menteeId: string;
  startTime: string;
  endTime: string;
  duration: number;
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
