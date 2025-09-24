/**
 * Tests for AI Recommendation Service
 * 
 * This file contains unit tests for the aiRecommendationService.js module
 * to ensure proper functionality of the OpenAI GPT-5 integration.
 */

const {
  getClubRecommendations,
  healthCheck,
  buildSessionContext,
  calculateConfidence,
  parseRecommendations,
  getRuleBasedRecommendations,
  mergeAndScoreRecommendations,
  computeOverallConfidence
} = require('../../backend/services/aiRecommendationService');

// Mock OpenAI module
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }));
});

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('AI Recommendation Service', () => {
  
  beforeEach(() => {
    // Reset environment variables
    process.env.OPENAI_API_KEY = 'test-api-key';
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe('buildSessionContext', () => {
    test('should build context string from session data', () => {
      const sessionData = {
        grade: 10,
        interests: ['technology', 'robotics'],
        experience_types: ['competitive', 'collaborative'],
        clubs_viewed: ['Computer Science Club'],
        query_history: ['What tech clubs exist?']
      };

      const context = buildSessionContext(sessionData);
      
      expect(context).toContain('User is in grade 10');
      expect(context).toContain('User interests: technology, robotics');
      expect(context).toContain('Preferred experience types: competitive, collaborative');
      expect(context).toContain('Previously viewed clubs: Computer Science Club');
      expect(context).toContain('Previous queries: What tech clubs exist?');
    });

    test('should handle empty session data', () => {
      const context = buildSessionContext({});
      expect(context).toBe('No previous session data available.');
    });

    test('should handle partial session data', () => {
      const sessionData = {
        grade: 9,
        interests: ['music']
      };

      const context = buildSessionContext(sessionData);
      expect(context).toContain('User is in grade 9');
      expect(context).toContain('User interests: music');
      expect(context).not.toContain('experience types');
    });

    test('should limit query history to last 3 items', () => {
      const sessionData = {
        query_history: ['query1', 'query2', 'query3', 'query4', 'query5']
      };

      const context = buildSessionContext(sessionData);
      expect(context).toContain('query3; query4; query5');
      expect(context).not.toContain('query1');
      expect(context).not.toContain('query2');
    });
  });

  describe('calculateConfidence', () => {
    test('should return high confidence for rich session data and good response', () => {
      const sessionData = {
        grade: 11,
        interests: ['science', 'math'],
        experience_types: ['academic'],
        query_history: ['previous query']
      };
      const aiResponse = 'I recommend the Science Club and Math Olympiad team for students interested in STEM fields.';

      const confidence = calculateConfidence(sessionData, aiResponse);
      expect(confidence).toBe('high');
    });

    test('should return medium confidence for moderate data', () => {
      const sessionData = {
        grade: 10,
        interests: ['sports']
      };
      const aiResponse = 'Try the Basketball Club!';

      const confidence = calculateConfidence(sessionData, aiResponse);
      expect(confidence).toBe('medium');
    });

    test('should return low confidence for minimal data', () => {
      const sessionData = {};
      const aiResponse = 'Hi there!';

      const confidence = calculateConfidence(sessionData, aiResponse);
      expect(confidence).toBe('low');
    });
  });

  describe('parseRecommendations', () => {
    test('should parse club names from AI response', () => {
      const aiResponse = 'I recommend the Computer Science Club and Drama Society for your interests.';
      
      const recommendations = parseRecommendations(aiResponse);
      
      expect(recommendations).toHaveLength(2);
      expect(recommendations[0].name).toBe('Computer Science Club');
      expect(recommendations[1].name).toBe('Drama Society');
      expect(recommendations[0].source).toBe('ai_parsed');
    });

    test('should handle response with no clubs mentioned', () => {
      const aiResponse = 'Tell me more about your interests so I can help better.';
      
      const recommendations = parseRecommendations(aiResponse);
      
      expect(recommendations).toHaveLength(0);
    });

    test('should avoid duplicate recommendations', () => {
      const aiResponse = 'The Science Club and Science Club are both great options.';
      
      const recommendations = parseRecommendations(aiResponse);
      
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].name).toBe('Science Club');
    });
  });

  describe('getClubRecommendations', () => {
    const mockOpenAI = require('openai');

    beforeEach(() => {
      const mockCreate = jest.fn();
      mockOpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      }));
    });

    test('should return error when userQuery is missing', async () => {
      const result = await getClubRecommendations('');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('User query is required');
    });

    test('should return error when OpenAI API key is not configured', async () => {
      delete process.env.OPENAI_API_KEY;
      
      const result = await getClubRecommendations('What clubs are available?');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('OpenAI API key not configured');
    });

    test('should successfully get structured recommendations with valid input', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'I recommend the Computer Science Club for your technology interests!'
          }
        }],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150
        }
      };

      const mockOpenAIInstance = new mockOpenAI();
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockResponse);

      // Mock the module to return our mocked instance
      jest.doMock('openai', () => {
        return jest.fn(() => mockOpenAIInstance);
      });

      const sessionData = {
        grade: 10,
        interests: ['technology']
      };

      const result = await getClubRecommendations('What tech clubs exist?', sessionData);
      
      expect(result.success).toBe(true);
      expect(result.aiResponse).toContain('Computer Science Club');
      expect(typeof result.confidence).toBe('number');
      expect(Array.isArray(result.recommendations)).toBe(true);
      if (result.recommendations.length > 0) {
        const r = result.recommendations[0];
        expect(r).toHaveProperty('name');
        expect(r).toHaveProperty('category');
        expect(r).toHaveProperty('confidence');
        expect(r).toHaveProperty('reasoning');
        expect(r).toHaveProperty('source');
      }
      expect(result.usage.total_tokens).toBe(150);
    });

    test('should handle OpenAI API errors gracefully', async () => {
      const mockOpenAIInstance = new mockOpenAI();
      const apiError = new Error('API Error');
      apiError.code = 'rate_limit_exceeded';
      
      mockOpenAIInstance.chat.completions.create.mockRejectedValue(apiError);

      jest.doMock('openai', () => {
        return jest.fn(() => mockOpenAIInstance);
      });

      const result = await getClubRecommendations('What clubs exist?');
      
      // Degraded fallback mode should still return success with recommendations
      expect(result.success).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.source).toBe('rule-based');
    });

    test('should handle quota exceeded errors', async () => {
      const mockOpenAIInstance = new mockOpenAI();
      const quotaError = new Error('Quota exceeded');
      quotaError.code = 'insufficient_quota';
      
      mockOpenAIInstance.chat.completions.create.mockRejectedValue(quotaError);

      jest.doMock('openai', () => {
        return jest.fn(() => mockOpenAIInstance);
      });

      const result = await getClubRecommendations('What clubs exist?');
      
      // Degraded fallback mode should still return structured recommendations
      expect(result.success).toBe(true);
      expect(result.source).toBe('rule-based');
    });
  });

  describe('healthCheck', () => {
    test('should return unhealthy when API key is missing', async () => {
      delete process.env.OPENAI_API_KEY;
      
      const result = await healthCheck();
      
      expect(result.status).toBe('unhealthy');
      expect(result.message).toContain('OpenAI API key not configured');
    });

    test('should return healthy when API is accessible', async () => {
      const mockResponse = {
        choices: [{
          message: { content: 'Hello' }
        }]
      };

      const mockOpenAIInstance = new mockOpenAI();
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockResponse);

      jest.doMock('openai', () => {
        return jest.fn(() => mockOpenAIInstance);
      });

      const result = await healthCheck();
      
      expect(result.status).toBe('healthy');
      expect(result.message).toContain('OpenAI API connection successful');
    });

    test('should return unhealthy when API call fails', async () => {
      const mockOpenAIInstance = new mockOpenAI();
      mockOpenAIInstance.chat.completions.create.mockRejectedValue(new Error('Network error'));

      jest.doMock('openai', () => {
        return jest.fn(() => mockOpenAIInstance);
      });

      const result = await healthCheck();
      
      expect(result.status).toBe('unhealthy');
      expect(result.message).toContain('OpenAI API error');
    });
  });

  describe('Input Validation', () => {
    test('should handle non-string userQuery', async () => {
      const result = await getClubRecommendations(123);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('must be a string');
    });

    test('should handle null sessionData', async () => {
      const mockResponse = {
        choices: [{
          message: { content: 'Here are some clubs for you!' }
        }],
        usage: { total_tokens: 100 }
      };

      const mockOpenAIInstance = new mockOpenAI();
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockResponse);

      jest.doMock('openai', () => {
        return jest.fn(() => mockOpenAIInstance);
      });

      const result = await getClubRecommendations('What clubs exist?', null);
      
      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty OpenAI response', async () => {
      const mockResponse = {
        choices: [],
        usage: { total_tokens: 0 }
      };

      const mockOpenAIInstance = new mockOpenAI();
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockResponse);

      jest.doMock('openai', () => {
        return jest.fn(() => mockOpenAIInstance);
      });

      const result = await getClubRecommendations('What clubs exist?');
      
      // Should return rule-based fallback recommendations
      expect(result.success).toBe(true);
      expect(result.source).toBe('rule-based');
    });

    test('should handle very long user queries', async () => {
      const longQuery = 'A'.repeat(10000);
      
      const result = await getClubRecommendations(longQuery);
      
      // Should still process the query (truncation handled by OpenAI)
      expect(typeof result).toBe('object');
    });
  });
});
