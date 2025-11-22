import { contentApi } from '@/lib/api/content';
import { apiClient } from '@/lib/api/client';

jest.mock('@/lib/api/client');

describe('Content API', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getContent', () => {
    it('should get all content without filters', async () => {
      const mockContent = [
        {
          id: '1',
          mentor_id: 'm1',
          mentor_name: 'John Doe',
          title: 'React Masterclass',
          description: 'Learn React',
          content_type: 'course',
          format: 'video',
          target_audience: 'Developers',
          problem_it_solves: 'Learning React',
          learning_outcomes: ['Master React'],
          delivery_modes: ['online'],
          estimated_duration: '10 hours',
          tools: ['VS Code'],
          prerequisites: 'JavaScript',
          required_time_per_week: '5 hours',
          support_model: 'Q&A',
          price: 99,
          currency: 'USD',
          tags: ['react', 'frontend'],
          status: 'published',
          ai_context: 'React course',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      mockApiClient.get.mockResolvedValueOnce(mockContent);

      const result = await contentApi.getContent();

      expect(mockApiClient.get).toHaveBeenCalledWith('/content');
      expect(result).toEqual(mockContent);
    });

    it('should get content with search query', async () => {
      mockApiClient.get.mockResolvedValueOnce([]);

      await contentApi.getContent({ q: 'react' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/content?q=react');
    });

    it('should get content with filters', async () => {
      mockApiClient.get.mockResolvedValueOnce([]);

      await contentApi.getContent({
        content_type: 'course',
        min_price: 50,
        max_price: 200,
        mentor_id: 'm1',
        tags: ['react', 'frontend'],
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/content?tags=react&tags=frontend&content_type=course&min_price=50&max_price=200&mentor_id=m1'
      );
    });
  });

  describe('getContentById', () => {
    it('should get content by id', async () => {
      const mockContent = {
        id: '1',
        mentor_id: 'm1',
        mentor_name: 'John Doe',
        title: 'React Masterclass',
        description: 'Learn React',
        content_type: 'course',
        format: 'video',
        target_audience: 'Developers',
        problem_it_solves: 'Learning React',
        learning_outcomes: ['Master React'],
        delivery_modes: ['online'],
        estimated_duration: '10 hours',
        tools: ['VS Code'],
        prerequisites: 'JavaScript',
        required_time_per_week: '5 hours',
        support_model: 'Q&A',
        price: 99,
        currency: 'USD',
        tags: ['react', 'frontend'],
        status: 'published',
        ai_context: 'React course',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      };

      mockApiClient.get.mockResolvedValueOnce(mockContent);

      const result = await contentApi.getContentById('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/content/1');
      expect(result).toEqual(mockContent);
    });
  });

  describe('getContentFull', () => {
    it('should get full content with outline', async () => {
      const mockFullContent = {
        id: '1',
        mentor_id: 'm1',
        mentor_name: 'John Doe',
        title: 'React Masterclass',
        description: 'Learn React',
        content_type: 'course',
        format: 'video',
        target_audience: 'Developers',
        problem_it_solves: 'Learning React',
        learning_outcomes: ['Master React'],
        delivery_modes: ['online'],
        estimated_duration: '10 hours',
        tools: ['VS Code'],
        prerequisites: 'JavaScript',
        required_time_per_week: '5 hours',
        support_model: 'Q&A',
        price: 99,
        currency: 'USD',
        tags: ['react', 'frontend'],
        status: 'published',
        ai_context: 'React course',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
        outline: [
          {
            title: 'Module 1',
            description: 'Introduction',
            activities: [],
            resources: [],
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce(mockFullContent);

      const result = await contentApi.getContentFull('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/content/1/full');
      expect(result).toEqual(mockFullContent);
    });
  });

  describe('createContent', () => {
    it('should create new content', async () => {
      const newContent = {
        title: 'New Course',
        description: 'Course description',
        content_type: 'course',
        price: 99,
      };

      const mockResponse = {
        id: '1',
        mentor_id: 'm1',
        mentor_name: 'John Doe',
        ...newContent,
        format: 'video',
        target_audience: '',
        problem_it_solves: '',
        learning_outcomes: [],
        delivery_modes: [],
        estimated_duration: '',
        tools: [],
        prerequisites: '',
        required_time_per_week: '',
        support_model: '',
        currency: 'USD',
        tags: [],
        status: 'draft',
        ai_context: '',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await contentApi.createContent(newContent);

      expect(mockApiClient.post).toHaveBeenCalledWith('/content', newContent);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateContent', () => {
    it('should update content', async () => {
      const updates = { title: 'Updated Title' };
      const mockResponse = {
        id: '1',
        title: 'Updated Title',
      };

      mockApiClient.patch.mockResolvedValueOnce(mockResponse);

      const result = await contentApi.updateContent('1', updates);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/content/1', updates);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('publishContent', () => {
    it('should publish content', async () => {
      mockApiClient.post.mockResolvedValueOnce(undefined);

      await contentApi.publishContent('1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/content/1/publish');
    });
  });

  describe('checkout', () => {
    it('should create checkout session', async () => {
      const mockResponse = {
        checkout_url: 'https://checkout.stripe.com/session',
        session_id: 'sess_123',
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await contentApi.checkout({ content_id: 'c1' });

      expect(mockApiClient.post).toHaveBeenCalledWith('/payments/checkout', {
        content_id: 'c1',
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
