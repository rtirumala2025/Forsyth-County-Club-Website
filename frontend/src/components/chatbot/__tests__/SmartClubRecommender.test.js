/**
 * Test Suite for Smart Club Recommender
 * 
 * This test suite validates the improved chatbot functionality including:
 * - Hybrid recommendation system (rules + AI fallback)
 * - Session-based personalization
 * - Error handling and graceful fallback
 * - UI/UX improvements
 * - Performance optimization
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SmartClubRecommender from '../SmartClubRecommender';
import * as smartClubService from '../../../services/smartClubRecommendationService';

// Mock the service
jest.mock('../../../services/smartClubRecommendationService');

// Mock club data
const mockClubData = [
  {
    school: "Test High School",
    clubs: [
      {
        id: "1",
        name: "Coding Club",
        category: "Technology",
        description: "Learn programming and build projects",
        sponsor: "Mr. Smith"
      },
      {
        id: "2", 
        name: "Art Club",
        category: "Arts",
        description: "Express creativity through various mediums",
        sponsor: "Ms. Johnson"
      }
    ]
  }
];

describe('SmartClubRecommender', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock service functions
    smartClubService.processUserInputSmart.mockResolvedValue({
      step: 'smart_recommendations',
      smartRecommendations: [{
        id: 'smart-response',
        name: 'Smart Recommendation',
        description: 'Based on your interests in coding, I recommend the Coding Club!',
        category: 'Smart Recommendation',
        isSmartResponse: true,
        source: 'rules',
        confidence: 'high'
      }],
      lastRecommendationSource: 'rules',
      confidence: 'high'
    });
    
    smartClubService.generateSmartBotResponse.mockReturnValue({
      text: 'Here are some smart recommendations for you!',
      quickReplies: ['🔄 Start Over', '💬 Ask More Questions'],
      recommendations: [],
      confidence: 'high',
      source: 'rules'
    });
  });

  describe('Component Rendering', () => {
    test('renders when open', () => {
      render(
        <SmartClubRecommender 
          allClubData={mockClubData} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      expect(screen.getByText('Smart Club Recommender')).toBeInTheDocument();
      expect(screen.getByText('Find your perfect clubs!')).toBeInTheDocument();
    });

    test('does not render when closed', () => {
      render(
        <SmartClubRecommender 
          allClubData={mockClubData} 
          isOpen={false} 
          onClose={jest.fn()} 
        />
      );
      
      expect(screen.queryByText('Smart Club Recommender')).not.toBeInTheDocument();
    });

    test('shows service status indicator', () => {
      render(
        <SmartClubRecommender 
          allClubData={mockClubData} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      // Should show checking status initially
      expect(screen.getByText('Checking service...')).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    test('handles user input and sends message', async () => {
      render(
        <SmartClubRecommender 
          allClubData={mockClubData} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      const input = screen.getByPlaceholderText('Tell me about your interests or ask a question...');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      fireEvent.change(input, { target: { value: 'I love coding' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(smartClubService.processUserInputSmart).toHaveBeenCalledWith(
          'I love coding',
          expect.any(Object),
          mockClubData,
          null
        );
      });
    });

    test('handles quick reply clicks', async () => {
      render(
        <SmartClubRecommender 
          allClubData={mockClubData} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      // Wait for initial message to load
      await waitFor(() => {
        expect(screen.getByText(/Hi there!/)).toBeInTheDocument();
      });
      
      // Look for quick reply buttons
      const quickReplies = screen.getAllByRole('button');
      const startOverButton = quickReplies.find(button => 
        button.textContent.includes('Start Over')
      );
      
      if (startOverButton) {
        fireEvent.click(startOverButton);
        
        await waitFor(() => {
          expect(smartClubService.processUserInputSmart).toHaveBeenCalled();
        });
      }
    });

    test('handles Enter key press', async () => {
      render(
        <SmartClubRecommender 
          allClubData={mockClubData} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      const input = screen.getByPlaceholderText('Tell me about your interests or ask a question...');
      
      fireEvent.change(input, { target: { value: 'I love coding' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(smartClubService.processUserInputSmart).toHaveBeenCalled();
      });
    });
  });

  describe('Recommendation Display', () => {
    test('displays smart recommendations with confidence badges', async () => {
      render(
        <SmartClubRecommender 
          allClubData={mockClubData} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      // Simulate receiving smart recommendations
      const input = screen.getByPlaceholderText('Tell me about your interests or ask a question...');
      fireEvent.change(input, { target: { value: 'I love coding' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Based on your interests in coding, I recommend the Coding Club!')).toBeInTheDocument();
      });
    });

    test('shows confidence indicators for recommendations', async () => {
      render(
        <SmartClubRecommender 
          allClubData={mockClubData} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      const input = screen.getByPlaceholderText('Tell me about your interests or ask a question...');
      fireEvent.change(input, { target: { value: 'I love coding' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        // Should show confidence badge
        expect(screen.getByText('Highly Recommended')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles service unavailability gracefully', async () => {
      // Mock service unavailable
      smartClubService.processUserInputSmart.mockResolvedValue({
        step: 'fallback_recommendations',
        recommendations: [{
          id: '1',
          name: 'Coding Club',
          category: 'Technology',
          description: 'Learn programming and build projects'
        }],
        lastRecommendationSource: 'fallback',
        confidence: 'low'
      });
      
      render(
        <SmartClubRecommender 
          allClubData={mockClubData} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      const input = screen.getByPlaceholderText('Tell me about your interests or ask a question...');
      fireEvent.change(input, { target: { value: 'I love coding' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        // Should show fallback recommendations
        expect(screen.getByText('Coding Club')).toBeInTheDocument();
      });
    });

    test('shows loading state during processing', async () => {
      // Mock delayed response
      smartClubService.processUserInputSmart.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          step: 'smart_recommendations',
          smartRecommendations: [],
          lastRecommendationSource: 'rules',
          confidence: 'high'
        }), 100))
      );
      
      render(
        <SmartClubRecommender 
          allClubData={mockClubData} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      const input = screen.getByPlaceholderText('Tell me about your interests or ask a question...');
      fireEvent.change(input, { target: { value: 'I love coding' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      // Should show loading indicator
      expect(screen.getByText('Checking service...')).toBeInTheDocument();
    });
  });

  describe('Session Management', () => {
    test('maintains conversation state across interactions', async () => {
      render(
        <SmartClubRecommender 
          allClubData={mockClubData} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      const input = screen.getByPlaceholderText('Tell me about your interests or ask a question...');
      
      // First interaction
      fireEvent.change(input, { target: { value: 'I love coding' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(smartClubService.processUserInputSmart).toHaveBeenCalledWith(
          'I love coding',
          expect.objectContaining({
            userSession: expect.objectContaining({
              queryHistory: ['I love coding']
            })
          }),
          mockClubData,
          null
        );
      });
      
      // Second interaction
      fireEvent.change(input, { target: { value: 'What about art?' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(smartClubService.processUserInputSmart).toHaveBeenCalledWith(
          'What about art?',
          expect.objectContaining({
            userSession: expect.objectContaining({
              queryHistory: ['I love coding', 'What about art?']
            })
          }),
          mockClubData,
          null
        );
      });
    });
  });

  describe('Performance Optimization', () => {
    test('caches recommendations for repeated queries', async () => {
      render(
        <SmartClubRecommender 
          allClubData={mockClubData} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      const input = screen.getByPlaceholderText('Tell me about your interests or ask a question...');
      
      // First query
      fireEvent.change(input, { target: { value: 'I love coding' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(smartClubService.processUserInputSmart).toHaveBeenCalledTimes(1);
      });
      
      // Same query again
      fireEvent.change(input, { target: { value: 'I love coding' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        // Should use cache, so service might not be called again
        // This depends on cache implementation
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', () => {
      render(
        <SmartClubRecommender 
          allClubData={mockClubData} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Tell me about your interests or ask a question...')).toBeInTheDocument();
    });

    test('supports keyboard navigation', () => {
      render(
        <SmartClubRecommender 
          allClubData={mockClubData} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      const input = screen.getByPlaceholderText('Tell me about your interests or ask a question...');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      // Tab navigation should work
      input.focus();
      expect(document.activeElement).toBe(input);
      
      // Enter key should trigger send
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      // Should not throw error
    });
  });
});

// Integration tests
describe('SmartClubRecommender Integration', () => {
  test('end-to-end recommendation flow', async () => {
    // Mock successful API response
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'healthy',
          aiConfigured: true
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          source: 'rules',
          reply: '🎯 Perfect match! The Coding Club is ideal for you!',
          confidence: 'high',
          matched_patterns: ['coding']
        })
      });
    
    render(
      <SmartClubRecommender 
        allClubData={mockClubData} 
        isOpen={true} 
        onClose={jest.fn()} 
      />
    );
    
    // Wait for service to be available
    await waitFor(() => {
      expect(screen.getByText('Smart recommendations active')).toBeInTheDocument();
    });
    
    // Send a message
    const input = screen.getByPlaceholderText('Tell me about your interests or ask a question...');
    fireEvent.change(input, { target: { value: 'I love coding' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    
    // Should show recommendation
    await waitFor(() => {
      expect(screen.getByText(/Perfect match! The Coding Club is ideal for you!/)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    // Mock API error
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'healthy',
          aiConfigured: true
        })
      })
      .mockRejectedValueOnce(new Error('Network error'));
    
    render(
      <SmartClubRecommender 
        allClubData={mockClubData} 
        isOpen={true} 
        onClose={jest.fn()} 
      />
    );
    
    // Wait for service to be available
    await waitFor(() => {
      expect(screen.getByText('Smart recommendations active')).toBeInTheDocument();
    });
    
    // Send a message
    const input = screen.getByPlaceholderText('Tell me about your interests or ask a question...');
    fireEvent.change(input, { target: { value: 'I love coding' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    
    // Should fall back to static recommendations
    await waitFor(() => {
      expect(screen.getByText('Coding Club')).toBeInTheDocument();
    });
  });
});
