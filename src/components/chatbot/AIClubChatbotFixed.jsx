import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, MessageCircle, Send, Bot, User, School, Clock, Target, Heart, BookOpen, Award, ArrowLeft, ThumbsUp, ThumbsDown, Image, Mic, Calendar, Star, Users, TrendingUp, Sparkles } from 'lucide-react';

// Helper functions defined outside component to avoid hoisting issues
const isAlgorithmQuestion = (message) => {
  const messageLower = message.toLowerCase();
  const algorithmPatterns = [
    /how\s+(?:do\s+)?(?:you|this|it|the\s+system|the\s+ai)\s+(?:work|recommend|choose|pick|decide|find|match|know|figure\s+out|determine|score|rank|sort|filter)/i,
    /what\s+(?:is|makes)\s+(?:your|the)\s+(?:algorithm|system|process|method|formula|secret)/i,
    /why\s+(?:did\s+you\s+)?(?:recommend|suggest|pick|choose|show)\s+(?:this|that|these|those)/i,
    /explain\s+(?:how|the|this|your|the\s+recommendation)/i,
    /tell\s+me\s+(?:how|about|the\s+secret)/i,
    /what\s+(?:is|makes)\s+(?:the\s+)?(?:behind\s+the\s+scenes|magic|process)/i,
    /algorithm\s*(?:lol|haha|omg|wow|cool|awesome|amazing|magic|secret|formula)/i,
    /secret\s+(?:formula|sauce|recipe|algorithm|method)/i,
    /magic\s+(?:formula|algorithm|system|process)/i,
    /behind\s+the\s+(?:scenes|curtain|magic)/i,
    /why\s+(?:this|that)\s+club/i,
    /how\s+(?:do\s+you\s+)?(?:come\s+up\s+with|think\s+of|find)\s+(?:these|those|this|that)/i,
    /what\s+(?:makes\s+you\s+)?(?:think|believe|know)\s+(?:i|this|that)/i,
    /how\s+(?:does|do)\s+(?:the\s+)?(?:recommendation|matching|scoring|ranking)\s+(?:work|system)/i,
    /what\s+(?:is|are)\s+(?:the\s+)?(?:criteria|factors|reasons|logic)/i,
    /can\s+you\s+(?:explain|tell\s+me|show\s+me)\s+(?:how|what|why)/i
  ];
  return algorithmPatterns.some(pattern => pattern.test(messageLower));
};

const isRepeatAlgorithmQuestion = (message) => {
  const messageLower = message.toLowerCase();
  const repeatPatterns = [
    /(?:explain|say|tell)\s+(?:it|this|that)\s+(?:differently|another\s+way|again|in\s+a\s+different\s+way)/i,
    /(?:can\s+you\s+)?(?:explain|say|tell)\s+(?:differently|another\s+way|again)/i,
    /(?:i\s+)?(?:didn't|didnt|don't|dont)\s+(?:understand|get\s+it|catch\s+that)/i,
    /(?:can\s+you\s+)?(?:repeat|rephrase|restate)/i,
    /(?:say|tell)\s+(?:it|that)\s+(?:again|one\s+more\s+time)/i
  ];
  return repeatPatterns.some(pattern => pattern.test(messageLower));
};

const AIClubChatbotFixed = ({ allClubData, isOpen: externalIsOpen, onClose }) => {
  // Core state management
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalIsOpen !== undefined ? (value) => {
    if (!value && onClose) onClose();
    setInternalIsOpen(value);
  } : setInternalIsOpen;
  
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [conversationMode, setConversationMode] = useState('questioning');
  const [inputValue, setInputValue] = useState('');
  
  // Enhanced conversation state
  const [userName, setUserName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationFlow, setConversationFlow] = useState('greeting');
  const [lastUserSentiment, setLastUserSentiment] = useState('neutral');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [emotionalContext, setEmotionalContext] = useState({
    mood: 'neutral',
    energy: 'medium',
    engagement: 0,
    frustration: 0,
    excitement: 0
  });
  
  // Adaptive conversation flow state
  const [conversationAdaptation, setConversationAdaptation] = useState({
    skippedQuestions: [],
    backtrackingHistory: [],
    dynamicFollowUps: [],
    userEngagementLevel: 0,
    conversationPace: 'normal',
    proactiveSuggestions: []
  });
  
  // Personality and conversation state
  const [botPersonality, setBotPersonality] = useState({
    name: 'Alex',
    tone: 'friendly',
    humor: 'light',
    enthusiasm: 'high',
    responseStyle: 'conversational'
  });
  
  // School and data management
  const [availableSchools, setAvailableSchools] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  
  // Enhanced conversation management
  const [conversationId, setConversationId] = useState(null);
  const [conversationContext, setConversationContext] = useState({
    originalAnswers: {},
    followUpRequests: [],
    currentRecommendations: [],
    recommendationHistory: [],
    userPreferences: {},
    conversationTone: 'friendly',
    userEngagement: 0,
    backtrackingHistory: [],
    emotionalJourney: [],
    proactiveSuggestions: []
  });
  
  // Rich interaction state
  const [showMedia, setShowMedia] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState('normal');
  const [messageAnimations, setMessageAnimations] = useState({});
  
  // Algorithm explanation state
  const [algorithmExplanationCount, setAlgorithmExplanationCount] = useState(0);
  const [lastAlgorithmExplanationStyle, setLastAlgorithmExplanationStyle] = useState(0);
  
  // Refs for UI interactions
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const voiceRecognitionRef = useRef(null);

  // All function definitions moved to the top
  const generateConversationId = useCallback(() => {
    return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }, []);

  const handleAlgorithmQuestion = useCallback((message, explanationCount = 0) => {
    const defaultExplanation = `Great question! 🤓 Let me break down how I find the perfect clubs for you in simple terms:

**Step 1: Getting to Know You** 📝
I start by asking about your interests (like STEM, arts, leadership, etc.) and other helpful info like your time availability and grade level.

**Step 2: Club Matching** 🎯
I then look through all the clubs and compare what you're interested in with what each club offers. Think of it like a smart matching game!

**Step 3: Scoring System** ⭐
Each club gets a "match score" based on how well it fits your preferences. The more things that match up, the higher the score!

**Step 4: Top Picks** 🏆
I show you the clubs with the highest scores first - these are the ones I think you'll love the most!

**Important Note:** These are just suggestions to help you explore! Don't feel limited to only the top matches. Sometimes the most amazing experiences come from trying something unexpected! 🌟

Would you like me to help you explore some clubs now?`;

    const alternativeExplanations = [
      `Awesome question! 😊 Here's how my "magic" works in student-friendly terms:

**The Process:**
1️⃣ **Your Input** → I collect your interests and preferences
2️⃣ **Smart Comparison** → I match your interests with club descriptions and activities  
3️⃣ **Scoring** → Each club gets points based on how well it fits you
4️⃣ **Ranking** → I show you the best matches first
5️⃣ **Diversity** → I mix things up a bit so you get varied suggestions

**The Cool Part:** 🎉
- It's like having a friend who knows all the clubs and can suggest the best ones for YOU
- The recommendations are just starting points - feel free to explore anything that catches your eye!
- Sometimes the most fun comes from trying something completely different

Ready to discover some amazing clubs together?`,

      `Love your curiosity! 🧠 Here's the behind-the-scenes scoop:

**How I Work:**
📊 **Data Collection** → I gather info about your interests, time, and preferences
🔍 **Pattern Matching** → I look for clubs that mention things you're interested in
📈 **Scoring** → I give each club a "compatibility score" 
🎯 **Ranking** → I put the best matches at the top
🎲 **Variety** → I add some randomness so you get diverse options

**Think of it like:** A really smart friend who knows all the clubs and says "Hey, based on what you told me, I think you'd love these!"

**Remember:** My suggestions are just that - suggestions! The best way to find your perfect club is to explore and try things out. Sometimes the most unexpected clubs become your favorites! ✨

Want to see what I found for you?`
    ];

    if (explanationCount === 0) {
      return defaultExplanation;
    } else if (explanationCount === 1) {
      return alternativeExplanations[0];
    } else if (explanationCount === 2) {
      return alternativeExplanations[1];
    } else {
      return `I've already explained how it works a few times now 😊 — want me to show you more clubs instead? I'm excited to help you discover some amazing opportunities! 🌟`;
    }
  }, []);

  const isOffTopicQuestion = useCallback((message) => {
    const offTopicKeywords = ['weather', 'food', 'movie', 'music', 'game', 'sport', 'hobby', 'family', 'friend', 'pet', 'travel', 'vacation', 'joke', 'funny', 'lol', 'haha'];
    const messageLower = message.toLowerCase();
    return offTopicKeywords.some(keyword => messageLower.includes(keyword));
  }, []);

  const handleOffTopicQuestion = useCallback((message) => {
    const offTopicResponses = [
      "That's an interesting question! While I'm focused on helping you find clubs, I'd be happy to chat about that briefly. But first, let's finish finding you some great clubs! 😊",
      "I love your curiosity! I'm here specifically to help with club recommendations, but I appreciate you sharing that with me. Shall we continue with finding your perfect clubs?",
      "That's a great point! I'm designed to help with club discovery, but I'm glad you're thinking broadly. Let's get back to finding some amazing clubs for you!",
      "Interesting! I'm here to help you find clubs, but I appreciate the conversation. Ready to discover some great opportunities?"
    ];
    
    return offTopicResponses[Math.floor(Math.random() * offTopicResponses.length)];
  }, []);

  const getClarifyingQuestion = useCallback((questionId, answer) => {
    const clarifications = {
      interests: [
        "That's interesting! Could you tell me a bit more about what specifically draws you to that?",
        "I'd love to hear more about your experience with that! What aspects do you enjoy most?",
        "That's great! Are there any particular activities or skills related to that you'd like to develop?"
      ],
      timeCommitment: [
        "Thanks! Just to make sure I understand - do you mean per week, or are you thinking about a different timeframe?",
        "Got it! Is that time you'd prefer to spend in one session, or spread out across the week?",
        "Perfect! Are you thinking about regular weekly meetings, or more flexible scheduling?"
      ],
      clubType: [
        "That sounds great! What kind of environment are you hoping to find?",
        "I'm curious - what aspects of that type of experience appeal to you most?",
        "That's helpful! Are you looking for something structured, or more casual and flexible?"
      ],
      skills: [
        "That's awesome! How do you see yourself using those skills in the future?",
        "Great choice! What level of experience do you have with that?",
        "Perfect! Are you looking to develop those skills further or just maintain them?"
      ],
      gradeLevel: [
        "Thanks! That helps me suggest age-appropriate clubs. Any specific interests for your grade level?",
        "Got it! Are there any particular challenges or opportunities you're thinking about for this year?",
        "Perfect! What are you most excited about for this school year?"
      ],
      previousExperience: [
        "That's really helpful context! What did you enjoy most about those experiences?",
        "Thanks for sharing! What would you like to do differently this time?",
        "Great! Are you looking for something similar or trying something completely new?"
      ]
    };
    
    const questionArray = clarifications[questionId] || ["Could you tell me a bit more about that?"];
    return questionArray[Math.floor(Math.random() * questionArray.length)];
  }, []);

  const needsClarification = useCallback((questionId, answer) => {
    if (!answer || answer.length < 3) return true;
    
    const vagueAnswers = ['idk', 'not sure', 'maybe', 'i guess', 'whatever', 'dont know', "don't know"];
    if (vagueAnswers.some(vague => answer.toLowerCase().includes(vague))) return true;
    
    return false;
  }, []);

  const showTypingIndicator = useCallback((duration = 2000, complexity = 'normal') => {
    setIsTyping(true);
    const actualDuration = complexity === 'complex' ? duration + 1000 : duration;
    setTimeout(() => setIsTyping(false), actualDuration);
    return actualDuration;
  }, []);

  // Questions array
  const questions = [
    {
      id: 'interests',
      text: `Hey ${userName || 'there'}! 🌟 I'm curious - what really gets you excited? Are you into STEM, Arts, Business, Sports, Community Service, Music, Leadership, or something totally different?`,
      placeholder: "Tell me what makes you tick...",
      required: true
    },
    {
      id: 'timeCommitment',
      text: `Great question, ${userName || 'friend'}! ⏰ How much time do you think you can realistically commit each week? I want to make sure we find clubs that fit your schedule perfectly!`,
      placeholder: "e.g., 1-2 hours, 3-5 hours, 6+ hours...",
      required: true
    },
    {
      id: 'clubType',
      text: `Awesome, ${userName || 'there'}! 🎯 What kind of vibe are you looking for? Competitive tournaments, chill social hangouts, academic challenges, creative expression, leadership opportunities... what sounds most appealing?`,
      placeholder: "Competitive, Social, Academic, Creative, Leadership...",
      required: true
    },
    {
      id: 'gradeLevel',
      text: `Quick question, ${userName || 'there'}! 📚 What grade are you in? This helps me suggest clubs that are perfect for your level!`,
      placeholder: "9th, 10th, 11th, or 12th grade",
      required: true
    }
  ];

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
      setConversationId(generateConversationId());
      setTimeout(() => {
        const greetingMessage = {
          id: Date.now(),
          type: 'bot',
          text: `Hi there! 👋 I'm ${botPersonality.name}, your personal club discovery buddy! I'm genuinely excited to help you find some amazing opportunities! Let's start with your interests - what really gets you excited?`,
          timestamp: new Date()
        };
        setMessages([greetingMessage]);
      }, 500);
    }
  }, [isOpen, botPersonality.name, generateConversationId]);

  // Extract available schools from club data on component mount
  useEffect(() => {
    if (allClubData && allClubData.length > 0) {
      const schools = allClubData.map(schoolData => schoolData.school);
      setAvailableSchools(schools);
    }
  }, [allClubData]);

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

  const handleSendMessage = async () => {
    if (!inputValue || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    addUserMessage(message);
    setIsLoading(true);

    // Add simple response for now
    setTimeout(() => {
      const responseMessage = {
        id: Date.now() + 0.5,
        type: 'bot',
        text: `Thanks for your message: "${message}"! I'm here to help you find clubs. What interests you most - STEM, Arts, Sports, or something else?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, responseMessage]);
      setIsLoading(false);
    }, 1000);
    return;

    /*
    try {
      // Algorithm explanation handling
      if (isAlgorithmQuestion(message)) {
        const isRepeat = isRepeatAlgorithmQuestion(message);
        const newExplanationCount = isRepeat ? algorithmExplanationCount + 1 : 0;
        
        setAlgorithmExplanationCount(newExplanationCount);
        
        const algorithmResponse = handleAlgorithmQuestion(message, newExplanationCount);
        const typingDuration = showTypingIndicator(2500, 'complex');
        
        setTimeout(() => {
          const responseMessage = {
            id: Date.now() + 0.5,
            type: 'bot',
            text: algorithmResponse,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, responseMessage]);
          
          if (!isRepeat) {
            setTimeout(() => {
              const followUpMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: "Now that you know how I work, would you like to continue with finding some great clubs for you? I'm excited to help you discover amazing opportunities! 😊",
                timestamp: new Date()
              };
              setMessages(prev => [...prev, followUpMessage]);
            }, 2000);
          }
        }, typingDuration);
        setIsLoading(false);
        return;
      }

      // Off-topic handling
      if (conversationMode === 'questioning' && isOffTopicQuestion(message)) {
        const offTopicResponse = handleOffTopicQuestion(message);
        const typingDuration = showTypingIndicator(2000, 'complex');
        
        setTimeout(() => {
          const responseMessage = {
            id: Date.now() + 0.5,
            type: 'bot',
            text: offTopicResponse,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, responseMessage]);
          
          setTimeout(() => {
            const currentQuestionData = questions[currentQuestion];
            const redirectionMessage = {
              id: Date.now() + 1,
              type: 'bot',
              text: `Now, back to finding you the perfect clubs! ${currentQuestionData.text}`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, redirectionMessage]);
          }, 1500);
        }, typingDuration);
        setIsLoading(false);
        return;
      }

      // Handle school selection if needed
      if (!selectedSchool && availableSchools.length > 0) {
        const matchedSchool = availableSchools.find(school => 
          school.toLowerCase().includes(message.toLowerCase())
        );
        
        if (matchedSchool) {
          setSelectedSchool(matchedSchool);
          addBotMessage(`Perfect! I'll focus on clubs at ${matchedSchool}. Now, let's learn about your interests!`);
          setIsLoading(false);
          return;
        } else {
          addBotMessage(`I found these schools: ${availableSchools.join(', ')}. Which one are you interested in?`);
          setIsLoading(false);
          return;
        }
      }

      // Store the answer
      const currentQuestionData = questions[currentQuestion];
      setUserAnswers(prev => ({ ...prev, [currentQuestionData.id]: message }));

      // Check if clarification is needed
      if (needsClarification(currentQuestionData.id, message)) {
        const clarifyingQuestion = getClarifyingQuestion(currentQuestionData.id, message);
        const typingDuration = showTypingIndicator(1800, 'normal');
        
        setTimeout(() => {
          const clarificationMessage = {
            id: Date.now() + 0.5,
            type: 'bot',
            text: clarifyingQuestion,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, clarificationMessage]);
        }, typingDuration);
        setIsLoading(false);
        return;
      }

      // Move to next question or provide recommendations
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        const nextQuestion = questions[currentQuestion + 1];
        const typingDuration = showTypingIndicator(1500, 'normal');
        
        setTimeout(() => {
          const nextQuestionMessage = {
            id: Date.now() + 0.5,
            type: 'bot',
            text: nextQuestion.text,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, nextQuestionMessage]);
        }, typingDuration);
      } else {
        // Provide recommendations
        const interests = userAnswers.interests || message;
        const recommendations = getClubRecommendations(interests);
        
        if (recommendations.length > 0) {
          let recommendationText = `Based on your interests, here are some clubs I think you'd love:\n\n`;
          recommendations.forEach((club, index) => {
            recommendationText += `${index + 1}. **${club.name}** (${club.category})\n   ${club.description.substring(0, 150)}...\n   Sponsor: ${club.sponsor}\n\n`;
          });
          recommendationText += "Would you like to know more about any of these clubs, or would you like me to search for something else?";
          
          const typingDuration = showTypingIndicator(3000, 'complex');
          setTimeout(() => {
            const recommendationMessage = {
              id: Date.now() + 0.5,
              type: 'bot',
              text: recommendationText,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, recommendationMessage]);
          }, typingDuration);
        } else {
          const typingDuration = showTypingIndicator(2000, 'normal');
          setTimeout(() => {
            const noResultsMessage = {
              id: Date.now() + 0.5,
              type: 'bot',
              text: `I understand you're interested in ${interests}! While I couldn't find exact matches, you might enjoy exploring our different categories. What specific activities or skills are you hoping to develop?`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, noResultsMessage]);
          }, typingDuration);
        }
        
        setConversationMode('recommendations');
      }
      
      setIsLoading(false);
    */
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
              <h3 className="font-semibold text-base">AI Club Assistant</h3>
              <p className="text-sm text-blue-100">Here to help you find clubs</p>
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
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
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
          ))}
          
          {isTyping && (
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
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
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
