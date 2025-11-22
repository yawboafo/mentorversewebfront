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
  user_id: string;
  full_name: string;
  headline: string;
  short_bio: string;
  long_bio: string;
  areas_of_expertise: string[];
  experience_years: number;
  languages: string[];
  social_links: Record<string, string>;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
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
  mentor_id: string;
  mentor_name: string;
  title: string;
  description: string;
  content_type: ContentType;
  format: ContentFormat;
  target_audience: string;
  problem_it_solves: string;
  learning_outcomes: string[];
  delivery_modes: DeliveryMode[];
  estimated_duration: string;
  max_participants?: number;
  location?: string;
  tools: string[];
  prerequisites: string;
  required_time_per_week: string;
  support_model: string;
  price: number;
  currency: string;
  tags: string[];
  status: ContentStatus;
  ai_context: string;
  created_at: string;
  updated_at: string;
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
