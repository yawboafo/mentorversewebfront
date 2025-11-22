import { apiClient } from './client';
import type { IndividualOnboarding, BusinessOnboarding } from './types';

export const onboardingApi = {
  async submitIndividual(data: IndividualOnboarding): Promise<void> {
    // Transform snake_case to camelCase for backend API
    const requestBody = {
      bio: data.bio,
      goals: data.goals,
      primaryFocusArea: data.primary_focus,
      currentChallenges: data.current_challenges,
      experienceLevel: data.experience_level,
    };
    
    console.log('📤 Sending individual onboarding:', requestBody);
    return apiClient.post('/me/onboarding/individual', requestBody);
  },

  async submitBusiness(data: BusinessOnboarding): Promise<void> {
    // Transform snake_case to camelCase for backend API
    const requestBody = {
      businessName: data.business_name,
      industry: data.industry,
      companySize: data.company_size,
      website: data.website,
      description: data.description,
      mainChallenge: data.main_challenge,
      monthlyRevenueRange: data.monthly_revenue_range,
      location: data.location,
    };
    
    console.log('📤 Sending business onboarding:', requestBody);
    return apiClient.post('/me/onboarding/business', requestBody);
  },
};
