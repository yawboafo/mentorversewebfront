import { apiClient } from './client';
import type { DashboardData } from './types';

export const dashboardApi = {
  async getDashboard(): Promise<DashboardData> {
    return apiClient.get<DashboardData>('/me/dashboard');
  },
};
