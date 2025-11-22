// User & Auth Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  account_type: 'individual' | 'business';
  role: 'user' | 'mentor' | 'admin';
  onboarding_completed: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  account_type: 'individual' | 'business';
}

// Onboarding Types
export interface IndividualOnboarding {
  goals: string[];
  primary_focus: 'career' | 'business' | 'mindset' | 'lifestyle' | 'other';
  current_challenges: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
}

export interface BusinessOnboarding {
  business_name: string;
  industry: string;
  company_size: string;
  description: string;
  main_challenge: string;
  location: string;
}

// Dashboard Types
export interface DashboardData {
  user: User;
  purchased_content_count: number;
  recent_content: ContentSummary[];
  suggested_content: ContentSummary[];
  recent_ai_sessions: AiSessionSummary[];
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
  content_id: string;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id?: string;
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
  sender: 'user' | 'ai';
  content: string;
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

// Admin Types
export interface MentorApplicationAdmin extends Mentor {
  user_email: string;
}
