import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, MessageCircle, Send, Bot, User, School, Clock, Target, Heart, BookOpen, Award, ArrowLeft, ThumbsUp, ThumbsDown, Image, Mic, Calendar, Star, Users, TrendingUp, Sparkles } from 'lucide-react';

const AIClubChatbot = ({ allClubData }) => {
  // Core state management
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [conversationMode, setConversationMode] = useState('questioning');
  
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
  
  // Refs for UI interactions
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const voiceRecognitionRef = useRef(null);

  // Generate conversation ID
  const generateConversationId = () => {
    return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Enhanced personality responses
  const getPersonalityResponse = (type, context = {}) => {
    const responses = {
      greeting: [
        "Hey there! 👋 I'm Alex, your personal club discovery buddy! I'm genuinely excited to help you find some amazing opportunities!",
        "Hi! ✨ I'm Alex, and I've got this awesome feeling we're going to find some perfect clubs for you today!",
        "Hello there! 🌟 I'm Alex, your friendly neighborhood club advisor. Ready to embark on this adventure together?",
        "Hey! 🚀 I'm Alex, and I'm absolutely thrilled to be your guide through the wonderful world of school clubs!"
      ],
      encouragement: [
        "That's the spirit! I love your enthusiasm! 😊",
        "You're absolutely crushing this! Keep that energy up! ✨",
        "Wow, you're really thinking this through - that's fantastic! 🌟",
        "I can feel your excitement, and it's totally contagious! 🎉"
      ],
      empathy: [
        "I totally get where you're coming from! Let's figure this out together. 🤗",
        "No worries at all! We're in this together, and I've got your back! 💪",
        "I hear you, and I'm here to make this as smooth as possible for you! 😌",
        "Don't stress! We'll take it step by step and find what works perfectly for you! ✨"
      ],
      celebration: [
        "🎉 YES! That's exactly the kind of thinking that leads to amazing club experiences!",
        "🌟 Fantastic! I can already see you thriving in the right environment!",
        "✨ Perfect! You're really getting the hang of this - I'm impressed!",
        "🚀 Amazing! That's the kind of clarity that makes all the difference!"
      ],
      humor: [
        "Haha, I love your style! 😄 You're making this way more fun than I expected!",
        "Oh my gosh, that's hilarious! 😂 You've got a great sense of humor!",
        "LOL! You're absolutely right about that! 😆 This is why I love my job!",
        "That's comedy gold! 😄 You're definitely keeping me entertained!"
      ]
    };
    
    const responseArray = responses[type] || responses.greeting;
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  };

  // Enhanced sentiment detection with emotional context
  const detectSentiment = useCallback((message) => {
    const text = message.toLowerCase();
    
    // Enhanced word lists
    const positiveWords = ['love', 'great', 'awesome', 'amazing', 'excellent', 'perfect', 'wonderful', 'fantastic', 'excited', 'happy', 'good', 'nice', 'cool', 'interesting', 'fascinating', 'brilliant', 'outstanding', 'incredible', 'phenomenal', 'stellar'];
    const negativeWords = ['hate', 'terrible', 'awful', 'bad', 'worst', 'disappointed', 'frustrated', 'confused', 'difficult', 'hard', 'boring', 'not sure', 'dont know', 'annoying', 'stressful', 'overwhelming', 'complicated', 'tiring'];
    const confusedWords = ['what', 'how', 'why', 'confused', 'not sure', 'dont understand', 'help', '?', 'unsure', 'unclear', 'lost', 'stuck', 'dont get it'];
    const excitedWords = ['wow', 'omg', 'amazing', 'incredible', 'fantastic', 'love it', 'perfect', 'exactly', 'yes', 'awesome', 'brilliant', 'genius'];
    const frustratedWords = ['ugh', 'seriously', 'come on', 'really', 'annoying', 'frustrating', 'tired of', 'sick of', 'enough'];
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    const confusedCount = confusedWords.filter(word => text.includes(word)).length;
    const excitedCount = excitedWords.filter(word => text.includes(word)).length;
    const frustratedCount = frustratedWords.filter(word => text.includes(word)).length;
    
    // Update emotional context
    setEmotionalContext(prev => ({
      ...prev,
      excitement: Math.min(prev.excitement + excitedCount * 0.2, 1),
      frustration: Math.min(prev.frustration + frustratedCount * 0.2, 1),
      engagement: Math.min(prev.engagement + 0.1, 1)
    }));
    
    if (confusedCount > 0) return 'confused';
    if (excitedCount > 2) return 'excited';
    if (frustratedCount > 1) return 'frustrated';
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }, []);

  // Enhanced empathetic responses with personality and context awareness
  const getEmpatheticResponse = useCallback((sentiment, context = {}) => {
    const { userName, emotionalContext: emotions, conversationAdaptation } = context;
    const name = userName ? `, ${userName}` : '';
    const engagementLevel = conversationAdaptation?.userEngagementLevel || 0;
    
    // Adjust tone based on engagement level and emotional context
    const getToneModifier = () => {
      if (engagementLevel > 0.7) return 'enthusiastic';
      if (emotions?.frustration > 0.3) return 'supportive';
      if (emotions?.excitement > 0.5) return 'excited';
      return 'friendly';
    };
    
    const tone = getToneModifier();
    
    const responses = {
      positive: [
        `That's absolutely fantastic${name}! I love your enthusiasm! 😊`,
        `Wow${name}, that sounds amazing! I'm getting excited just hearing about it! ✨`,
        `That's wonderful${name}! Your passion is totally shining through! 🌟`,
        `Excellent${name}! I can tell you're really engaged with this! 🎉`
      ],
      excited: [
        `OMG${name}! I'm so excited for you! This is going to be incredible! 🚀`,
        `YES${name}! I can feel your energy and it's absolutely contagious! ✨`,
        `WOW${name}! This is exactly the kind of enthusiasm that leads to amazing experiences! 🌟`,
        `Fantastic${name}! I'm literally buzzing with excitement for you! 🎉`
      ],
      negative: [
        `I understand this might be challenging${name}. Let me help make it easier for you! 🤗`,
        `No worries at all${name}! We'll figure this out together, step by step. 💪`,
        `I hear you${name}, and I'm here to help make this process smoother for you. 😌`,
        `Don't worry${name}! Let's take our time and find what works best for you. ✨`
      ],
      frustrated: [
        `I totally get your frustration${name}. Let's take a deep breath and tackle this together! 😤`,
        `I hear you${name}, and I'm not going to let you get stuck here. We've got this! 💪`,
        `I understand this is annoying${name}. Let me help you get past this roadblock! 🚧`,
        `Your frustration is totally valid${name}. Let's work through this together! 🤝`
      ],
      confused: [
        `I totally get that${name}! Let me break this down in a simpler way. 😊`,
        `No problem at all${name}! Let me explain this more clearly. ✨`,
        `I understand the confusion${name}! Let me help clarify this for you. 🤔`,
        `That's a great question${name}! Let me make this easier to understand. 💡`
      ],
      neutral: [
        `Thanks for sharing that with me${name}! 👍`,
        `Got it${name}! That's helpful information. ✨`,
        `Perfect${name}! I'm learning more about what you're looking for. 🌟`,
        `Great${name}! This helps me understand your preferences better. 💫`
      ]
    };
    
    const responseArray = responses[sentiment] || responses.neutral;
    const baseResponse = responseArray[Math.floor(Math.random() * responseArray.length)];
    
    // Add context-aware follow-ups for high engagement
    if (engagementLevel > 0.6 && sentiment === 'positive') {
      const followUps = [
        " I'm curious - what specifically about that gets you excited?",
        " Tell me more about what draws you to that!",
        " I'd love to hear more about your experience with that!"
      ];
      return baseResponse + followUps[Math.floor(Math.random() * followUps.length)];
    }
    
    return baseResponse;
  }, []);

  // Enhanced typing simulation with realistic delays
  const showTypingIndicator = useCallback((duration = 1500, speed = 'normal') => {
    setIsTyping(true);
    setTypingSpeed(speed);
    
    // Simulate thinking for complex responses
    const thinkingDelays = {
      'fast': 800,
      'normal': 1500,
      'slow': 2500,
      'complex': 3000
    };
    
    const actualDuration = thinkingDelays[speed] || duration;
    
    setTimeout(() => setIsTyping(false), actualDuration);
    return actualDuration;
  }, []);

  // Enhanced conversation memory
  const saveConversationMemory = useCallback(() => {
    const memory = {
      conversationId,
      userName,
      selectedSchool,
      userAnswers,
      emotionalContext,
      conversationContext,
      timestamp: new Date().toISOString()
    };
    
    try {
      const existingMemories = JSON.parse(localStorage.getItem('chatbotMemories') || '[]');
      const updatedMemories = existingMemories.filter(m => m.conversationId !== conversationId);
      updatedMemories.push(memory);
      localStorage.setItem('chatbotMemories', JSON.stringify(updatedMemories.slice(-10))); // Keep last 10
    } catch (error) {
      console.log('Could not save conversation memory:', error);
    }
  }, [conversationId, userName, selectedSchool, userAnswers, emotionalContext, conversationContext]);

  // Load conversation memory
  const loadConversationMemory = useCallback((convId) => {
    try {
      const memories = JSON.parse(localStorage.getItem('chatbotMemories') || '[]');
      const memory = memories.find(m => m.conversationId === convId);
      if (memory) {
        setUserName(memory.userName || '');
        setSelectedSchool(memory.selectedSchool || null);
        setUserAnswers(memory.userAnswers || {});
        setEmotionalContext(memory.emotionalContext || { mood: 'neutral', energy: 'medium', engagement: 0, frustration: 0, excitement: 0 });
        setConversationContext(memory.conversationContext || {});
        return true;
      }
    } catch (error) {
      console.log('Could not load conversation memory:', error);
    }
    return false;
  }, []);

  // Extract available schools from club data on component mount
  useEffect(() => {
    if (allClubData && allClubData.length > 0) {
      const schools = allClubData.map(schoolData => schoolData.school);
      setAvailableSchools(schools);
    }
  }, [allClubData]);

  // Enhanced questions with personality, context awareness, and adaptive flow
  const getQuestions = useCallback(() => {
    const baseQuestions = [
      {
        id: 'interests',
        text: (userName, context = {}) => {
          const { emotionalContext, conversationAdaptation } = context;
          const engagementLevel = conversationAdaptation?.userEngagementLevel || 0;
          
          if (engagementLevel > 0.7) {
            return `Hey ${userName || 'there'}! 🌟 I can tell you're really engaged - that's awesome! What really gets you excited? Are you into STEM, Arts, Business, Sports, Community Service, Music, Leadership, or something totally different?`;
          } else if (emotionalContext?.frustration > 0.3) {
            return `Hey ${userName || 'there'}! 🌟 Let's keep this simple - what interests you most? STEM, Arts, Business, Sports, Music, Leadership, or something else?`;
          } else {
            return `Hey ${userName || 'there'}! 🌟 I'm curious - what really gets you excited? Are you into STEM, Arts, Business, Sports, Community Service, Music, Leadership, or something totally different?`;
          }
        },
        placeholder: "Tell me what makes you tick...",
        icon: Heart,
        required: true,
        quickReplies: ['STEM', 'Arts', 'Business', 'Sports', 'Music', 'Leadership', 'Community Service', 'Technology', 'Science', 'Writing'],
        followUp: (answer) => `That's fascinating! I love how diverse interests can be. Tell me more about what specifically draws you to ${answer}?`,
        canSkip: false,
        adaptiveLogic: (userAnswers) => {
          // Skip if user already mentioned interests in name conversation
          return !userAnswers.interests;
        }
      },
      {
        id: 'timeCommitment',
        text: (userName, context = {}) => {
          const { emotionalContext } = context;
          if (emotionalContext?.frustration > 0.3) {
            return `Quick question, ${userName || 'friend'}! ⏰ How much time can you commit each week? 1-2 hours, 3-5 hours, or 6+ hours?`;
          }
          return `Great question, ${userName || 'friend'}! ⏰ How much time do you think you can realistically commit each week? I want to make sure we find clubs that fit your schedule perfectly!`;
        },
        placeholder: "e.g., 1-2 hours, 3-5 hours, 6+ hours...",
        icon: Clock,
        required: true,
        quickReplies: ['1-2 hours', '3-5 hours', '6+ hours', 'Flexible', 'Not sure yet'],
        followUp: (answer) => `Perfect! That's a really realistic approach. Are you thinking regular weekly meetings, or more flexible scheduling?`,
        canSkip: false,
        adaptiveLogic: (userAnswers) => {
          // Skip if user mentioned time constraints earlier
          return !userAnswers.timeCommitment;
        }
      },
      {
        id: 'clubType',
        text: (userName, context = {}) => {
          const { emotionalContext } = context;
          if (emotionalContext?.excitement > 0.5) {
            return `Awesome, ${userName || 'there'}! 🎯 I love your energy! What kind of vibe are you looking for? Competitive tournaments, chill social hangouts, academic challenges, creative expression, leadership opportunities... what sounds most appealing?`;
          }
          return `Awesome, ${userName || 'there'}! 🎯 What kind of vibe are you looking for? Competitive tournaments, chill social hangouts, academic challenges, creative expression, leadership opportunities... what sounds most appealing?`;
        },
        placeholder: "Competitive, Social, Academic, Creative, Leadership...",
        icon: Target,
        required: true,
        quickReplies: ['Competitive', 'Social', 'Academic', 'Creative', 'Leadership', 'Service', 'Relaxed'],
        followUp: (answer) => `Love that choice! What aspects of ${answer} experiences appeal to you most?`,
        canSkip: false,
        adaptiveLogic: (userAnswers) => {
          // Skip if user already indicated preference
          return !userAnswers.clubType;
        }
      },
      {
        id: 'skills',
        text: (userName, context = {}) => {
          const { emotionalContext, conversationAdaptation } = context;
          const engagementLevel = conversationAdaptation?.userEngagementLevel || 0;
          
          if (engagementLevel > 0.8) {
            return `This is where it gets exciting, ${userName || 'friend'}! 🚀 I can tell you're really thinking about this! What skills or superpowers would you love to develop? Leadership, technical skills, creativity, teamwork... or something else entirely?`;
          } else if (emotionalContext?.frustration > 0.3) {
            return `Quick question, ${userName || 'friend'}! 🚀 What skills would you like to develop? Leadership, technical skills, creativity, teamwork, or skip this one?`;
          }
          return `This is where it gets exciting, ${userName || 'friend'}! 🚀 What skills or superpowers would you love to develop? Leadership, technical skills, creativity, teamwork... or something else entirely?`;
        },
        placeholder: "Leadership, technical skills, creativity, teamwork...",
        icon: Award,
        required: false,
        quickReplies: ['Leadership', 'Technical Skills', 'Creativity', 'Teamwork', 'Public Speaking', 'Problem Solving', 'Not sure', 'Skip this'],
        followUp: (answer) => answer === 'Skip this' ? null : `Those are such valuable skills! How do you see yourself using ${answer} in the future?`,
        canSkip: true,
        adaptiveLogic: (userAnswers) => {
          // Skip if user seems rushed or frustrated
          return true;
        }
      },
      {
        id: 'gradeLevel',
        text: (userName, context = {}) => {
          const { emotionalContext } = context;
          if (emotionalContext?.frustration > 0.3) {
            return `Quick question, ${userName || 'there'}! 📚 What grade are you in? 9th, 10th, 11th, or 12th?`;
          }
          return `Quick question, ${userName || 'there'}! 📚 What grade are you in? This helps me suggest clubs that are perfect for your level!`;
        },
        placeholder: "9th, 10th, 11th, or 12th grade",
        icon: School,
        required: true,
        quickReplies: ['9th grade', '10th grade', '11th grade', '12th grade'],
        followUp: (answer) => `Perfect! ${answer} is such an exciting time for exploring new opportunities!`,
        canSkip: false,
        adaptiveLogic: (userAnswers) => {
          // Never skip grade level
          return true;
        }
      },
      {
        id: 'previousExperience',
        text: (userName, context = {}) => {
          const { emotionalContext, conversationAdaptation } = context;
          const engagementLevel = conversationAdaptation?.userEngagementLevel || 0;
          
          if (engagementLevel > 0.6) {
            return `Last question, ${userName || 'friend'}! 📖 I'm really enjoying our conversation! Have you been involved in clubs or activities before? No judgment here - whether you're a club veteran or a total newbie, I've got great suggestions!`;
          } else if (emotionalContext?.frustration > 0.3) {
            return `Last question, ${userName || 'friend'}! 📖 Have you been in clubs before? Yes, No, or Skip?`;
          }
          return `Last question, ${userName || 'friend'}! 📖 Have you been involved in clubs or activities before? No judgment here - whether you're a club veteran or a total newbie, I've got great suggestions!`;
        },
        placeholder: "Tell me about your past experiences...",
        icon: BookOpen,
        required: false,
        quickReplies: ['Yes, several clubs', 'A few clubs', 'No experience', 'Some activities', 'Not sure', 'Skip this'],
        followUp: (answer) => answer === 'Skip this' ? null : `That's really helpful context! Your experience will definitely help us find the perfect fit!`,
        canSkip: true,
        adaptiveLogic: (userAnswers) => {
          // Skip if user seems rushed
          return true;
        }
      }
    ];
    
    return baseQuestions.map(q => ({
      ...q,
      text: typeof q.text === 'function' ? q.text(userName, { emotionalContext, conversationAdaptation }) : q.text
    }));
  }, [userName, emotionalContext, conversationAdaptation]);

  const questions = getQuestions();



  // Generate personalized greetings with casual conversation
  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    
    if (hour < 12) {
      timeGreeting = "Good morning! ☀️";
    } else if (hour < 17) {
      timeGreeting = "Good afternoon! 🌤️";
    } else {
      timeGreeting = "Good evening! 🌙";
    }
    
    const greetings = [
      `${timeGreeting} I'm your personal AI club advisor, and I'm here to help you discover amazing clubs at your school!`,
      `Hey there! 😊 I'm excited to help you find the perfect clubs that match your interests and goals!`,
      `Hello! 🌟 I'm your friendly club advisor, ready to guide you through finding awesome opportunities at your school!`,
      `Hi! ✨ I'm here to make your club discovery journey fun and easy. Let's find some amazing opportunities together!`,
      `${timeGreeting} Ready to explore some awesome clubs? I'm here to help you find the perfect fit! 🚀`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  // Add casual small talk and context-aware humor
  const getCasualSmallTalk = (context = {}) => {
    const { emotionalContext, conversationAdaptation } = context;
    const engagementLevel = conversationAdaptation?.userEngagementLevel || 0;
    
    const smallTalk = [
      "By the way, I love your energy! You're making this way more fun than I expected! 😄",
      "I have to say, you're really good at this! Your answers are so thoughtful! 🌟",
      "You know what? I'm really enjoying our conversation! You're asking great questions! ✨",
      "I can tell you're really thinking about this - that's exactly the right approach! 💪",
      "You're making my job so easy! Your enthusiasm is totally contagious! 🎉"
    ];
    
    // Add context-aware humor
    if (emotionalContext?.frustration > 0.3) {
      return "Don't worry, we're almost there! I promise this will be worth it! 😅";
    }
    
    if (engagementLevel > 0.7) {
      return smallTalk[Math.floor(Math.random() * smallTalk.length)];
    }
    
    return null;
  };





  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize conversation when component mounts
  useEffect(() => {
    setConversationId(generateConversationId());
  }, []);

  // Enhanced conversational recommendation system
  const getLocalRecommendations = useCallback((userAnswers, filteredClubs, conversationContext = {}) => {
    if (!filteredClubs || filteredClubs.length === 0) {
      return [];
    }

    const { userName, emotionalContext: emotions } = conversationContext;
    const name = userName || 'you';

    // Normalize user inputs for better matching
    const normalizeText = (text) => {
      if (!text) return '';
      return text.toLowerCase().trim();
    };

    const userInterests = normalizeText(userAnswers.interests);
    const userSkills = normalizeText(userAnswers.skills);
    const userTimeCommitment = normalizeText(userAnswers.timeCommitment);
    const userClubType = normalizeText(userAnswers.clubType);
    const userGrade = userAnswers.gradeLevel;

    // Enhanced scoring functions with personality
    const getTimeCommitmentScore = (clubCommitment, userCommitment) => {
      const timeMap = {
        'low': 1, '1-2 hours': 1, '1-2': 1,
        'medium': 2, '3-5 hours': 2, '3-5': 2,
        'high': 3, '6+ hours': 3, '6+': 3
      };
      
      const clubScore = timeMap[clubCommitment?.toLowerCase()] || 2;
      const userScore = timeMap[userCommitment] || 2;
      
      return Math.abs(clubScore - userScore) === 0 ? 1 : 
             Math.abs(clubScore - userScore) === 1 ? 0.5 : 0;
    };

    const getTypeMatchScore = (clubType, userType) => {
      const typeMap = {
        'competitive': ['competitive', 'competition', 'tournament', 'team'],
        'social': ['social', 'community', 'cultural', 'service'],
        'academic': ['academic', 'study', 'learning', 'educational'],
        'creative': ['creative', 'art', 'music', 'design', 'creative'],
        'leadership': ['leadership', 'government', 'student council', 'leadership']
      };

      const userTypeWords = typeMap[userType] || [];
      const clubTypeLower = clubType?.toLowerCase() || '';
      
      return userTypeWords.some(word => clubTypeLower.includes(word)) ? 1 : 0;
    };

    const getInterestMatchScore = (club, userInterests) => {
      if (!userInterests) return 0;
      
      const clubText = [
        club.category,
        club.description,
        ...(club.activities || []),
        ...(club.benefits || [])
      ].join(' ').toLowerCase();
      
      const interestWords = userInterests.split(/\s+/);
      const matches = interestWords.filter(word => 
        word.length > 2 && clubText.includes(word)
      );
      
      return matches.length / Math.max(interestWords.length, 1);
    };

    const getSkillsMatchScore = (club, userSkills) => {
      if (!userSkills) return 0;
      
      const clubText = [
        club.description,
        ...(club.activities || []),
        ...(club.benefits || [])
      ].join(' ').toLowerCase();
      
      const skillWords = userSkills.split(/\s+/);
      const matches = skillWords.filter(word => 
        word.length > 2 && clubText.includes(word)
      );
      
      return matches.length / Math.max(skillWords.length, 1);
    };

    const getGradeMatchScore = (club, userGrade) => {
      if (!userGrade || !club.gradeLevels) return 0.5;
      
      const gradeNum = parseInt(userGrade);
      const clubGrades = club.gradeLevels;
      
      if (clubGrades.includes('All grades') || clubGrades.includes('All')) return 1;
      if (clubGrades.some(g => g.includes(gradeNum.toString()))) return 1;
      
      return 0.3;
    };

    // Enhanced conversational reasoning generator with personality and context
    const generateConversationalReason = (club, scores, userAnswers) => {
      const { interestScore, commitmentScore, typeScore, gradeScore, skillsScore } = scores;
      const reasons = [];
      const tone = emotions?.excitement > 0.5 ? 'excited' : emotions?.frustration > 0.3 ? 'supportive' : 'friendly';
      const engagementLevel = conversationAdaptation?.userEngagementLevel || 0;
      
      // Adjust explanation length based on engagement
      const shouldBeDetailed = engagementLevel > 0.6;
      const shouldBeEnthusiastic = emotions?.excitement > 0.4;
      
      if (interestScore > 0.3) {
        const interestReasons = shouldBeEnthusiastic ? [
          `OMG, ${userName}! Your passion for ${userAnswers.interests} is absolutely perfect for this club! 🌟`,
          `I'm getting so excited thinking about you in this club - your love for ${userAnswers.interests} would shine here! ✨`,
          `This club is literally made for someone like you who loves ${userAnswers.interests}! 🚀`,
          `Your interest in ${userAnswers.interests} would make you a star in this club! 💫`
        ] : [
          `I can totally see your passion for ${userAnswers.interests} shining through in this club!`,
          `Your love for ${userAnswers.interests} would be perfect here - it's like this club was made for you!`,
          `This club is all about ${userAnswers.interests}, which I know gets you excited!`,
          `Your interest in ${userAnswers.interests} would fit right in with what this club does!`
        ];
        reasons.push(interestReasons[Math.floor(Math.random() * interestReasons.length)]);
      }
      
      if (commitmentScore > 0.15) {
        const commitmentReasons = shouldBeDetailed ? [
          `The time commitment works perfectly with your ${userAnswers.timeCommitment} schedule - no stress about fitting it in!`,
          `It fits your ${userAnswers.timeCommitment} availability like a glove, so you won't feel overwhelmed!`,
          `Your ${userAnswers.timeCommitment} works great with their meeting schedule - perfect balance!`,
          `The time commitment aligns perfectly with your ${userAnswers.timeCommitment} - it's like they planned it for you!`
        ] : [
          `The time commitment works perfectly with your ${userAnswers.timeCommitment} schedule!`,
          `It fits your ${userAnswers.timeCommitment} availability like a glove!`,
          `Your ${userAnswers.timeCommitment} works great with their meeting schedule!`,
          `The time commitment aligns perfectly with your ${userAnswers.timeCommitment}!`
        ];
        reasons.push(commitmentReasons[Math.floor(Math.random() * commitmentReasons.length)]);
      }
      
      if (typeScore > 0.15) {
        const typeReasons = shouldBeEnthusiastic ? [
          `The ${userAnswers.clubType} environment you're looking for? This club has EXACTLY that vibe! 🎯`,
          `If you want a ${userAnswers.clubType} experience, this club delivers it in spades! 💪`,
          `This club offers the ${userAnswers.clubType} atmosphere you're craving - it's perfect! ✨`,
          `The ${userAnswers.clubType} setting you prefer? This club nails it completely! 🎉`
        ] : [
          `The ${userAnswers.clubType} environment you're looking for? This club has exactly that vibe!`,
          `If you want a ${userAnswers.clubType} experience, this club delivers exactly that!`,
          `This club offers the ${userAnswers.clubType} atmosphere you're craving!`,
          `The ${userAnswers.clubType} setting you prefer? This club nails it!`
        ];
        reasons.push(typeReasons[Math.floor(Math.random() * typeReasons.length)]);
      }
      
      if (gradeScore > 0.8) {
        const gradeReasons = shouldBeDetailed ? [
          `It's perfect for your grade level - you'll be with peers who are at the same stage and understand your journey!`,
          `The club is designed specifically for students like you at your grade level - you'll feel right at home!`,
          `You'll be in great company with other ${userAnswers.gradeLevel} students who are exploring similar opportunities!`,
          `It's tailored perfectly for your grade level - you'll connect with students who get where you're coming from!`
        ] : [
          `It's perfect for your grade level - you'll be with peers who are at the same stage!`,
          `The club is designed specifically for students like you at your grade level!`,
          `You'll be in great company with other ${userAnswers.gradeLevel} students!`,
          `It's tailored perfectly for your grade level - you'll feel right at home!`
        ];
        reasons.push(gradeReasons[Math.floor(Math.random() * gradeReasons.length)]);
      }
      
      if (skillsScore > 0.05) {
        const skillReasons = shouldBeDetailed ? [
          `It's a fantastic place to develop those ${userAnswers.skills} skills you want to build - you'll grow so much!`,
          `You'll get to work on the ${userAnswers.skills} skills you're excited about in a supportive environment!`,
          `This club will help you grow those ${userAnswers.skills} abilities you mentioned - perfect for your development!`,
          `Perfect for developing the ${userAnswers.skills} skills you want to master - you'll be amazed at your progress!`
        ] : [
          `It's a great place to develop those ${userAnswers.skills} skills you want to build!`,
          `You'll get to work on the ${userAnswers.skills} skills you're excited about!`,
          `This club will help you grow those ${userAnswers.skills} abilities you mentioned!`,
          `Perfect for developing the ${userAnswers.skills} skills you want to master!`
        ];
        reasons.push(skillReasons[Math.floor(Math.random() * skillReasons.length)]);
      }
      
      if (reasons.length === 0) {
        const fallbackReasons = shouldBeEnthusiastic ? [
          `I think this ${club.category} club could be a really exciting opportunity for you to explore, ${userName}! 🌟`,
          `This ${club.category} club looks like it could be a great fit for someone with your interests! ✨`,
          `I'm curious about this ${club.category} club for you - it might be worth checking out! 🚀`
        ] : [
          `I think this ${club.category} club could be a really interesting opportunity for you to explore!`,
          `This ${club.category} club looks like it could be a great fit for someone with your interests!`,
          `I'm curious about this ${club.category} club for you - it might be worth checking out!`
        ];
        return fallbackReasons[Math.floor(Math.random() * fallbackReasons.length)];
      }
      
      // Add personality-based connectors
      const connectors = shouldBeEnthusiastic ? [
        " Plus, ",
        " And get this - ",
        " Here's the best part - ",
        " But wait, there's more - "
      ] : [
        " Also, ",
        " Plus, ",
        " Additionally, ",
        " What's great is that "
      ];
      
      if (reasons.length > 1) {
        return reasons[0] + connectors[Math.floor(Math.random() * connectors.length)] + reasons.slice(1).join(' ');
      }
      
      return reasons[0];
    };

    // Score each club with enhanced logic
    const scoredClubs = filteredClubs.map(club => {
      const interestScore = getInterestMatchScore(club, userInterests) * 0.4;
      const commitmentScore = getTimeCommitmentScore(club.commitment, userTimeCommitment) * 0.2;
      const typeScore = getTypeMatchScore(club.type, userClubType) * 0.2;
      const gradeScore = getGradeMatchScore(club, userGrade) * 0.1;
      const skillsScore = getSkillsMatchScore(club, userSkills) * 0.1;
      
      let totalScore = interestScore + commitmentScore + typeScore + gradeScore + skillsScore;
      
      // Enhanced preference boosting
      const userPreferences = conversationContext.userPreferences || {};
      let preferenceBoost = 0;
      
      if (userPreferences.stem && club.category === 'STEM') preferenceBoost += 0.1;
      if (userPreferences.business && club.category === 'Business') preferenceBoost += 0.1;
      if (userPreferences.creative && club.category === 'Arts') preferenceBoost += 0.1;
      if (userPreferences.sports && (club.category === 'Sports' || club.category === 'Athletics')) preferenceBoost += 0.1;
      if (userPreferences.academic && club.category === 'Academic') preferenceBoost += 0.1;
      if (userPreferences.competitive && club.type === 'Competitive') preferenceBoost += 0.05;
      if (userPreferences.social && club.type === 'Social') preferenceBoost += 0.05;
      
      totalScore += Math.min(preferenceBoost, 0.2);
      
      // Generate conversational reasoning
      const reason = generateConversationalReason(club, {
        interestScore, commitmentScore, typeScore, gradeScore, skillsScore
      }, userAnswers);

      return {
        name: club.name,
        category: club.category,
        school: club.school,
        reason: reason,
        matchScore: totalScore >= 0.7 ? 'High' : totalScore >= 0.4 ? 'Medium' : 'Low',
        score: totalScore,
        details: {
          activities: club.activities || [],
          benefits: club.benefits || [],
          commitment: club.commitment,
          type: club.type
        }
      };
    });

    // Sort and return with enhanced presentation
    return scoredClubs
      .sort((a, b) => b.score - a.score)
      .slice(0, 7)
      .map(({ name, category, school, reason, matchScore, details }) => ({
        name,
        category,
        school,
        reason,
        matchScore,
        details
      }));
  }, [emotionalContext]);

  // Enhanced follow-up recommendations with local fallback
  const getLocalFollowUpRecommendations = useCallback((followUpRequest, currentRecommendations, filteredClubs) => {
    if (!filteredClubs || filteredClubs.length === 0) {
      return [];
    }

    const followUpLower = followUpRequest.toLowerCase();
    
    // Determine follow-up intent
    let intentFilters = {};
    
    if (followUpLower.includes('business') || followUpLower.includes('leadership')) {
      intentFilters.category = 'Business';
      intentFilters.type = 'Leadership';
    } else if (followUpLower.includes('stem') || followUpLower.includes('science') || followUpLower.includes('technology')) {
      intentFilters.category = 'STEM';
    } else if (followUpLower.includes('competitive') || followUpLower.includes('competition')) {
      intentFilters.type = 'Competitive';
    } else if (followUpLower.includes('social') || followUpLower.includes('community')) {
      intentFilters.type = 'Social';
    } else if (followUpLower.includes('creative') || followUpLower.includes('art') || followUpLower.includes('music')) {
      intentFilters.category = 'Arts';
    } else if (followUpLower.includes('academic') || followUpLower.includes('study')) {
      intentFilters.category = 'Academic';
    } else if (followUpLower.includes('less time') || followUpLower.includes('low commitment')) {
      intentFilters.timeCommitment = 'Low';
    } else if (followUpLower.includes('more time') || followUpLower.includes('high commitment')) {
      intentFilters.timeCommitment = 'High';
    } else if (followUpLower.includes('different') || followUpLower.includes('other')) {
      // Exclude current recommendations
      const currentNames = currentRecommendations.map(r => r.name);
      intentFilters.exclude = currentNames;
    }

    // Filter clubs based on intent
    let filteredByIntent = filteredClubs;
    
    if (intentFilters.category) {
      filteredByIntent = filteredByIntent.filter(club => 
        club.category === intentFilters.category
      );
    }
    
    if (intentFilters.type) {
      filteredByIntent = filteredByIntent.filter(club => 
        club.type === intentFilters.type
      );
    }
    
    if (intentFilters.timeCommitment) {
      filteredByIntent = filteredByIntent.filter(club => 
        club.commitment?.toLowerCase().includes(intentFilters.timeCommitment.toLowerCase())
      );
    }
    
    if (intentFilters.exclude) {
      filteredByIntent = filteredByIntent.filter(club => 
        !intentFilters.exclude.includes(club.name)
      );
    }

    // If no clubs match the intent, return original recommendations
    if (filteredByIntent.length === 0) {
      return currentRecommendations;
    }

    // Use local scoring on filtered clubs with conversation context
    return getLocalRecommendations(conversationContext.originalAnswers, filteredByIntent, {
      ...conversationContext,
      userName,
      emotionalContext
    });
  }, [conversationContext, userName, emotionalContext, getLocalRecommendations]);

  // Get contextual follow-up suggestions based on intent
  const getContextualFollowUpSuggestions = useCallback((intentType) => {
    const suggestions = {
      business: "You can ask me for more business clubs, leadership opportunities, or competitive business activities. What interests you most?",
      stem: "I can suggest more STEM clubs, competitive science teams, or technology-focused activities. What would you like to explore?",
      competitive: "Would you like to see more competitive clubs, academic teams, or sports-related activities?",
      social: "I can show you more social clubs, cultural activities, or community service opportunities. What sounds appealing?",
      creative: "Would you like to explore more arts clubs, creative activities, or design-focused opportunities?",
      academic: "I can suggest more academic clubs, study groups, or learning-focused activities. What subjects interest you?",
      leadership: "Would you like to see more leadership opportunities, student government, or community service roles?",
      time_adjustment: "I can help you find clubs that better fit your schedule. Would you like to explore different time commitments or activity types?",
      different_clubs: "I can suggest clubs from different categories or with different focuses. What type of experience are you looking for?",
      friend_recommendation: "I'd be happy to suggest clubs for your friend! What are their interests and preferences?",
      general: "You can ask me to adjust recommendations based on different criteria, suggest clubs for friends, or ask about specific clubs. What would you like to know?"
    };

    return suggestions[intentType] || suggestions.general;
  }, []);

  // Extract user preferences from answers and requests
  const extractUserPreferences = (userAnswers, followUpRequest = '') => {
    const preferences = {};
    
    // Extract from user answers
    if (userAnswers.interests) {
      const interests = userAnswers.interests.toLowerCase();
      if (interests.includes('stem') || interests.includes('science') || interests.includes('technology')) {
        preferences.stem = true;
      }
      if (interests.includes('business') || interests.includes('leadership')) {
        preferences.business = true;
      }
      if (interests.includes('art') || interests.includes('creative') || interests.includes('music')) {
        preferences.creative = true;
      }
      if (interests.includes('sport') || interests.includes('athletic')) {
        preferences.sports = true;
      }
      if (interests.includes('academic') || interests.includes('study')) {
        preferences.academic = true;
      }
    }
    
    if (userAnswers.clubType) {
      preferences.clubType = userAnswers.clubType.toLowerCase();
    }
    
    if (userAnswers.timeCommitment) {
      preferences.timeCommitment = userAnswers.timeCommitment.toLowerCase();
    }
    
    // Extract from follow-up requests
    if (followUpRequest) {
      const request = followUpRequest.toLowerCase();
      if (request.includes('stem') || request.includes('science') || request.includes('technology')) {
        preferences.stem = true;
      }
      if (request.includes('business') || request.includes('leadership')) {
        preferences.business = true;
      }
      if (request.includes('competitive')) {
        preferences.competitive = true;
      }
      if (request.includes('social') || request.includes('community')) {
        preferences.social = true;
      }
      if (request.includes('creative') || request.includes('art')) {
        preferences.creative = true;
      }
      if (request.includes('academic')) {
        preferences.academic = true;
      }
    }
    
    return preferences;
  };

  // Initialize chat with enhanced conversation flow
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = getPersonalizedGreeting();
      setMessages([
        {
          id: 1,
          type: 'bot',
          text: greeting,
          timestamp: new Date()
        },
        {
          id: 2,
          type: 'bot',
          text: "What's your name? I'd love to personalize our conversation! 😊",
          timestamp: new Date(),
          isNameRequest: true
        }
      ]);
      setConversationFlow('name');
      setCurrentQuestion(0);
      setUserAnswers({});
      setRecommendations([]);
      setError(null);
      setConversationMode('questioning');
      setSelectedSchool(null);
      setConversationId(generateConversationId());
      setConversationContext({
        originalAnswers: {},
        followUpRequests: [],
        currentRecommendations: [],
        recommendationHistory: [],
        userPreferences: {},
        conversationTone: 'friendly',
        userEngagement: 0
      });
      setConversationAdaptation({
        skippedQuestions: [],
        backtrackingHistory: [],
        dynamicFollowUps: [],
        userEngagementLevel: 0,
        conversationPace: 'normal',
        proactiveSuggestions: []
      });
    }
  }, [isOpen]);

  // Filter clubs by selected school
  useEffect(() => {
    if (selectedSchool && allClubData) {
      const schoolData = allClubData.find(schoolData => schoolData.school === selectedSchool);
      if (schoolData && schoolData.clubs) {
        // Transform club data to AI-friendly format
        const transformedClubs = schoolData.clubs.map(club => ({
          name: club.name,
          category: club.category,
          school: selectedSchool,
          interests: extractInterestsFromClub(club),
          timeCommitment: mapCommitmentLevel(club.commitment),
          type: mapClubType(club.category),
          gradeLevels: ["9", "10", "11", "12"], // Default to all grades
          mentors: club.sponsor ? [club.sponsor] : [],
          description: club.description,
          activities: club.activities || [],
          benefits: club.benefits || []
        }));
        setFilteredClubs(transformedClubs);
      } else {
        setFilteredClubs([]);
      }
    }
  }, [selectedSchool, allClubData]);

  // Helper function to extract interests from club data
  const extractInterestsFromClub = (club) => {
    const interests = [];
    
    // Add category as primary interest
    if (club.category) {
      interests.push(club.category);
    }
    
    // Add activities as interests (limit to first 3)
    if (club.activities && Array.isArray(club.activities)) {
      interests.push(...club.activities.slice(0, 3));
    }
    
    // Add benefits as interests (limit to first 2)
    if (club.benefits && Array.isArray(club.benefits)) {
      interests.push(...club.benefits.slice(0, 2));
    }
    
    return interests.length > 0 ? interests : [club.category || 'General'];
  };

  // Helper function to map commitment level
  const mapCommitmentLevel = (commitment) => {
    if (!commitment) return 'Medium';
    
    const commitmentStr = commitment.toLowerCase();
    if (commitmentStr.includes('low')) return 'Low';
    if (commitmentStr.includes('high')) return 'High';
    return 'Medium';
  };

  // Helper function to map club type based on category
  const mapClubType = (category) => {
    const typeMap = {
      'Academic': 'Academic',
      'Arts': 'Creative',
      'STEM': 'Competitive',
      'Sports': 'Competitive',
      'Leadership': 'Leadership',
      'Cultural': 'Social',
      'Community Service': 'Social',
      'Religious': 'Social',
      'Support': 'Social',
      'Recreational': 'Social',
      'Business': 'Competitive',
      'Technology': 'Competitive'
    };
    return typeMap[category] || 'Social';
  };

  // Enhanced school selection with personality
  const handleSchoolSelection = useCallback(async (school) => {
    setSelectedSchool(school);
    setUserAnswers(prev => ({ ...prev, school }));
    setConversationFlow('questioning');
    
    // Filter clubs for the selected school
    const schoolClubs = allClubData.find(schoolData => schoolData.school === school);
    if (schoolClubs && schoolClubs.clubs) {
      setFilteredClubs(schoolClubs.clubs);
    } else {
      setFilteredClubs([]);
    }
    
    // Add school selection message
    const schoolMessage = {
      id: Date.now(),
      type: 'user',
      text: school,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, schoolMessage]);
    
    // Enhanced bot response with personality
    const typingDuration = showTypingIndicator(2000, 'excited');
    
    setTimeout(() => {
      const schoolResponses = [
        `🎉 Perfect! I found ${school}! I'm so excited to help you discover all the amazing clubs there, ${userName}!`,
        `✨ Awesome choice! ${school} has some fantastic clubs, and I can't wait to help you find the perfect ones, ${userName}!`,
        `🌟 Excellent! ${school} is a great school with so many opportunities. Let's find you some amazing clubs, ${userName}!`,
        `🚀 Fantastic! ${school} has some incredible clubs, and I'm thrilled to help you explore them, ${userName}!`
      ];
      
      const botResponse = {
        id: Date.now() + 0.5,
        type: 'bot',
        text: schoolResponses[Math.floor(Math.random() * schoolResponses.length)],
        timestamp: new Date(),
        personality: 'excited'
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Start with first question with enhanced timing
      setTimeout(() => {
        const firstQuestion = questions[0];
        const questionMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: firstQuestion.text,
          timestamp: new Date(),
          personality: 'curious'
        };
        setMessages(prev => [...prev, questionMessage]);
        setCurrentQuestion(0);
      }, 1500);
    }, typingDuration);
  }, [allClubData, questions, userName, showTypingIndicator]);

  // Enhanced message handling with personality, context awareness, and adaptive flow
  const handleSendMessage = useCallback(async (message) => {
    if (!message.trim()) return;

    // Detect sentiment and update emotional context
    const sentiment = detectSentiment(message);
    setLastUserSentiment(sentiment);

    // Update engagement level based on message length and sentiment
    const engagementBoost = message.length > 20 ? 0.1 : 0.05;
    const sentimentBoost = sentiment === 'excited' ? 0.15 : sentiment === 'positive' ? 0.1 : 0;
    
    setConversationAdaptation(prev => ({
      ...prev,
      userEngagementLevel: Math.min(prev.userEngagementLevel + engagementBoost + sentimentBoost, 1)
    }));

    // Add message animation
    const messageId = Date.now();
    setMessageAnimations(prev => ({ ...prev, [messageId]: 'slideIn' }));

    const newMessage = {
      id: messageId,
      type: 'user',
      text: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);

    // Save conversation memory periodically
    saveConversationMemory();

    // Handle different conversation flows with enhanced personality
    if (conversationFlow === 'name') {
      await handleNameInput(message);
      return;
    }

    if (conversationFlow === 'school') {
      await handleSchoolSelection(message);
      return;
    }

    // Enhanced off-topic handling with personality and redirection
    if (conversationMode === 'questioning' && isOffTopicQuestion(message)) {
      const offTopicResponse = handleOffTopicQuestion(message);
      const typingDuration = showTypingIndicator(2000, 'complex');
      
      setTimeout(() => {
        const responseMessage = {
          id: Date.now() + 0.5,
          type: 'bot',
          text: offTopicResponse,
          timestamp: new Date(),
          personality: 'humorous'
        };
        setMessages(prev => [...prev, responseMessage]);
        
        // Add friendly redirection back to the current question
        setTimeout(() => {
          const currentQuestionData = questions[currentQuestion];
          const redirectionMessage = {
            id: Date.now() + 1,
            type: 'bot',
            text: `Now, back to finding you the perfect clubs! ${currentQuestionData.text}`,
            timestamp: new Date(),
            personality: 'friendly'
          };
          setMessages(prev => [...prev, redirectionMessage]);
        }, 1500);
      }, typingDuration);
      return;
    }

    // Handle backtracking requests with enhanced detection
    if (message.toLowerCase().includes('change') || message.toLowerCase().includes('back') || 
        message.toLowerCase().includes('previous') || message.toLowerCase().includes('go back') ||
        message.toLowerCase().includes('redo') || message.toLowerCase().includes('different')) {
      await handleBacktracking(message);
      return;
    }

    // If we're still selecting school, handle school selection
    if (!selectedSchool) {
      await handleSchoolSelection(message);
      return;
    }

    // Store the answer with context
    const currentQuestionData = questions[currentQuestion];
    setUserAnswers(prev => ({ ...prev, [currentQuestionData.id]: message }));

    // Enhanced clarification with personality and context awareness
    if (needsClarification(currentQuestionData.id, message)) {
      const clarifyingQuestion = getClarifyingQuestion(currentQuestionData.id, message);
      const typingDuration = showTypingIndicator(1800, 'normal');
      
      setTimeout(() => {
        const clarificationMessage = {
          id: Date.now() + 0.5,
          type: 'bot',
          text: clarifyingQuestion,
          timestamp: new Date(),
          needsClarification: true,
          personality: 'helpful'
        };
        setMessages(prev => [...prev, clarificationMessage]);
      }, typingDuration);
      return;
    }

    // Add empathetic response with personality and context
    const empatheticResponse = getEmpatheticResponse(sentiment, { 
      userName, 
      emotionalContext, 
      conversationAdaptation 
    });
    if (empatheticResponse) {
      const responseMessage = {
        id: Date.now() + 0.5,
        type: 'bot',
        text: empatheticResponse,
        timestamp: new Date(),
        personality: sentiment === 'excited' ? 'excited' : sentiment === 'frustrated' ? 'supportive' : 'friendly'
      };
      setMessages(prev => [...prev, responseMessage]);
    }

    // Add casual small talk for high engagement
    const casualSmallTalk = getCasualSmallTalk({ emotionalContext, conversationAdaptation });
    if (casualSmallTalk && conversationAdaptation.userEngagementLevel > 0.6) {
      setTimeout(() => {
        const smallTalkMessage = {
          id: Date.now() + 0.7,
          type: 'bot',
          text: casualSmallTalk,
          timestamp: new Date(),
          personality: 'humorous'
        };
        setMessages(prev => [...prev, smallTalkMessage]);
      }, 800);
    }

    // Add follow-up question if available and user is engaged
    if (currentQuestionData.followUp && conversationAdaptation.userEngagementLevel > 0.3) {
      const followUpResponse = currentQuestionData.followUp(message);
      if (followUpResponse) {
        setTimeout(() => {
          const followUpMessage = {
            id: Date.now() + 1,
            type: 'bot',
            text: followUpResponse,
            timestamp: new Date(),
            personality: 'curious'
          };
          setMessages(prev => [...prev, followUpMessage]);
        }, 1200);
      }
    }

    // Add proactive suggestions based on user behavior
    const proactiveSuggestions = getProactiveSuggestions(userAnswers, emotionalContext);
    if (proactiveSuggestions.length > 0 && conversationAdaptation.userEngagementLevel > 0.5) {
      setTimeout(() => {
        const suggestionMessage = {
          id: Date.now() + 2,
          type: 'bot',
          text: proactiveSuggestions[0],
          timestamp: new Date(),
          personality: 'helpful'
        };
        setMessages(prev => [...prev, suggestionMessage]);
      }, 2000);
    }

    // Handle conversation progression with adaptive flow
    if (currentQuestion === questions.length - 1) {
      await getAIRecommendations();
    } else if (conversationMode === 'chat' && recommendations.length > 0) {
      await handleFollowUpQuestion(message);
    } else {
      // Check if we should skip the next question
      const nextQuestionIndex = currentQuestion + 1;
      const shouldSkip = shouldSkipQuestion(nextQuestionIndex, userAnswers, emotionalContext);
      
      if (shouldSkip && questions[nextQuestionIndex]?.canSkip) {
        // Skip to the next non-skippable question
        let skipToIndex = nextQuestionIndex + 1;
        while (skipToIndex < questions.length && 
               shouldSkipQuestion(skipToIndex, userAnswers, emotionalContext) && 
               questions[skipToIndex]?.canSkip) {
          skipToIndex++;
        }
        
        if (skipToIndex < questions.length) {
          setCurrentQuestion(skipToIndex);
          const skippedQuestion = questions[skipToIndex];
          const botMessage = {
            id: Date.now() + 1,
            type: 'bot',
            text: skippedQuestion.text,
            timestamp: new Date(),
            personality: 'friendly'
          };
          setMessages(prev => [...prev, botMessage]);
        } else {
          // If all remaining questions can be skipped, go to recommendations
          await getAIRecommendations();
        }
      } else {
        // Move to next question with enhanced timing
        const nextQuestionDelay = emotionalContext.excitement > 0.5 ? 800 : 1200;
        setTimeout(() => {
          const nextQuestion = questions[nextQuestionIndex];
          const botMessage = {
            id: Date.now() + 1,
            type: 'bot',
            text: nextQuestion.text,
            timestamp: new Date(),
            personality: 'enthusiastic'
          };
          setMessages(prev => [...prev, botMessage]);
          setCurrentQuestion(prev => prev + 1);
        }, nextQuestionDelay);
      }
    }
  }, [conversationFlow, conversationMode, currentQuestion, questions, selectedSchool, recommendations.length, emotionalContext, userName, detectSentiment, getEmpatheticResponse, showTypingIndicator, saveConversationMemory, conversationAdaptation, shouldSkipQuestion, getProactiveSuggestions]);

  // Enhanced backtracking functionality with adaptive flow
  const handleBacktracking = useCallback(async (message) => {
    const typingDuration = showTypingIndicator(2000, 'complex');
    
    // Update conversation adaptation
    setConversationAdaptation(prev => ({
      ...prev,
      backtrackingHistory: [...prev.backtrackingHistory, {
        questionIndex: currentQuestion,
        userRequest: message,
        timestamp: new Date()
      }]
    }));
    
    setTimeout(() => {
      const backtrackMessage = {
        id: Date.now(),
        type: 'bot',
        text: `Of course, ${userName}! I totally understand wanting to change something. Which question would you like to go back to? I can help you adjust your answers! 😊`,
        timestamp: new Date(),
        personality: 'helpful',
        showBacktrackOptions: true
      };
      setMessages(prev => [...prev, backtrackMessage]);
    }, typingDuration);
  }, [showTypingIndicator, currentQuestion, userName]);

  // Adaptive question skipping logic
  const shouldSkipQuestion = useCallback((questionIndex, userAnswers, emotionalContext) => {
    const question = questions[questionIndex];
    if (!question || !question.adaptiveLogic) return false;
    
    // Check if user is frustrated and question can be skipped
    if (emotionalContext?.frustration > 0.4 && question.canSkip) {
      return true;
    }
    
    // Check if user engagement is low and question is optional
    if (conversationAdaptation.userEngagementLevel < 0.3 && question.canSkip) {
      return true;
    }
    
    // Run question-specific adaptive logic
    return question.adaptiveLogic(userAnswers);
  }, [questions, conversationAdaptation.userEngagementLevel]);

  // Proactive follow-up suggestions based on user behavior
  const getProactiveSuggestions = useCallback((userAnswers, emotionalContext) => {
    const suggestions = [];
    
    // If user shows high engagement, suggest deeper exploration
    if (conversationAdaptation.userEngagementLevel > 0.7) {
      suggestions.push("I'm loving your enthusiasm! Would you like to explore more specific aspects of your interests?");
    }
    
    // If user seems rushed, offer shortcuts
    if (emotionalContext?.frustration > 0.3) {
      suggestions.push("I can help you find clubs quickly! Would you like me to focus on the most popular options?");
    }
    
    // If user mentions specific interests, suggest related areas
    if (userAnswers.interests) {
      const interests = userAnswers.interests.toLowerCase();
      if (interests.includes('stem')) {
        suggestions.push("Since you're interested in STEM, would you like to explore competitive science teams or technology clubs?");
      } else if (interests.includes('art')) {
        suggestions.push("For someone interested in art, I could also suggest creative writing clubs or design teams!");
      }
    }
    
    return suggestions;
  }, [conversationAdaptation.userEngagementLevel]);

  // Enhanced name input with personality
  const handleNameInput = useCallback(async (name) => {
    setUserName(name);
    setConversationFlow('school');
    
    // Update emotional context
    setEmotionalContext(prev => ({ ...prev, engagement: Math.min(prev.engagement + 0.2, 1) }));
    
    const typingDuration = showTypingIndicator(1800, 'normal');
    
    setTimeout(() => {
      const nameResponses = [
        `Nice to meet you, ${name}! 😊 I'm genuinely excited to help you discover some amazing clubs!`,
        `Hey ${name}! ✨ I love your name! I can't wait to help you find the perfect clubs for you!`,
        `Hi ${name}! 🌟 It's so great to meet you! I'm already getting excited about finding you some awesome opportunities!`,
        `Hello ${name}! 🚀 I'm thrilled to be your club discovery buddy! Let's find some amazing experiences together!`
      ];
      
      const nameResponse = {
        id: Date.now() + 0.5,
        type: 'bot',
        text: nameResponses[Math.floor(Math.random() * nameResponses.length)],
        timestamp: new Date(),
        personality: 'excited'
      };
      setMessages(prev => [...prev, nameResponse]);
      
      // Show school selection with personality
      setTimeout(() => {
        const schoolMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: `Now, ${name}, let's find your school! Which school do you attend? I want to make sure I show you all the amazing clubs available there! 🏫`,
          timestamp: new Date(),
          showSchoolSelection: true,
          personality: 'enthusiastic'
        };
        setMessages(prev => [...prev, schoolMessage]);
      }, 1200);
    }, typingDuration);
  }, [showTypingIndicator]);

  // Enhanced off-topic detection
  const isOffTopicQuestion = useCallback((message) => {
    const offTopicKeywords = ['weather', 'food', 'movie', 'music', 'game', 'sport', 'hobby', 'family', 'friend', 'pet', 'travel', 'vacation', 'joke', 'funny', 'lol', 'haha'];
    const messageLower = message.toLowerCase();
    return offTopicKeywords.some(keyword => messageLower.includes(keyword));
  }, []);

  // Enhanced off-topic handling with personality
  const handleOffTopicQuestion = useCallback((message) => {
    const offTopicResponses = [
      "That's an interesting question! While I'm focused on helping you find clubs, I'd be happy to chat about that briefly. But first, let's finish finding you some great clubs! 😊",
      "I love your curiosity! I'm here specifically to help with club recommendations, but I appreciate you sharing that with me. Shall we continue with finding your perfect clubs?",
      "That's a great point! I'm designed to help with club discovery, but I'm glad you're thinking broadly. Let's get back to finding some amazing clubs for you!",
      "Interesting! I'm here to help you find clubs, but I appreciate the conversation. Ready to discover some great opportunities?"
    ];
    
    return offTopicResponses[Math.floor(Math.random() * offTopicResponses.length)];
  }, []);

  // Enhanced clarifying questions with personality
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
      ]
    };
    
    const questionArray = clarifications[questionId] || ["Could you tell me a bit more about that?"];
    return questionArray[Math.floor(Math.random() * questionArray.length)];
  }, []);

  // Enhanced clarification detection
  const needsClarification = useCallback((questionId, answer) => {
    if (!answer || answer.length < 3) return true;
    
    const vagueAnswers = ['idk', 'not sure', 'maybe', 'i guess', 'whatever', 'dont know', "don't know"];
    if (vagueAnswers.some(vague => answer.toLowerCase().includes(vague))) return true;
    
    return false;
  }, []);

  // Enhanced follow-up question handler with local fallback
  const handleFollowUpQuestion = async (message) => {
    setIsLoading(true);
    setError(null);

    try {
      // Show "AI is thinking" message
      const thinkingMessage = {
        id: Date.now(),
        type: 'bot',
        text: "🤔 Let me analyze your request and update my recommendations...",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, thinkingMessage]);

      let newRecommendations = [];
      let source = 'ai';
      let followUpIntent = 'general';

      // Try backend API first
      try {
        const response = await fetch('http://localhost:5001/api/follow-up', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId: conversationId,
            followUp: message
          })
        });

        if (response.ok) {
          const data = await response.json();
          newRecommendations = data.recommendations;
          source = data.source || 'ai';
          followUpIntent = data.followUpIntent || 'general';
        } else {
          throw new Error('Backend API failed');
        }
      } catch (apiError) {
        console.log('Backend API failed, using local fallback:', apiError.message);
        // Fall back to local follow-up recommendations
        newRecommendations = getLocalFollowUpRecommendations(message, recommendations, filteredClubs);
        source = 'fallback';
        followUpIntent = 'general';
      }

      // Ensure we have recommendations
      if (!newRecommendations || newRecommendations.length === 0) {
        newRecommendations = getLocalFollowUpRecommendations(message, recommendations, filteredClubs);
        source = 'fallback';
      }

      // Extract and update user preferences from the follow-up request
      const newPreferences = extractUserPreferences(conversationContext.originalAnswers, message);
      const updatedPreferences = { ...conversationContext.userPreferences, ...newPreferences };

      // Remove thinking message and add updated recommendations
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
      
      const followUpMessage = {
        id: Date.now(),
        type: 'bot',
        text: `Based on your request "${message}", here are my updated recommendations:`,
        timestamp: new Date(),
        recommendations: newRecommendations,
        source: source === 'fallback' ? 'fallback' : 'ai-followup'
      };

      setMessages(prev => [...prev, followUpMessage]);
      setRecommendations(newRecommendations);
      
      // Update conversation context
      setConversationContext(prev => ({
        ...prev,
        currentRecommendations: newRecommendations,
        recommendationHistory: [...prev.recommendationHistory, ...newRecommendations.map(r => r.name)],
        userPreferences: updatedPreferences
      }));

      // Add follow-up assistance message
      setTimeout(() => {
        const assistanceMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: getContextualFollowUpSuggestions(followUpIntent),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistanceMessage]);
      }, 2000);

    } catch (error) {
      console.error('Follow-up Recommendation Error:', error);
      
      // Remove thinking message if it exists
      setMessages(prev => prev.filter(msg => msg.type !== 'bot' || !msg.text.includes('analyzing')));
      
      setError('Sorry, I encountered an error while updating your recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  // Generate conversational responses based on user answers
  const getConversationalResponse = (questionIndex, answer) => {
    const responses = {
      interests: [
        "That sounds fascinating! I love how diverse your interests are.",
        "Wow, those are some really cool interests! I can see you're passionate about learning.",
        "Excellent! Those interests will definitely help us find some great clubs for you."
      ],
      timeCommitment: [
        "Perfect! It's great that you're being realistic about your time commitment.",
        "That's a good balance! We'll make sure to find clubs that fit your schedule.",
        "Thanks for being honest about your availability. This will help us find the right fit."
      ],
      clubType: [
        "I love that you know what kind of experience you're looking for!",
        "That's exactly the kind of thinking that leads to great club experiences.",
        "Perfect! That type of club environment sounds like it would be a great match for you."
      ],
      skills: [
        "Those are really valuable skills to develop! You're thinking ahead.",
        "I can see you have clear goals for your personal growth. That's impressive!",
        "Those skills will definitely help you succeed in many different clubs."
      ],
      gradeLevel: [
        "Thanks for sharing that! Your grade level helps me recommend age-appropriate clubs.",
        "Perfect! I'll make sure to suggest clubs that are great for your grade level.",
        "That's helpful information! I'll tailor my recommendations accordingly."
      ],
      previousExperience: [
        "That's really valuable experience! It shows you know what you're looking for.",
        "Thanks for sharing your background! This will help me make better recommendations.",
        "Your past experiences will definitely help us find clubs that build on your strengths."
      ]
    };

    const questionResponses = responses[questions[questionIndex].id];
    if (questionResponses) {
      return questionResponses[Math.floor(Math.random() * questionResponses.length)];
    }
    return null;
  };

  // Enhanced AI recommendations with conversational presentation
  const getAIRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if we have clubs for the selected school
      if (filteredClubs.length === 0) {
        throw new Error(`No clubs found for ${selectedSchool}. Please try a different school or contact support.`);
      }

      // Enhanced "AI is thinking" message with personality
      const thinkingMessages = [
        `🤔 Let me analyze your preferences and find the perfect clubs for you at ${selectedSchool}...`,
        `✨ I'm excited to find some amazing clubs for you at ${selectedSchool}! Let me think about this...`,
        `🌟 Analyzing your interests and finding the best matches at ${selectedSchool}...`,
        `🚀 Crunching the data to find your perfect club matches at ${selectedSchool}...`
      ];
      
      const thinkingMessage = {
        id: Date.now(),
        type: 'bot',
        text: thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)],
        timestamp: new Date(),
        personality: 'excited'
      };
      setMessages(prev => [...prev, thinkingMessage]);

      // Extract user preferences from answers
      const userPreferences = extractUserPreferences(userAnswers);
      
      // Store original answers for context preservation
      setConversationContext(prev => ({
        ...prev,
        originalAnswers: { ...userAnswers, school: selectedSchool },
        userPreferences: userPreferences,
        lastRecommendationTime: new Date()
      }));

      let recommendations = [];
      let source = 'ai';

      // Try backend API first
      try {
        const response = await fetch('http://localhost:5001/api/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId: conversationId,
            school: selectedSchool,
            interests: [userAnswers.interests],
            timeCommitment: userAnswers.timeCommitment,
            type: userAnswers.clubType,
            skills: userAnswers.skills,
            grade: userAnswers.gradeLevel,
            priorExperience: userAnswers.previousExperience
          })
        });

        if (response.ok) {
          const data = await response.json();
          recommendations = data.recommendations;
          source = data.source || 'ai';
        } else {
          throw new Error('Backend API failed');
        }
      } catch (apiError) {
        console.log('Backend API failed, using local fallback:', apiError.message);
        // Fall back to local recommendations with conversation context
        recommendations = getLocalRecommendations(userAnswers, filteredClubs, {
          ...conversationContext,
          userName,
          emotionalContext
        });
        source = 'fallback';
      }

      // Ensure we have recommendations
      if (!recommendations || recommendations.length === 0) {
        recommendations = getLocalRecommendations(userAnswers, filteredClubs, {
          ...conversationContext,
          userName,
          emotionalContext
        });
        source = 'fallback';
      }

      // Remove thinking message and add recommendations
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
      
      // Enhanced recommendations presentation
      const recommendationIntros = [
        `🎉 Perfect! Based on everything you've told me, here are my top recommendations for clubs at ${selectedSchool}:`,
        `✨ I'm so excited to share these with you! Here are the clubs at ${selectedSchool} that I think would be perfect for you:`,
        `🌟 Amazing! I've found some incredible clubs at ${selectedSchool} that match your interests perfectly:`,
        `🚀 Fantastic! Here are my top picks for clubs at ${selectedSchool} based on what you're looking for:`
      ];
      
      const recommendationsMessage = {
        id: Date.now(),
        type: 'bot',
        text: recommendationIntros[Math.floor(Math.random() * recommendationIntros.length)],
        timestamp: new Date(),
        recommendations: recommendations,
        source: source,
        personality: 'excited'
      };

      setMessages(prev => [...prev, recommendationsMessage]);
      setRecommendations(recommendations);
      setConversationMode('chat');
      
      // Update conversation context with initial recommendations
      setConversationContext(prev => ({
        ...prev,
        currentRecommendations: recommendations,
        recommendationHistory: recommendations.map(r => r.name)
      }));

      // Enhanced follow-up message with personality
      setTimeout(() => {
        const followUpSuggestions = [
          "You can ask me to adjust these recommendations! For example:\n• \"Show me more business-related clubs\"\n• \"What about more STEM-focused options?\"\n• \"I prefer more competitive clubs\"\n• \"Can you suggest clubs for my friend who likes art?\"\n• \"Show me clubs with less time commitment\"\n\nWhat would you like to explore?",
          "I'm here to help you explore more options! You can ask me:\n• \"Show me more creative clubs\"\n• \"What about leadership opportunities?\"\n• \"I want something more social\"\n• \"Can you suggest clubs for my friend?\"\n• \"Show me clubs with different time commitments\"\n\nWhat sounds interesting to you?",
          "Want to explore more? You can ask me to:\n• \"Find more competitive clubs\"\n• \"Show me academic opportunities\"\n• \"I prefer relaxed clubs\"\n• \"Suggest clubs for my friend\"\n• \"Show me clubs with less commitment\"\n\nWhat would you like to discover?"
        ];
        
        const followUpMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: followUpSuggestions[Math.floor(Math.random() * followUpSuggestions.length)],
          timestamp: new Date(),
          personality: 'helpful'
        };
        setMessages(prev => [...prev, followUpMessage]);
      }, 2500);

    } catch (error) {
      console.error('Recommendation Error:', error);
      
      // Remove thinking message if it exists
      setMessages(prev => prev.filter(msg => msg.type !== 'bot' || !msg.text.includes('analyzing')));
      
      // Enhanced error handling with personality
      if (error.message.includes('No clubs found')) {
        setError(`I'm so sorry, ${userName}! I couldn't find any clubs for ${selectedSchool}. Let's try a different school or contact support for help.`);
      } else {
        setError(`Oops! I ran into a little hiccup while analyzing your preferences, ${userName}. Let's try again - sometimes these things happen! 😊`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filteredClubs, selectedSchool, userAnswers, conversationId, conversationContext, userName, emotionalContext, getLocalRecommendations]);

  // Enhanced form submission with validation
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const input = e.target.elements.messageInput;
    const message = input.value.trim();
    if (message) {
      handleSendMessage(message);
      input.value = '';
    }
  }, [handleSendMessage]);

  // Enhanced quick reply selection with animation
  const handleQuickReply = useCallback((reply) => {
    // Add animation to the selected reply
    setMessageAnimations(prev => ({ ...prev, [Date.now()]: 'quickReply' }));
    handleSendMessage(reply);
  }, [handleSendMessage]);

  // Enhanced reset chat with personality
  const resetChat = useCallback(() => {
    const resetMessage = {
      id: Date.now(),
      type: 'bot',
      text: `Thanks for chatting with me, ${userName}! I hope I helped you find some amazing clubs. Feel free to come back anytime for more recommendations! 😊`,
      timestamp: new Date(),
      personality: 'friendly'
    };
    
    setMessages([resetMessage]);
    setCurrentQuestion(0);
    setUserAnswers({});
    setRecommendations([]);
    setError(null);
    setConversationMode('questioning');
    setConversationFlow('greeting');
    setSelectedSchool(null);
    setFilteredClubs([]);
    setUserName('');
    setLastUserSentiment('neutral');
    setConversationHistory([]);
    setConversationId(generateConversationId());
    setEmotionalContext({
      mood: 'neutral',
      energy: 'medium',
      engagement: 0,
      frustration: 0,
      excitement: 0
    });
    setConversationContext({
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
    setShowMedia(false);
    setVoiceMode(false);
    setMessageAnimations({});
  }, [userName, generateConversationId]);

  return (
    <>
      {/* Enhanced Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-50 group"
          aria-label="Open AI Club Chatbot"
        >
          <MessageCircle size={24} className="group-hover:animate-pulse" />
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
        </button>
      )}

      {/* Enhanced Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col animate-slideIn">
          {/* Enhanced Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Bot size={20} className="animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold flex items-center">
                  {botPersonality.name} 
                  <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                    {botPersonality.tone}
                  </span>
                </h3>
                <p className="text-xs opacity-90">
                  {userName ? `${userName} • ${selectedSchool || 'Select Your School'}` : selectedSchool || 'Select Your School'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {voiceMode && (
                <button
                  onClick={() => setVoiceMode(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                  aria-label="Disable voice mode"
                >
                  <Mic size={16} className="animate-pulse" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Enhanced Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : `bg-white text-gray-800 border border-gray-200 ${
                          message.personality === 'excited' ? 'border-blue-300 bg-blue-50' :
                          message.personality === 'supportive' ? 'border-green-300 bg-green-50' :
                          message.personality === 'humorous' ? 'border-purple-300 bg-purple-50' :
                          message.personality === 'helpful' ? 'border-yellow-300 bg-yellow-50' :
                          'border-gray-200'
                        }`
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && (
                      <div className="relative">
                        <Bot size={16} className={`mt-1 flex-shrink-0 ${
                          message.personality === 'excited' ? 'text-blue-600 animate-bounce' :
                          message.personality === 'supportive' ? 'text-green-600' :
                          message.personality === 'humorous' ? 'text-purple-600' :
                          message.personality === 'helpful' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        {message.personality && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    )}
                    {message.type === 'user' && (
                      <User size={16} className="mt-1 text-white flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                      
                      {/* Enhanced School Selection */}
                      {message.showSchoolSelection && availableSchools.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-gray-600 mb-2 flex items-center">
                            <School size={12} className="mr-1" />
                            Select your school:
                          </p>
                          {availableSchools.map((school) => (
                            <button
                              key={school}
                              onClick={() => handleSchoolSelection(school)}
                              className="block w-full text-left px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200 rounded-lg text-sm text-blue-800 transition-all duration-200 hover:shadow-sm"
                            >
                              {school}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Enhanced Quick Reply Buttons */}
                      {conversationMode === 'questioning' && currentQuestion < questions.length && questions[currentQuestion]?.quickReplies && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 mb-2 flex items-center">
                            <Sparkles size={12} className="mr-1" />
                            Quick options:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {questions[currentQuestion].quickReplies.map((reply, index) => (
                              <button
                                key={index}
                                onClick={() => handleQuickReply(reply)}
                                className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-blue-800 text-xs rounded-full transition-all duration-200 hover:shadow-sm"
                              >
                                {reply}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Enhanced Recommendations Display */}
                      {message.recommendations && (
                        <div className="mt-4 space-y-3">
                          {message.recommendations.map((rec, index) => (
                            <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-semibold text-blue-800 text-sm">{rec.name}</h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      rec.matchScore === 'High' ? 'bg-green-100 text-green-800' :
                                      rec.matchScore === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {rec.matchScore} Match
                                    </span>
                                  </div>
                                  <p className="text-xs text-blue-700 mt-1 flex items-center">
                                    <Star size={10} className="mr-1" />
                                    {rec.category}
                                  </p>
                                  <p className="text-xs text-blue-600 mt-2 leading-relaxed">{rec.reason}</p>
                                  
                                  {/* Progressive Disclosure for Club Details */}
                                  {rec.details && (
                                    <div className="mt-3 pt-2 border-t border-blue-200">
                                      <button
                                        onClick={() => setShowMedia(!showMedia)}
                                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                                      >
                                        {showMedia ? 'Hide' : 'Show'} details
                                      </button>
                                      {showMedia && (
                                        <div className="mt-2 space-y-1">
                                          {rec.details.activities?.length > 0 && (
                                            <p className="text-xs text-gray-600">
                                              <span className="font-medium">Activities:</span> {rec.details.activities.join(', ')}
                                            </p>
                                          )}
                                          {rec.details.benefits?.length > 0 && (
                                            <p className="text-xs text-gray-600">
                                              <span className="font-medium">Benefits:</span> {rec.details.benefits.join(', ')}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Enhanced Source Indicator */}
                          {message.source && (
                            <div className="mt-2 text-xs text-gray-500 italic flex items-center">
                              <TrendingUp size={10} className="mr-1" />
                              {message.source === 'fallback' 
                                ? "Using my local knowledge (AI temporarily unavailable)"
                                : message.source === 'ai-followup'
                                ? "Powered by AI analysis"
                                : "Powered by AI recommendations"
                              }
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Backtracking Options */}
                      {message.showBacktrackOptions && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 mb-2">Which question would you like to change?</p>
                          <div className="flex flex-wrap gap-2">
                            {questions.map((q, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentQuestion(index)}
                                className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs rounded-full transition-colors"
                              >
                                {q.id}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Enhanced Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white text-gray-800 border border-gray-200 p-3 rounded-lg max-w-[85%] shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Bot size={16} className="text-blue-600 animate-pulse" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {typingSpeed === 'fast' ? 'thinking...' : 
                       typingSpeed === 'slow' ? 'analyzing...' : 
                       typingSpeed === 'complex' ? 'processing...' : 'typing...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Enhanced Error Handling */}
            {error && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800 p-3 rounded-lg max-w-[85%]">
                  <p className="text-sm">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Got it, let's continue
                  </button>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Form */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  name="messageInput"
                  placeholder={
                    conversationFlow === 'name'
                      ? "What's your name?"
                      : conversationFlow === 'school'
                      ? "Type your school name or select from the list above..."
                      : conversationMode === 'questioning' && currentQuestion < questions.length 
                      ? questions[currentQuestion].placeholder 
                      : "Ask me to adjust recommendations or explore different clubs..."
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={isLoading}
                />
                {voiceMode && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                  >
                    <Mic size={16} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <Send size={16} />
              </button>
            </form>
            
            {/* Enhanced Action Buttons */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => setVoiceMode(!voiceMode)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    voiceMode 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  <Mic size={12} className="inline mr-1" />
                  Voice
                </button>
                <button
                  onClick={() => setShowMedia(!showMedia)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    showMedia 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'text-gray-500 hover:text-purple-600'
                  }`}
                >
                  <Image size={12} className="inline mr-1" />
                  Media
                </button>
              </div>
              
              {recommendations.length > 0 && (
                <button
                  onClick={resetChat}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Start New Conversation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default AIClubChatbot;
