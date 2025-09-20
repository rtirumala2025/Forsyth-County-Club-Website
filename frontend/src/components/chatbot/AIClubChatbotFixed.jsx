import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, X, Sparkles } from 'lucide-react';
import { 
  processUserInputEnhanced, 
  generateBotResponse,
  enhancedConversationState,
  getPersonalizedRecommendations
} from '../../services/enhancedClubRecommendationService';

const AIClubChatbotFixed = ({ allClubData, isOpen: externalIsOpen, onClose, selectedSchool = null }) => {
  // Core state management
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalIsOpen !== undefined ? (value) => {
    if (!value && onClose) onClose();
    setInternalIsOpen(value);
  } : setInternalIsOpen;
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Enhanced conversation state management
  const [conversationState, setConversationState] = useState(enhancedConversationState);
  
  // Refs for UI interactions
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        const botResponse = generateBotResponse(conversationState);
        const greetingMessage = {
          id: Date.now(),
          type: 'bot',
          text: botResponse.text,
          timestamp: new Date(),
          quickReplies: botResponse.quickReplies,
          recommendations: botResponse.recommendations,
          aiRecommendations: botResponse.aiRecommendations
        };
        setMessages([greetingMessage]);
      }, 500);
    }
  }, [isOpen]);

  // Add user message to chat
  const addUserMessage = (text) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
  };

  // Add bot message to chat
  const addBotMessage = (text, quickReplies = null, recommendations = null, aiRecommendations = null) => {
    const botMessage = {
      id: Date.now(),
      type: 'bot',
      text: text,
      timestamp: new Date(),
      quickReplies: quickReplies,
      recommendations: recommendations,
      aiRecommendations: aiRecommendations
    };
    setMessages(prev => [...prev, botMessage]);
  };

  // Process user input and update conversation state
  const handleUserInput = async (userInput) => {
    // Update conversation state based on user input
    const newState = await processUserInputEnhanced(userInput, conversationState, allClubData, selectedSchool);
    setConversationState(newState);
    
    // Generate bot response based on new state
    const botResponse = generateBotResponse(newState);
    
    // Add typing delay for natural feel
    setIsLoading(true);
    setTimeout(() => {
      // Check if we have AI recommendations that should be displayed as text
      if (botResponse.aiRecommendations && botResponse.aiRecommendations.length > 0) {
        const aiResponse = botResponse.aiRecommendations[0];
        if (aiResponse.isAIResponse) {
          // Display AI response as text message
          addBotMessage(
            aiResponse.description, 
            botResponse.quickReplies, 
            botResponse.recommendations,
            [] // Clear AI recommendations since we're showing as text
          );
        } else {
          // Display as regular AI recommendations
          addBotMessage(
            botResponse.text, 
            botResponse.quickReplies, 
            botResponse.recommendations,
            botResponse.aiRecommendations
          );
        }
      } else {
        addBotMessage(
          botResponse.text, 
          botResponse.quickReplies, 
          botResponse.recommendations,
          botResponse.aiRecommendations
        );
      }
      setIsLoading(false);
    }, 1000);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    addUserMessage(message);
    
    await handleUserInput(message);
  };

  // Handle quick reply clicks
  const handleQuickReply = (reply) => {
    addUserMessage(reply);
    handleUserInput(reply);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render club recommendation card
  const renderClubCard = (club, isAI = false) => (
    <div key={club.id || club.clubName} className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900 text-sm">
            {club.name || club.clubName}
          </h4>
          {isAI && (
            <div className="flex items-center gap-1">
              <Sparkles size={12} className="text-blue-500" />
              <span className="text-xs text-blue-600">AI</span>
            </div>
          )}
        </div>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
          {club.category}
        </span>
      </div>
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
        {club.description || club.reason || 'No description available'}
      </p>
      {club.fit && (
        <p className="text-xs text-gray-500 mb-3 italic">
          "{club.fit}"
        </p>
      )}
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Sponsor: {club.sponsor ? club.sponsor.split(' ')[0] + '...' : 'TBD'}
        </span>
        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
          Learn More →
        </button>
      </div>
    </div>
  );

  // Render quick reply buttons
  const renderQuickReplies = (quickReplies) => (
    <div className="flex flex-wrap gap-2 mt-3">
      {quickReplies.map((reply, index) => (
        <button
          key={index}
          onClick={() => handleQuickReply(reply)}
          className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors border border-gray-200"
        >
          {reply}
        </button>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[450px] h-[600px] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-base">Club Discovery Assistant</h3>
              <p className="text-sm text-blue-100">Find your perfect clubs!</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((message) => (
            <div key={message.id}>
              <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                    {message.type === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-gray-600" />}
                  </div>
                  <div className={`rounded-xl px-4 py-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                </div>
              </div>
              
              {/* Quick replies */}
              {message.type === 'bot' && message.quickReplies && (
                <div className="ml-11 mt-2">
                  {renderQuickReplies(message.quickReplies)}
                </div>
              )}
              
              {/* Club recommendations */}
              {message.type === 'bot' && message.recommendations && message.recommendations.length > 0 && (
                <div className="ml-11 mt-3">
                  <div className="space-y-2">
                    {message.recommendations.map(club => renderClubCard(club, false))}
                  </div>
                </div>
              )}
              
              {/* AI recommendations */}
              {message.type === 'bot' && message.aiRecommendations && message.aiRecommendations.length > 0 && (
                <div className="ml-11 mt-3">
                  <div className="space-y-2">
                    {message.aiRecommendations.map(club => renderClubCard(club, true))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-[85%]">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-xl px-4 py-3">
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
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me about your interests or ask a question..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
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

export default AIClubChatbotFixed;
