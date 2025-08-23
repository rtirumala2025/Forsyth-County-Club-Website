import React from 'react';
import AIClubChatbot from './AIClubChatbot';
import { sampleClubs } from '../data/sampleClubs';

// Example component showing how to use the AI Club Chatbot
const AIClubChatbotExample = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          AI Club Recommendation Chatbot Demo
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            How to Use the Chatbot
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Click the chat button in the bottom-right corner</li>
            <li>Answer the questions about your interests and preferences</li>
            <li>Wait for the AI to analyze your responses</li>
            <li>Review your personalized club recommendations</li>
            <li>Click "Start Over" to try again with different preferences</li>
          </ol>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Available Clubs for Testing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleClubs.map((club, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800">{club.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{club.category}</p>
                <p className="text-xs text-gray-500 mt-2">{club.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {club.interests.slice(0, 3).map((interest, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The AI Chatbot Component */}
      <AIClubChatbot clubs={sampleClubs} />
    </div>
  );
};

export default AIClubChatbotExample;
