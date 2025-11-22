import { mentorsApi } from '@/lib/api/mentors';
import { apiClient } from '@/lib/api/client';

jest.mock('@/lib/api/client');

describe('Mentors API', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMentors', () => {
    it('should get all mentors without query', async () => {
      const mockMentors = [
        {
          id: '1',
          user_id: 'u1',
          full_name: 'John Doe',
          headline: 'Senior Developer',
          short_bio: 'Expert in React',
          long_bio: 'Long bio...',
          areas_of_expertise: ['React', 'TypeScript'],
          experience_years: 10,
          languages: ['English'],
          social_links: {},
          status: 'approved',
          created_at: '2025-01-01',
        },
      ];

      mockApiClient.get.mockResolvedValueOnce(mockMentors);

      const result = await mentorsApi.getMentors();

      expect(mockApiClient.get).toHaveBeenCalledWith('/mentors');
      expect(result).toEqual(mockMentors);
    });

    it('should get mentors with search query', async () => {
      mockApiClient.get.mockResolvedValueOnce([]);

      await mentorsApi.getMentors({ q: 'react' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/mentors?q=react');
    });

    it('should get mentors with tags', async () => {
      mockApiClient.get.mockResolvedValueOnce([]);

      await mentorsApi.getMentors({ tags: ['career', 'technology'] });

      expect(mockApiClient.get).toHaveBeenCalledWith('/mentors?tags=career&tags=technology');
    });

    it('should get mentors with combined filters', async () => {
      mockApiClient.get.mockResolvedValueOnce([]);

      await mentorsApi.getMentors({ q: 'software', tags: ['career'] });

      expect(mockApiClient.get).toHaveBeenCalledWith('/mentors?q=software&tags=career');
    });
  });

  describe('getMentor', () => {
    it('should get mentor by id', async () => {
      const mockMentor = {
        id: '1',
        user_id: 'u1',
        full_name: 'John Doe',
        headline: 'Senior Developer',
        short_bio: 'Expert in React',
        long_bio: 'Long bio...',
        areas_of_expertise: ['React', 'TypeScript'],
        experience_years: 10,
        languages: ['English'],
        social_links: {},
        status: 'approved',
        created_at: '2025-01-01',
      };

      mockApiClient.get.mockResolvedValueOnce(mockMentor);

      const result = await mentorsApi.getMentor('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/mentors/1');
      expect(result).toEqual(mockMentor);
    });
  });

  describe('applyToBecomeMentor', () => {
    it('should submit mentor application', async () => {
      const application = {
        headline: 'Senior Developer',
        short_bio: 'Expert developer',
        long_bio: 'Detailed experience...',
        areas_of_expertise: ['React', 'Node.js'],
        experience_years: 10,
        languages: ['English', 'Spanish'],
        social_links: { linkedin: 'https://linkedin.com/in/johndoe' },
      };

      const mockResponse = {
        id: '1',
        user_id: 'u1',
        full_name: 'John Doe',
        ...application,
        status: 'pending',
        created_at: '2025-01-01',
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await mentorsApi.applyToBecomeMentor(application);

      expect(mockApiClient.post).toHaveBeenCalledWith('/mentor/apply', application);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCurrentMentorProfile', () => {
    it('should get current mentor profile', async () => {
      const mockProfile = {
        id: '1',
        user_id: 'u1',
        full_name: 'John Doe',
        headline: 'Senior Developer',
        short_bio: 'Expert in React',
        long_bio: 'Long bio...',
        areas_of_expertise: ['React', 'TypeScript'],
        experience_years: 10,
        languages: ['English'],
        social_links: {},
        status: 'approved',
        created_at: '2025-01-01',
      };

      mockApiClient.get.mockResolvedValueOnce(mockProfile);

      const result = await mentorsApi.getCurrentMentorProfile();

      expect(mockApiClient.get).toHaveBeenCalledWith('/mentor/me');
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateCurrentMentorProfile', () => {
    it('should update mentor profile', async () => {
      const updates = { headline: 'Updated headline' };
      const mockResponse = {
        id: '1',
        user_id: 'u1',
        full_name: 'John Doe',
        headline: 'Updated headline',
        short_bio: 'Expert in React',
        long_bio: 'Long bio...',
        areas_of_expertise: ['React', 'TypeScript'],
        experience_years: 10,
        languages: ['English'],
        social_links: {},
        status: 'approved',
        created_at: '2025-01-01',
      };

      mockApiClient.patch.mockResolvedValueOnce(mockResponse);

      const result = await mentorsApi.updateCurrentMentorProfile(updates);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/mentor/me', updates);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMentorDashboard', () => {
    it('should get mentor dashboard', async () => {
      const mockDashboard = {
        mentor: {
          id: '1',
          user_id: 'u1',
          full_name: 'John Doe',
          headline: 'Senior Developer',
          short_bio: 'Expert in React',
          long_bio: 'Long bio...',
          areas_of_expertise: ['React'],
          experience_years: 10,
          languages: ['English'],
          social_links: {},
          status: 'approved',
          created_at: '2025-01-01',
        },
        total_sales: 5000,
        total_purchases: 10,
        top_content: [],
        recent_purchases: [],
      };

      mockApiClient.get.mockResolvedValueOnce(mockDashboard);

      const result = await mentorsApi.getMentorDashboard();

      expect(mockApiClient.get).toHaveBeenCalledWith('/mentor/dashboard');
      expect(result).toEqual(mockDashboard);
    });
  });
});
