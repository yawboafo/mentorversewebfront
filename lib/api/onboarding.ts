import { apiClient } from './client';
import type { IndividualOnboarding, BusinessOnboarding } from './types';

export const onboardingApi = {
  async submitIndividual(data: IndividualOnboarding): Promise<void> {
    return apiClient.post('/me/onboarding/individual', data);
  },

  async submitBusiness(data: BusinessOnboarding): Promise<void> {
    return apiClient.post('/me/onboarding/business', data);
  },
};
