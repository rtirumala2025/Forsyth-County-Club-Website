import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIClubChatbotFixed from '../chatbot/AIClubChatbotFixed';

// Mock fetch for API calls
global.fetch = jest.fn();

// Sample club data for testing
const sampleClubData = [
  {
    school: "Lambert High School",
    clubs: [
      {
        name: "Robotics Club",
        category: "STEM",
        description: "Build and program robots for competitions",
        activities: ["Robot Building", "Programming", "Competitions"],
        benefits: ["Technical Skills", "Problem Solving", "Teamwork"],
        commitment: "High",
        sponsor: "Mr. Johnson"
      },
      {
        name: "Math Team",
        category: "STEM",
        description: "Compete in mathematics competitions",
        activities: ["Math Competitions", "Problem Solving"],
        benefits: ["Mathematical Skills", "Critical Thinking"],
        commitment: "High",
        sponsor: "Ms. Smith"
      },
      {
        name: "Art Club",
        category: "Arts",
        description: "Express creativity through various art forms",
        activities: ["Painting", "Drawing", "Sculpture"],
        benefits: ["Creativity", "Artistic Skills"],
        commitment: "Low",
        sponsor: "Mrs. Davis"
      },
      {
        name: "Theater Club",
        category: "Arts",
        description: "Perform plays and develop acting skills",
        activities: ["Acting", "Set Design", "Performances"],
        benefits: ["Public Speaking", "Creativity"],
        commitment: "Medium",
        sponsor: "Mr. Wilson"
      },
      {
        name: "FBLA",
        category: "Business",
        description: "Future Business Leaders of America",
        activities: ["Business Competitions", "Leadership Development"],
        benefits: ["Business Skills", "Leadership"],
        commitment: "Medium",
        sponsor: "Ms. Brown"
      },
      {
        name: "DECA",
        category: "Business",
        description: "Marketing and entrepreneurship competitions",
        activities: ["Marketing Competitions", "Business Plans"],
        benefits: ["Marketing Skills", "Entrepreneurship"],
        commitment: "High",
        sponsor: "Mr. Garcia"
      },
      {
        name: "Key Club",
        category: "Community Service",
        description: "Volunteer service and community involvement",
        activities: ["Volunteering", "Fundraising"],
        benefits: ["Leadership", "Community Service"],
        commitment: "Medium",
        sponsor: "Mrs. Martinez"
      },
      {
        name: "Interact Club",
        category: "Community Service",
        description: "International service organization for youth",
        activities: ["International Service", "Leadership Projects"],
        benefits: ["Global Perspective", "Leadership"],
        commitment: "Low",
        sponsor: "Mr. Lee"
      }
    ]
  }
];

// Helper functions
const mockApiResponse = (recommendations) => ({
  success: true,
  source: 'fallback',
  recommendations,
  school: 'Lambert High School',
  conversationId: 'test-conversation-id'
});

const waitForElement = async (text) => {
  return waitFor(() => {
    expect(screen.getByText(text)).toBeInTheDocument();
  });
};

const sendMessage = async (user, message) => {
  const input = screen.getByPlaceholderText(/tell me about your interests|type your school name|ask me to adjust/i);
  await user.type(input, message);
  fireEvent.submit(input.closest('form'));
};

describe('AIClubChatbotFixed', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    fetch.mockClear();
  });

  describe('Initial Rendering', () => {
    test('renders floating chat button when closed', () => {
      render(<AIClubChatbotFixed allClubData={sampleClubData} />);
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      expect(chatButton).toBeInTheDocument();
    });

    test('opens chat window and shows greeting', async () => {
      render(<AIClubChatbotFixed allClubData={sampleClubData} />);
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      await user.click(chatButton);
      
      await waitForElement("Hi there! 👋 I'm your personal AI club advisor");
      expect(screen.getByText('Select Your School')).toBeInTheDocument();
    });
  });

  describe('School Selection', () => {
    test('displays school selection buttons', async () => {
      render(<AIClubChatbotFixed allClubData={sampleClubData} />);
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      await user.click(chatButton);
      
      await waitForElement('Select your school:');
      expect(screen.getByText('Lambert High School')).toBeInTheDocument();
    });

    test('allows school selection via button', async () => {
      render(<AIClubChatbotFixed allClubData={sampleClubData} />);
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      await user.click(chatButton);
      
      await waitForElement('Select your school:');
      const lambertButton = screen.getByText('Lambert High School');
      await user.click(lambertButton);
      
      await waitForElement('Perfect! I found Lambert High School');
    });
  });

  describe('Question Flow', () => {
    beforeEach(async () => {
      render(<AIClubChatbotFixed allClubData={sampleClubData} />);
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      await user.click(chatButton);
      
      await waitForElement('Select your school:');
      const lambertButton = screen.getByText('Lambert High School');
      await user.click(lambertButton);
    });

    test('asks questions in correct order', async () => {
      await waitForElement('What are your main interests?');
      await sendMessage(user, 'STEM');
      
      await waitForElement('How much time can you commit each week?');
      await sendMessage(user, 'High');
      
      await waitForElement('What type of club experience are you looking for?');
      await sendMessage(user, 'Competitive');
      
      await waitForElement('What skills or goals would you like to develop?');
      await sendMessage(user, 'Leadership');
      
      await waitForElement('What grade are you in?');
      await sendMessage(user, '10th');
      
      await waitForElement('Have you been involved in clubs or activities before?');
      await sendMessage(user, 'Some sports clubs');
    });
  });

  describe('Case A: STEM Student', () => {
    beforeEach(async () => {
      render(<AIClubChatbotFixed allClubData={sampleClubData} />);
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      await user.click(chatButton);
      
      await waitForElement('Select your school:');
      const lambertButton = screen.getByText('Lambert High School');
      await user.click(lambertButton);
    });

    test('gets STEM recommendations with High Match', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse([
          {
            name: "Robotics Club",
            category: "STEM",
            school: "Lambert High School",
            reason: "Perfect match for your STEM interests and competitive nature",
            matchScore: "High"
          },
          {
            name: "Math Team",
            category: "STEM",
            school: "Lambert High School",
            reason: "Excellent for developing mathematical and competitive skills",
            matchScore: "High"
          }
        ])
      });

      // Complete conversation
      await waitForElement('What are your main interests?');
      await sendMessage(user, 'STEM');
      
      await waitForElement('How much time can you commit each week?');
      await sendMessage(user, 'High');
      
      await waitForElement('What type of club experience are you looking for?');
      await sendMessage(user, 'Competitive');
      
      await waitForElement('What skills or goals would you like to develop?');
      await sendMessage(user, 'Leadership');
      
      await waitForElement('What grade are you in?');
      await sendMessage(user, '10th');
      
      await waitForElement('Have you been involved in clubs or activities before?');
      await sendMessage(user, 'Some sports clubs');

      await waitForElement('🎉 Perfect! Based on your answers, here are my top recommendations');
      
      expect(screen.getByText('Robotics Club')).toBeInTheDocument();
      expect(screen.getByText('Math Team')).toBeInTheDocument();
      expect(screen.getByText('STEM')).toBeInTheDocument();
      expect(screen.getByText('High Match')).toBeInTheDocument();
    });
  });

  describe('Case B: Arts Student', () => {
    beforeEach(async () => {
      render(<AIClubChatbotFixed allClubData={sampleClubData} />);
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      await user.click(chatButton);
      
      await waitForElement('Select your school:');
      const lambertButton = screen.getByText('Lambert High School');
      await user.click(lambertButton);
    });

    test('gets Arts recommendations with Medium/High Match', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse([
          {
            name: "Art Club",
            category: "Arts",
            school: "Lambert High School",
            reason: "Perfect for developing creativity and artistic skills",
            matchScore: "High"
          },
          {
            name: "Theater Club",
            category: "Arts",
            school: "Lambert High School",
            reason: "Great for creative expression and confidence building",
            matchScore: "Medium"
          }
        ])
      });

      // Complete conversation
      await waitForElement('What are your main interests?');
      await sendMessage(user, 'Arts');
      
      await waitForElement('How much time can you commit each week?');
      await sendMessage(user, 'Low');
      
      await waitForElement('What type of club experience are you looking for?');
      await sendMessage(user, 'Creative');
      
      await waitForElement('What skills or goals would you like to develop?');
      await sendMessage(user, 'Creativity');
      
      await waitForElement('What grade are you in?');
      await sendMessage(user, '11th');
      
      await waitForElement('Have you been involved in clubs or activities before?');
      await sendMessage(user, 'None');

      await waitForElement('🎉 Perfect! Based on your answers, here are my top recommendations');
      
      expect(screen.getByText('Art Club')).toBeInTheDocument();
      expect(screen.getByText('Theater Club')).toBeInTheDocument();
      expect(screen.getByText('Arts')).toBeInTheDocument();
      expect(screen.getByText('High Match')).toBeInTheDocument();
      expect(screen.getByText('Medium Match')).toBeInTheDocument();
    });
  });

  describe('Case C: Community Service Student', () => {
    beforeEach(async () => {
      render(<AIClubChatbotFixed allClubData={sampleClubData} />);
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      await user.click(chatButton);
      
      await waitForElement('Select your school:');
      const lambertButton = screen.getByText('Lambert High School');
      await user.click(lambertButton);
    });

    test('gets Community Service recommendations', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse([
          {
            name: "Key Club",
            category: "Community Service",
            school: "Lambert High School",
            reason: "Perfect for community service and leadership development",
            matchScore: "High"
          },
          {
            name: "Interact Club",
            category: "Community Service",
            school: "Lambert High School",
            reason: "Great for international service and cultural awareness",
            matchScore: "Medium"
          }
        ])
      });

      // Complete conversation
      await waitForElement('What are your main interests?');
      await sendMessage(user, 'Community Service');
      
      await waitForElement('How much time can you commit each week?');
      await sendMessage(user, '3-5 hours');
      
      await waitForElement('What type of club experience are you looking for?');
      await sendMessage(user, 'Social');
      
      await waitForElement('What skills or goals would you like to develop?');
      await sendMessage(user, 'Teamwork');
      
      await waitForElement('What grade are you in?');
      await sendMessage(user, '9th');
      
      await waitForElement('Have you been involved in clubs or activities before?');
      await sendMessage(user, 'Volunteering');

      await waitForElement('🎉 Perfect! Based on your answers, here are my top recommendations');
      
      expect(screen.getByText('Key Club')).toBeInTheDocument();
      expect(screen.getByText('Interact Club')).toBeInTheDocument();
      expect(screen.getByText('Community Service')).toBeInTheDocument();
    });
  });

  describe('Recommendation Structure', () => {
    beforeEach(async () => {
      render(<AIClubChatbotFixed allClubData={sampleClubData} />);
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      await user.click(chatButton);
      
      await waitForElement('Select your school:');
      const lambertButton = screen.getByText('Lambert High School');
      await user.click(lambertButton);
    });

    test('recommendations contain required fields', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse([
          {
            name: "Robotics Club",
            category: "STEM",
            school: "Lambert High School",
            reason: "Perfect match for your STEM interests",
            matchScore: "High"
          }
        ])
      });

      // Complete conversation
      await waitForElement('What are your main interests?');
      await sendMessage(user, 'STEM');
      
      await waitForElement('How much time can you commit each week?');
      await sendMessage(user, 'High');
      
      await waitForElement('What type of club experience are you looking for?');
      await sendMessage(user, 'Competitive');
      
      await waitForElement('What skills or goals would you like to develop?');
      await sendMessage(user, 'Leadership');
      
      await waitForElement('What grade are you in?');
      await sendMessage(user, '10th');
      
      await waitForElement('Have you been involved in clubs or activities before?');
      await sendMessage(user, 'Some sports clubs');

      await waitForElement('🎉 Perfect! Based on your answers, here are my top recommendations');
      
      expect(screen.getByText('Robotics Club')).toBeInTheDocument(); // name
      expect(screen.getByText('STEM')).toBeInTheDocument(); // category
      expect(screen.getByText(/Perfect match for your STEM interests/)).toBeInTheDocument(); // reason
      expect(screen.getByText('High Match')).toBeInTheDocument(); // matchScore
    });

    test('matchScore is one of High, Medium, or Low', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse([
          {
            name: "Robotics Club",
            category: "STEM",
            school: "Lambert High School",
            reason: "Perfect match",
            matchScore: "High"
          },
          {
            name: "Art Club",
            category: "Arts",
            school: "Lambert High School",
            reason: "Good match",
            matchScore: "Medium"
          },
          {
            name: "Key Club",
            category: "Community Service",
            school: "Lambert High School",
            reason: "Basic match",
            matchScore: "Low"
          }
        ])
      });

      // Complete conversation
      await waitForElement('What are your main interests?');
      await sendMessage(user, 'STEM');
      
      await waitForElement('How much time can you commit each week?');
      await sendMessage(user, 'High');
      
      await waitForElement('What type of club experience are you looking for?');
      await sendMessage(user, 'Competitive');
      
      await waitForElement('What skills or goals would you like to develop?');
      await sendMessage(user, 'Leadership');
      
      await waitForElement('What grade are you in?');
      await sendMessage(user, '10th');
      
      await waitForElement('Have you been involved in clubs or activities before?');
      await sendMessage(user, 'Some sports clubs');

      await waitForElement('🎉 Perfect! Based on your answers, here are my top recommendations');
      
      expect(screen.getByText('High Match')).toBeInTheDocument();
      expect(screen.getByText('Medium Match')).toBeInTheDocument();
      expect(screen.getByText('Low Match')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      render(<AIClubChatbotFixed allClubData={sampleClubData} />);
      const chatButton = screen.getByLabelText('Open AI Club Chatbot');
      await user.click(chatButton);
      
      await waitForElement('Select your school:');
      const lambertButton = screen.getByText('Lambert High School');
      await user.click(lambertButton);
    });

    test('handles API errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      // Complete conversation
      await waitForElement('What are your main interests?');
      await sendMessage(user, 'STEM');
      
      await waitForElement('How much time can you commit each week?');
      await sendMessage(user, 'High');
      
      await waitForElement('What type of club experience are you looking for?');
      await sendMessage(user, 'Competitive');
      
      await waitForElement('What skills or goals would you like to develop?');
      await sendMessage(user, 'Leadership');
      
      await waitForElement('What grade are you in?');
      await sendMessage(user, '10th');
      
      await waitForElement('Have you been involved in clubs or activities before?');
      await sendMessage(user, 'Some sports clubs');

      await waitForElement('Sorry, I encountered an error while analyzing your preferences');
    });
  });
});
