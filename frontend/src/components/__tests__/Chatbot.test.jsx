/**
 * Integration test for Chatbot component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chatbot from '../Chatbot';

// Mock fetch globally
const originalFetch = global.fetch;

describe('Chatbot component', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url, opts) => {
      if (typeof url === 'string' && url.endsWith('/chat')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            message: 'Based on your interests, consider: Computer Science Club (Technology).',
            recommendations: [
              { name: 'Computer Science Club', category: 'Technology', confidence: 82, reasoning: 'Matches interests: technology, coding', source: 'ai' },
              { name: 'Robotics Team', category: 'Technology', confidence: 70, reasoning: 'Matches query keywords', source: 'ai' }
            ],
            confidence: 78,
            source: 'ai'
          })
        });
      }
      if (typeof url === 'string' && url.endsWith('/chat/suggestions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, suggestions: ['What clubs are good for someone interested in technology?'] })
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('renders and displays recommendations with confidence badges', async () => {
    render(<Chatbot isOpen={true} onToggle={() => {}} />);

    // Type message
    const input = screen.getByLabelText('Message input');
    fireEvent.change(input, { target: { value: 'I like technology' } });

    // Submit
    const sendButton = screen.getByLabelText('Send message');
    fireEvent.click(sendButton);

    // Wait for bot response
    await waitFor(() => {
      expect(screen.getByText(/Based on your interests, consider/i)).toBeInTheDocument();
    });

    // Recommendations appear
    expect(screen.getByText('Computer Science Club')).toBeInTheDocument();
    expect(screen.getByText('Robotics Team')).toBeInTheDocument();

    // Confidence badges appear
    expect(screen.getAllByLabelText(/Confidence .* out of 100/i).length).toBeGreaterThan(0);
  });
});
