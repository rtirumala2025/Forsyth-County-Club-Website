import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIClubChatbot from './AIClubChatbot';

// Mock fetch globally
global.fetch = jest.fn();

// Fake club data as specified
const fakeClubData = [
  {
    school: "Lambert High School",
    clubs: [
      { name: "Robotics Club", category: "STEM", commitment: "High", sponsor: "Mr. Smith", description: "Build and compete with robots." },
      { name: "Art Club", category: "Arts", commitment: "Low", sponsor: "Ms. Lee", description: "Draw, paint, and showcase art." },
      { name: "Key Club", category: "Community Service", commitment: "Medium", sponsor: "Mrs. Johnson", description: "Volunteer and help the community." },
      { name: "DECA", category: "Business", commitment: "Medium", sponsor: "Mr. Brown", description: "Business competitions and leadership." }
    ]
  }
];

// Mock response for recommendations API
const mockRecommendationsResponse = {
  "recommendations": [
    { "name": "Robotics Club", "category": "STEM", "reason": "Matches STEM + competitive interest", "matchScore": "High" }
  ],
  "source": "ai"
};

describe('AIClubChatbot', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset fetch mock
    fetch.mockClear();
  });

  afterEach(() => {
    // Clean up after each test
    jest.restoreAllMocks();
  });

  describe('Test 1: Renders welcome message and school selection buttons', () => {
    test('should render welcome message and school selection buttons when chat opens', () => {
      render(<AIClubChatbot allClubData={fakeClubData} />);
      
      // Click the chat button to open the chat
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      fireEvent.click(chatButton);
      
      // Check for welcome message
      expect(screen.getByText(/Hi there! 👋 I'm your personal AI club advisor/)).toBeInTheDocument();
      expect(screen.getByText(/First, let's find your school so I can show you the clubs available there/)).toBeInTheDocument();
      
      // Check for school selection prompt
      expect(screen.getByText('Select your school:')).toBeInTheDocument();
      
      // Check for Lambert High School button
      expect(screen.getByText('Lambert High School')).toBeInTheDocument();
      
      // Check for input placeholder
      expect(screen.getByPlaceholderText(/Type your school name or select from the list above/)).toBeInTheDocument();
    });
  });

  describe('Test 2: User selects "Lambert High School" and bot asks the first question', () => {
    test('should handle school selection and ask first question', async () => {
      render(<AIClubChatbot allClubData={fakeClubData} />);
      
      // Open chat
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      fireEvent.click(chatButton);
      
      // Click on Lambert High School
      const schoolButton = screen.getByText('Lambert High School');
      fireEvent.click(schoolButton);
      
      // Wait for the bot to respond with confirmation and first question
      await waitFor(() => {
        expect(screen.getByText(/Perfect! I found Lambert High School/)).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByText(/What are your main interests?/)).toBeInTheDocument();
      });
      
      // Check that the input placeholder has changed to the first question
      expect(screen.getByPlaceholderText(/Tell me about your interests/)).toBeInTheDocument();
    });
  });

  describe('Test 3: User completes all 6 questions, mocked fetch returns recommendations, and bot displays "Robotics Club" with High Match', () => {
    test('should complete full conversation flow and display recommendations', async () => {
      // Mock fetch to return recommendations
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendationsResponse
      });

      render(<AIClubChatbot allClubData={fakeClubData} />);
      
      // Open chat
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      fireEvent.click(chatButton);
      
      // Select school
      const schoolButton = screen.getByText('Lambert High School');
      fireEvent.click(schoolButton);
      
      // Wait for first question
      await waitFor(() => {
        expect(screen.getByText(/What are your main interests?/)).toBeInTheDocument();
      });
      
      // Answer all 6 questions
      const questions = [
        "STEM and robotics",
        "3-5 hours per week", 
        "Competitive",
        "Leadership and technical skills",
        "11th grade",
        "Yes, I was in a coding club last year"
      ];
      
      const input = screen.getByPlaceholderText(/Tell me about your interests/);
      const submitButton = screen.getByRole('button', { name: /send/i });
      
      for (let i = 0; i < questions.length; i++) {
        // Clear input and type answer
        fireEvent.change(input, { target: { value: questions[i] } });
        
        // Submit answer
        fireEvent.submit(screen.getByRole('form'));
        
        // Wait for next question or recommendations
        if (i < questions.length - 1) {
          await waitFor(() => {
            // Check for conversational response
            expect(screen.getByText(/That sounds fascinating!/)).toBeInTheDocument();
          });
        }
      }
      
      // Wait for AI recommendations to be fetched and displayed
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('http://localhost:5001/api/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"school":"Lambert High School"')
        });
      });
      
      // Check for recommendations message
      await waitFor(() => {
        expect(screen.getByText(/🎉 Perfect! Based on your answers, here are my top recommendations/)).toBeInTheDocument();
      });
      
      // Check for Robotics Club recommendation
      await waitFor(() => {
        expect(screen.getByText('Robotics Club')).toBeInTheDocument();
        expect(screen.getByText('STEM')).toBeInTheDocument();
        expect(screen.getByText('Matches STEM + competitive interest')).toBeInTheDocument();
        expect(screen.getByText('High Match')).toBeInTheDocument();
      });
      
      // Check for follow-up suggestions
      await waitFor(() => {
        expect(screen.getByText(/You can ask me to adjust these recommendations!/)).toBeInTheDocument();
      });
    });
  });

  describe('Additional Tests: Error handling and edge cases', () => {
    test('should handle API errors gracefully', async () => {
      // Mock fetch to return an error
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'API temporarily unavailable' })
      });

      render(<AIClubChatbot allClubData={fakeClubData} />);
      
      // Open chat and complete flow
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      fireEvent.click(chatButton);
      
      const schoolButton = screen.getByText('Lambert High School');
      fireEvent.click(schoolButton);
      
      // Answer first question
      await waitFor(() => {
        expect(screen.getByText(/What are your main interests?/)).toBeInTheDocument();
      });
      
      const input = screen.getByPlaceholderText(/Tell me about your interests/);
      fireEvent.change(input, { target: { value: 'STEM' } });
      fireEvent.submit(screen.getByRole('form'));
      
      // Answer remaining questions quickly
      const questions = ["3-5 hours", "Competitive", "Leadership", "11th grade", "Yes"];
      for (let i = 0; i < questions.length; i++) {
        await waitFor(() => {
          const currentInput = screen.getByPlaceholderText(/e\.g\.|What type|What skills|What grade|Tell me about/);
          fireEvent.change(currentInput, { target: { value: questions[i] } });
          fireEvent.submit(screen.getByRole('form'));
        });
      }
      
      // Check for error message
      await waitFor(() => {
        expect(screen.getByText(/Sorry, I encountered an error while analyzing your preferences/)).toBeInTheDocument();
      });
    });

    test('should handle empty club data', () => {
      render(<AIClubChatbot allClubData={[]} />);
      
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      fireEvent.click(chatButton);
      
      // Should still show welcome message but no school buttons
      expect(screen.getByText(/Hi there! 👋 I'm your personal AI club advisor/)).toBeInTheDocument();
      expect(screen.queryByText('Select your school:')).not.toBeInTheDocument();
    });

    test('should close chat when X button is clicked', () => {
      render(<AIClubChatbot allClubData={fakeClubData} />);
      
      // Open chat
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      fireEvent.click(chatButton);
      
      // Verify chat is open
      expect(screen.getByText(/Hi there! 👋 I'm your personal AI club advisor/)).toBeInTheDocument();
      
      // Click close button
      const closeButton = screen.getByLabelText('Close chat');
      fireEvent.click(closeButton);
      
      // Verify chat is closed
      expect(screen.queryByText(/Hi there! 👋 I'm your personal AI club advisor/)).not.toBeInTheDocument();
      expect(screen.getByLabelText('Open AI Club Chatbot')).toBeInTheDocument();
    });

    test('should reset chat when "Start New Conversation" is clicked', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendationsResponse
      });

      render(<AIClubChatbot allClubData={fakeClubData} />);
      
      // Complete full conversation to get recommendations
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      fireEvent.click(chatButton);
      
      const schoolButton = screen.getByText('Lambert High School');
      fireEvent.click(schoolButton);
      
      // Answer all questions quickly
      await waitFor(() => {
        expect(screen.getByText(/What are your main interests?/)).toBeInTheDocument();
      });
      
      const questions = ["STEM", "3-5 hours", "Competitive", "Leadership", "11th grade", "Yes"];
      for (let i = 0; i < questions.length; i++) {
        const input = screen.getByPlaceholderText(/Tell me about|e\.g\.|What type|What skills|What grade/);
        fireEvent.change(input, { target: { value: questions[i] } });
        fireEvent.submit(screen.getByRole('form'));
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      }
      
      // Wait for recommendations
      await waitFor(() => {
        expect(screen.getByText('Robotics Club')).toBeInTheDocument();
      });
      
      // Click reset button
      const resetButton = screen.getByText('Start New Conversation');
      fireEvent.click(resetButton);
      
      // Verify chat is reset to welcome message
      await waitFor(() => {
        expect(screen.getByText(/Hi there! 👋 I'm your personal AI club advisor/)).toBeInTheDocument();
        expect(screen.queryByText('Robotics Club')).not.toBeInTheDocument();
      });
    });
  });
});
