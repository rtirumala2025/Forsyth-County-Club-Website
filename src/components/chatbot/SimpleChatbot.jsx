import React, { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Send, Bot, User } from 'lucide-react';

const SimpleChatbot = ({ allClubData, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('greeting');
  const [userPreferences, setUserPreferences] = useState({});
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage("Hi there! 👋 I'm your AI club advisor. I'm here to help you find the perfect clubs based on your interests. What are you most interested in? (e.g., STEM, Arts, Sports, Leadership, etc.)");
      }, 500);
    }
  }, [isOpen]);

  const addBotMessage = (text) => {
    const botMessage = {
      id: Date.now(),
      type: 'bot',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const addUserMessage = (text) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
  };

  // Simple recommendation logic
  const getClubRecommendations = (interests) => {
    if (!allClubData || allClubData.length === 0) return [];
    
    const allClubs = allClubData.flatMap(school => school.clubs || school.club || []);
    const interestsLower = interests.toLowerCase();
    
    // Simple keyword matching
    const recommendations = allClubs.filter(club => {
      const clubText = `${club.name} ${club.description} ${club.category}`.toLowerCase();
      return clubText.includes(interestsLower) || 
             club.category.toLowerCase().includes(interestsLower);
    });

    return recommendations.slice(0, 5); // Return top 5 matches
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userInput = inputValue.trim();
    addUserMessage(userInput);
    setInputValue('');
    setIsLoading(true);

    // Simple conversation flow
    setTimeout(() => {
      let botResponse = '';
      
      if (currentStep === 'greeting') {
        setUserPreferences(prev => ({ ...prev, interests: userInput }));
        const recommendations = getClubRecommendations(userInput);
        
        if (recommendations.length > 0) {
          botResponse = `Great! Based on your interest in ${userInput}, here are some clubs I think you'd love:\n\n`;
          recommendations.forEach((club, index) => {
            botResponse += `${index + 1}. **${club.name}** (${club.category})\n   ${club.description.substring(0, 100)}...\n\n`;
          });
          botResponse += "Would you like to know more about any of these clubs, or would you like me to search for something else?";
        } else {
          botResponse = `I understand you're interested in ${userInput}! While I couldn't find clubs with that exact match, you might enjoy exploring our ${getAllCategories().join(', ')} categories. What specific activities or skills are you hoping to develop?`;
        }
        setCurrentStep('recommendations');
      } else {
        // Handle follow-up questions
        const recommendations = getClubRecommendations(userInput);
        if (recommendations.length > 0) {
          botResponse = `Here are some clubs related to "${userInput}":\n\n`;
          recommendations.forEach((club, index) => {
            botResponse += `${index + 1}. **${club.name}** (${club.category})\n   Sponsor: ${club.sponsor}\n\n`;
          });
        } else {
          botResponse = `I couldn't find specific clubs for "${userInput}", but I'd be happy to help you explore other interests! Try mentioning categories like: ${getAllCategories().slice(0, 5).join(', ')}, or tell me about specific activities you enjoy.`;
        }
      }
      
      addBotMessage(botResponse);
      setIsLoading(false);
    }, 1000);
  };

  const getAllCategories = () => {
    if (!allClubData || allClubData.length === 0) return [];
    const allClubs = allClubData.flatMap(school => school.clubs || school.club || []);
    const categories = [...new Set(allClubs.map(club => club.category))];
    return categories.filter(Boolean);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-semibold">AI Club Assistant</h3>
              <p className="text-xs text-blue-100">Here to help you find clubs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  {message.type === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-gray-600" />}
                </div>
                <div className={`rounded-2xl px-4 py-2 ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-[80%]">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-xl transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleChatbot;
