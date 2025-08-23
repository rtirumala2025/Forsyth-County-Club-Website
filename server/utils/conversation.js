/**
 * Enhanced conversation utilities for dynamic reasoning and adaptive flow
 */

/**
 * Extract conversational context from user interaction data
 */
export function extractConversationalContext(context = {}) {
  const {
    userName,
    emotionalContext = {},
    userPreferences = {},
    conversationHistory = [],
    lastRecommendations = [],
    backtrackingHistory = [],
    userEngagement = 0,
    conversationTone = 'friendly'
  } = context;

  return {
    userName,
    emotionalContext: {
      mood: emotionalContext.mood || 'neutral',
      energy: emotionalContext.energy || 'medium',
      engagement: emotionalContext.engagement || 0,
      excitement: emotionalContext.excitement || 0,
      frustration: emotionalContext.frustration || 0
    },
    userPreferences,
    conversationHistory,
    lastRecommendations,
    backtrackingHistory,
    userEngagement,
    conversationTone,
    // Derived context
    isFirstTimeUser: conversationHistory.length === 0,
    hasBacktracked: backtrackingHistory.length > 0,
    engagementLevel: getUserEngagementLevel(userEngagement),
    preferredInteractionStyle: getPreferredInteractionStyle(context)
  };
}

/**
 * Generate personality-aware system prompt
 */
export function generatePersonalityPrompt(conversationContext) {
  const {
    userName,
    emotionalContext,
    userEngagement,
    conversationTone,
    isFirstTimeUser,
    hasBacktracked
  } = conversationContext;

  const basePersonality = {
    name: "Alex",
    role: "high-school club advisor",
    coreTraits: ["enthusiastic", "supportive", "knowledgeable", "friendly"],
    communicationStyle: "conversational and engaging"
  };

  // Adapt personality based on context
  let personalityAdaptations = [];
  
  if (emotionalContext.excitement > 0.5) {
    personalityAdaptations.push("Match the user's excitement with enthusiastic responses");
  }
  
  if (emotionalContext.frustration > 0.3) {
    personalityAdaptations.push("Be extra supportive and understanding");
  }
  
  if (isFirstTimeUser) {
    personalityAdaptations.push("Be welcoming and guide them through the process");
  }
  
  if (hasBacktracked) {
    personalityAdaptations.push("Be patient and helpful with changes");
  }
  
  if (userEngagement < 0.3) {
    personalityAdaptations.push("Use shorter, more direct responses");
  } else if (userEngagement > 0.7) {
    personalityAdaptations.push("Provide more detailed and engaging explanations");
  }

  return `You are ${basePersonality.name}, a ${basePersonality.role}. You are ${basePersonality.coreTraits.join(', ')} and communicate in a ${basePersonality.communicationStyle} manner.

PERSONALITY ADAPTATIONS:
${personalityAdaptations.join('\n')}

CONVERSATION GUIDELINES:
1. Use the student's name (${userName || 'their name'}) when appropriate
2. Adapt your tone to match their emotional state (${emotionalContext.mood})
3. Provide progressive disclosure - essential info first, details on request
4. Make explanations conversational and engaging
5. Include personality-driven reactions and encouragement
6. Handle off-topic questions with friendly redirection
7. Provide contextual follow-up suggestions
8. Learn from the conversation to improve future interactions

RESPONSE REQUIREMENTS:
- Be conversational and friendly
- Include appropriate emojis and personality
- Provide detailed, personalized reasoning
- Suggest relevant follow-up questions
- Adapt length and detail based on engagement level
- Include progressive disclosure elements
- Maintain consistency with previous responses

Remember: You're helping students discover amazing club opportunities while building a genuine connection!`;
}

/**
 * Get user engagement level from engagement score
 */
function getUserEngagementLevel(engagement) {
  if (engagement >= 0.7) return 'high';
  if (engagement >= 0.4) return 'medium';
  return 'low';
}

/**
 * Determine preferred interaction style based on context
 */
function getPreferredInteractionStyle(context) {
  const { emotionalContext, userEngagement, conversationHistory } = context;
  
  if (emotionalContext.frustration > 0.3) return 'supportive';
  if (emotionalContext.excitement > 0.5) return 'enthusiastic';
  if (userEngagement < 0.3) return 'directive';
  if (conversationHistory.length > 5) return 'collaborative';
  
  return 'suggestive';
}

/**
 * Analyze conversation flow for adaptive responses
 */
export function analyzeConversationFlow(messages, userAnswers) {
  const analysis = {
    flowType: 'linear',
    engagementTrend: 'stable',
    topicFocus: 'on-topic',
    responsePatterns: [],
    suggestedAdaptations: []
  };

  if (!messages || messages.length === 0) {
    return analysis;
  }

  // Analyze message patterns
  const userMessages = messages.filter(m => m.type === 'user');
  const botMessages = messages.filter(m => m.type === 'bot');
  
  // Detect flow type
  if (userMessages.length > 5) {
    analysis.flowType = 'conversational';
  }
  
  // Analyze engagement trend
  const recentMessages = messages.slice(-5);
  const recentUserMessages = recentMessages.filter(m => m.type === 'user');
  
  if (recentUserMessages.length >= 3) {
    analysis.engagementTrend = 'increasing';
  } else if (recentUserMessages.length <= 1) {
    analysis.engagementTrend = 'decreasing';
  }
  
  // Detect topic focus
  const offTopicKeywords = ['weather', 'food', 'movie', 'music', 'game', 'hobby', 'family', 'friend'];
  const hasOffTopic = userMessages.some(msg => 
    offTopicKeywords.some(keyword => msg.text.toLowerCase().includes(keyword))
  );
  
  if (hasOffTopic) {
    analysis.topicFocus = 'mixed';
  }
  
  // Analyze response patterns
  analysis.responsePatterns = analyzeResponsePatterns(userMessages);
  
  // Generate suggested adaptations
  analysis.suggestedAdaptations = generateFlowAdaptations(analysis, userAnswers);
  
  return analysis;
}

/**
 * Analyze user response patterns
 */
function analyzeResponsePatterns(userMessages) {
  const patterns = [];
  
  // Check for short responses
  const shortResponses = userMessages.filter(msg => msg.text.length < 10);
  if (shortResponses.length > userMessages.length * 0.5) {
    patterns.push('brief_responses');
  }
  
  // Check for questions
  const questions = userMessages.filter(msg => msg.text.includes('?'));
  if (questions.length > 0) {
    patterns.push('inquisitive');
  }
  
  // Check for clarification requests
  const clarificationRequests = userMessages.filter(msg => 
    msg.text.toLowerCase().includes('what') || 
    msg.text.toLowerCase().includes('how') ||
    msg.text.toLowerCase().includes('explain')
  );
  if (clarificationRequests.length > 0) {
    patterns.push('seeks_clarification');
  }
  
  return patterns;
}

/**
 * Generate flow adaptations based on analysis
 */
function generateFlowAdaptations(analysis, userAnswers) {
  const adaptations = [];
  
  if (analysis.flowType === 'conversational') {
    adaptations.push('use_more_casual_tone');
  }
  
  if (analysis.engagementTrend === 'decreasing') {
    adaptations.push('increase_interactivity');
    adaptations.push('use_shorter_responses');
  }
  
  if (analysis.engagementTrend === 'increasing') {
    adaptations.push('provide_more_details');
    adaptations.push('suggest_follow_ups');
  }
  
  if (analysis.topicFocus === 'mixed') {
    adaptations.push('gentle_redirection');
  }
  
  if (analysis.responsePatterns.includes('brief_responses')) {
    adaptations.push('use_quick_replies');
    adaptations.push('simplify_language');
  }
  
  if (analysis.responsePatterns.includes('inquisitive')) {
    adaptations.push('anticipate_questions');
    adaptations.push('provide_comprehensive_info');
  }
  
  return adaptations;
}

/**
 * Generate contextual follow-up suggestions
 */
export function generateContextualFollowUps(currentRecommendations, conversationContext) {
  const { userPreferences, emotionalContext, userEngagement } = conversationContext;
  
  const baseSuggestions = [
    "Show me more clubs in different categories",
    "What about clubs with different time commitments?",
    "Can you suggest clubs for my friend?",
    "Tell me more about the clubs you recommended"
  ];
  
  const contextualSuggestions = [];
  
  // Add preference-based suggestions
  if (userPreferences.stem) {
    contextualSuggestions.push("Show me more STEM clubs");
  }
  
  if (userPreferences.business) {
    contextualSuggestions.push("What about more business opportunities?");
  }
  
  if (userPreferences.competitive) {
    contextualSuggestions.push("Show me more competitive clubs");
  }
  
  if (userPreferences.social) {
    contextualSuggestions.push("What about more social activities?");
  }
  
  // Add engagement-based suggestions
  if (userEngagement > 0.7) {
    contextualSuggestions.push("Can you help me compare these clubs?");
    contextualSuggestions.push("What should I consider when choosing between these?");
  }
  
  if (userEngagement < 0.3) {
    contextualSuggestions.push("Show me simpler options");
    contextualSuggestions.push("What's the easiest club to join?");
  }
  
  // Add emotional context suggestions
  if (emotionalContext.excitement > 0.5) {
    contextualSuggestions.push("I'm excited about these! What's next?");
  }
  
  if (emotionalContext.frustration > 0.3) {
    contextualSuggestions.push("Can you suggest something different?");
    contextualSuggestions.push("What about clubs that are easier to get into?");
  }
  
  // Combine and return
  return [...contextualSuggestions, ...baseSuggestions].slice(0, 5);
}

/**
 * Detect conversation intent for adaptive responses
 */
export function detectConversationIntent(message, conversationContext) {
  const text = message.toLowerCase();
  
  const intents = {
    clarification: ['what', 'how', 'explain', 'tell me more', 'i dont understand'],
    comparison: ['compare', 'difference', 'better', 'which one', 'vs'],
    exploration: ['more', 'other', 'different', 'show me', 'what else'],
    decision: ['choose', 'pick', 'decide', 'which should i', 'recommend'],
    frustration: ['confused', 'frustrated', 'not sure', 'dont know', 'help'],
    excitement: ['wow', 'amazing', 'love', 'perfect', 'exactly', 'yes'],
    offTopic: ['weather', 'food', 'movie', 'music', 'game', 'hobby'],
    backtracking: ['change', 'back', 'previous', 'different answer', 'redo']
  };
  
  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return intent;
    }
  }
  
  return 'general';
}

/**
 * Generate adaptive response based on intent and context
 */
export function generateAdaptiveResponse(intent, conversationContext) {
  const { userName, emotionalContext, userEngagement } = conversationContext;
  
  const responseTemplates = {
    clarification: {
      high: `I'd be happy to explain that in more detail, ${userName}! Let me break it down for you...`,
      medium: `Sure! Let me clarify that for you...`,
      low: `Here's what that means...`
    },
    comparison: {
      high: `Great question, ${userName}! Let me help you compare these options...`,
      medium: `Let me break down the differences for you...`,
      low: `Here are the key differences...`
    },
    exploration: {
      high: `Absolutely! I'm excited to show you more options, ${userName}!`,
      medium: `Sure! Let me find some more clubs for you...`,
      low: `Here are some other options...`
    },
    decision: {
      high: `I'm here to help you make the best choice, ${userName}! Let me guide you through this...`,
      medium: `Let me help you decide based on what you've told me...`,
      low: `Here's what I'd recommend...`
    },
    frustration: {
      high: `I totally understand how you're feeling, ${userName}. Let's work through this together!`,
      medium: `No worries! Let me help you figure this out...`,
      low: `Let me help...`
    },
    excitement: {
      high: `I love your enthusiasm, ${userName}! This is going to be amazing!`,
      medium: `That's great! I'm excited for you too!`,
      low: `That's wonderful!`
    },
    offTopic: {
      high: `That's interesting, ${userName}! While I'm focused on helping you find clubs, I'd be happy to chat briefly. Shall we get back to finding you some amazing opportunities?`,
      medium: `I love your curiosity! I'm here to help with clubs, but I appreciate you sharing that. Ready to continue with club discovery?`,
      low: `That's interesting! I'm here to help with clubs. Shall we continue?`
    },
    backtracking: {
      high: `Of course, ${userName}! I totally understand wanting to change something. Which question would you like to go back to?`,
      medium: `No problem! Which answer would you like to change?`,
      low: `Sure! What would you like to change?`
    }
  };
  
  const template = responseTemplates[intent] || responseTemplates.general;
  const engagementLevel = userEngagement > 0.7 ? 'high' : userEngagement > 0.3 ? 'medium' : 'low';
  
  return template[engagementLevel] || template.medium;
}

/**
 * Update emotional context based on user interaction
 */
export function updateEmotionalContext(currentContext, message, intent) {
  const newContext = { ...currentContext };
  
  // Update based on intent
  switch (intent) {
    case 'excitement':
      newContext.excitement = Math.min(currentContext.excitement + 0.2, 1);
      newContext.mood = 'positive';
      break;
    case 'frustration':
      newContext.frustration = Math.min(currentContext.frustration + 0.2, 1);
      newContext.mood = 'negative';
      break;
    case 'clarification':
      newContext.engagement = Math.min(currentContext.engagement + 0.1, 1);
      break;
    case 'exploration':
      newContext.engagement = Math.min(currentContext.engagement + 0.15, 1);
      break;
  }
  
  // Decay emotions over time
  newContext.excitement = Math.max(newContext.excitement - 0.05, 0);
  newContext.frustration = Math.max(newContext.frustration - 0.05, 0);
  
  return newContext;
}

/**
 * Generate personality-driven reactions
 */
export function generatePersonalityReaction(type, conversationContext) {
  const { userName, emotionalContext } = conversationContext;
  
  const reactions = {
    achievement: [
      `🎉 YES! That's exactly the kind of thinking that leads to amazing club experiences, ${userName}!`,
      `🌟 Fantastic! I can already see you thriving in the right environment, ${userName}!`,
      `✨ Perfect! You're really getting the hang of this - I'm impressed, ${userName}!`
    ],
    milestone: [
      `🚀 Amazing! That's the kind of clarity that makes all the difference, ${userName}!`,
      `💫 Wow! You're really thinking this through - that's fantastic, ${userName}!`,
      `⭐ Excellent! I can tell you're going to make great choices, ${userName}!`
    ],
    encouragement: [
      `That's the spirit, ${userName}! I love your enthusiasm! 😊`,
      `You're absolutely crushing this, ${userName}! Keep that energy up! ✨`,
      `I can feel your excitement, ${userName}, and it's totally contagious! 🎉`
    ],
    empathy: [
      `I totally get where you're coming from, ${userName}! Let's figure this out together. 🤗`,
      `No worries at all, ${userName}! We're in this together, and I've got your back! 💪`,
      `I hear you, ${userName}, and I'm here to make this as smooth as possible for you! 😌`
    ]
  };
  
  const reactionArray = reactions[type] || reactions.encouragement;
  return reactionArray[Math.floor(Math.random() * reactionArray.length)];
}
