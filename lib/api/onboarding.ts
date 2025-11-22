import { apiClient } from './client';
import type { IndividualOnboarding, BusinessOnboarding, OnboardingResponse, BackendOnboardingResponse } from './types';
import { transformOnboardingResponse } from './types';

export const onboardingApi = {
  async submitIndividual(data: IndividualOnboarding): Promise<OnboardingResponse> {
    // Transform snake_case to camelCase for backend API
    const requestBody = {
      bio: data.bio,
      goals: data.goals,
      primaryFocusArea: data.primary_focus,
      currentChallenges: data.current_challenges,
      experienceLevel: data.experience_level,
    };
    
    console.log('📤 Sending individual onboarding:', requestBody);
    const backendResponse = await apiClient.post<BackendOnboardingResponse>('/me/onboarding/individual', requestBody);
    console.log('✅ Onboarding response received:', backendResponse);
    
    // Transform backend response to frontend format
    return transformOnboardingResponse(backendResponse);
  },

  async submitBusiness(data: BusinessOnboarding): Promise<OnboardingResponse> {
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
    const backendResponse = await apiClient.post<BackendOnboardingResponse>('/me/onboarding/business', requestBody);
    console.log('✅ Onboarding response received:', backendResponse);
    
    // Transform backend response to frontend format
    return transformOnboardingResponse(backendResponse);
  },
};
