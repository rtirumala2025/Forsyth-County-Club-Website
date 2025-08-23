/**
 * Enhanced request and response validation schemas for conversational features
 */

export function validateRecommendationRequest(body) {
  const errors = [];
  
  // Required fields
  if (!body.conversationId) {
    errors.push("conversationId is required");
  }
  
  if (!body.school) {
    errors.push("school is required");
  }
  
  if (!body.interests || !Array.isArray(body.interests) || body.interests.length === 0) {
    errors.push("at least one interest is required");
  }
  
  if (!body.timeCommitment) {
    errors.push("timeCommitment is required");
  }
  
  if (!body.type) {
    errors.push("club type is required");
  }
  
  if (!body.grade) {
    errors.push("grade level is required");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateAIResponse(response) {
  try {
    // Check if response is valid JSON
    if (typeof response !== 'object' || response === null) {
      return { isValid: false, error: "Response is not a valid object" };
    }
    
    // Check if recommendations array exists
    if (!response.recommendations || !Array.isArray(response.recommendations)) {
      return { isValid: false, error: "Missing or invalid recommendations array" };
    }
    
    // Validate each recommendation with enhanced fields
    for (let i = 0; i < response.recommendations.length; i++) {
      const rec = response.recommendations[i];
      
      if (!rec.name || typeof rec.name !== 'string') {
        return { isValid: false, error: `Recommendation ${i} missing or invalid name` };
      }
      
      if (!rec.category || typeof rec.category !== 'string') {
        return { isValid: false, error: `Recommendation ${i} missing or invalid category` };
      }
      
      if (!rec.school || typeof rec.school !== 'string') {
        return { isValid: false, error: `Recommendation ${i} missing or invalid school` };
      }
      
      if (!rec.reason || typeof rec.reason !== 'string') {
        return { isValid: false, error: `Recommendation ${i} missing or invalid reason` };
      }
      
      if (!rec.matchScore || !['High', 'Medium', 'Low'].includes(rec.matchScore)) {
        return { isValid: false, error: `Recommendation ${i} missing or invalid matchScore` };
      }
      
      // Validate enhanced fields if present
      if (rec.progressiveDetails) {
        if (typeof rec.progressiveDetails !== 'object') {
          return { isValid: false, error: `Recommendation ${i} progressiveDetails must be an object` };
        }
        
        if (rec.progressiveDetails.essential && typeof rec.progressiveDetails.essential !== 'string') {
          return { isValid: false, error: `Recommendation ${i} progressiveDetails.essential must be a string` };
        }
        
        if (rec.progressiveDetails.expanded && typeof rec.progressiveDetails.expanded !== 'string') {
          return { isValid: false, error: `Recommendation ${i} progressiveDetails.expanded must be a string` };
        }
        
        if (rec.progressiveDetails.personalized && typeof rec.progressiveDetails.personalized !== 'string') {
          return { isValid: false, error: `Recommendation ${i} progressiveDetails.personalized must be a string` };
        }
      }
      
      if (rec.engagementLevel && !['high', 'medium', 'low'].includes(rec.engagementLevel)) {
        return { isValid: false, error: `Recommendation ${i} engagementLevel must be high, medium, or low` };
      }
      
      if (rec.suggestedFollowUp && typeof rec.suggestedFollowUp !== 'string') {
        return { isValid: false, error: `Recommendation ${i} suggestedFollowUp must be a string` };
      }
    }
    
    // Validate conversation insights if present
    if (response.conversationInsights) {
      if (typeof response.conversationInsights !== 'object') {
        return { isValid: false, error: "conversationInsights must be an object" };
      }
      
      if (response.conversationInsights.engagementPatterns && 
          !['high', 'medium', 'low'].includes(response.conversationInsights.engagementPatterns)) {
        return { isValid: false, error: "conversationInsights.engagementPatterns must be high, medium, or low" };
      }
      
      if (response.conversationInsights.preferredTone && 
          !['excited', 'supportive', 'encouraging', 'casual'].includes(response.conversationInsights.preferredTone)) {
        return { isValid: false, error: "conversationInsights.preferredTone must be excited, supportive, encouraging, or casual" };
      }
    }
    
    // Validate follow-up suggestions if present
    if (response.followUpSuggestions) {
      if (!Array.isArray(response.followUpSuggestions)) {
        return { isValid: false, error: "followUpSuggestions must be an array" };
      }
      
      for (let i = 0; i < response.followUpSuggestions.length; i++) {
        if (typeof response.followUpSuggestions[i] !== 'string') {
          return { isValid: false, error: `followUpSuggestions[${i}] must be a string` };
        }
      }
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: "Response validation failed: " + error.message };
  }
}

export function sanitizeRecommendations(recommendations, maxCount = 7) {
  if (!Array.isArray(recommendations)) {
    return [];
  }
  
  return recommendations
    .filter(rec => rec && typeof rec === 'object')
    .map(rec => ({
      name: rec.name || rec.clubName || "Unknown Club",
      category: rec.category || "General",
      school: rec.school || "Unknown School",
      reason: rec.reason || "Good match for your interests",
      matchScore: ['High', 'Medium', 'Low'].includes(rec.matchScore) ? rec.matchScore : 'Medium',
      // Enhanced fields with defaults
      progressiveDetails: rec.progressiveDetails || {
        essential: rec.reason || "Good match for your interests",
        expanded: rec.reason || "Good match for your interests",
        personalized: "This club seems like a great fit for you!"
      },
      engagementLevel: ['high', 'medium', 'low'].includes(rec.engagementLevel) ? rec.engagementLevel : 'medium',
      suggestedFollowUp: rec.suggestedFollowUp || "Tell me more about this club"
    }))
    .slice(0, maxCount);
}

/**
 * Validate conversation context for enhanced features
 */
export function validateConversationContext(context) {
  const errors = [];
  
  if (context.emotionalContext) {
    const emotions = context.emotionalContext;
    
    if (emotions.mood && !['positive', 'negative', 'neutral'].includes(emotions.mood)) {
      errors.push("emotionalContext.mood must be positive, negative, or neutral");
    }
    
    if (emotions.energy && !['low', 'medium', 'high'].includes(emotions.energy)) {
      errors.push("emotionalContext.energy must be low, medium, or high");
    }
    
    if (emotions.engagement !== undefined && (emotions.engagement < 0 || emotions.engagement > 1)) {
      errors.push("emotionalContext.engagement must be between 0 and 1");
    }
    
    if (emotions.excitement !== undefined && (emotions.excitement < 0 || emotions.excitement > 1)) {
      errors.push("emotionalContext.excitement must be between 0 and 1");
    }
    
    if (emotions.frustration !== undefined && (emotions.frustration < 0 || emotions.frustration > 1)) {
      errors.push("emotionalContext.frustration must be between 0 and 1");
    }
  }
  
  if (context.userEngagement !== undefined && (context.userEngagement < 0 || context.userEngagement > 1)) {
    errors.push("userEngagement must be between 0 and 1");
  }
  
  if (context.conversationTone && !['friendly', 'formal', 'casual', 'enthusiastic', 'supportive'].includes(context.conversationTone)) {
    errors.push("conversationTone must be friendly, formal, casual, enthusiastic, or supportive");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize conversation context for safe storage and transmission
 */
export function sanitizeConversationContext(context) {
  if (!context || typeof context !== 'object') {
    return {
      userName: '',
      emotionalContext: {
        mood: 'neutral',
        energy: 'medium',
        engagement: 0,
        excitement: 0,
        frustration: 0
      },
      userPreferences: {},
      conversationHistory: [],
      lastRecommendations: [],
      backtrackingHistory: [],
      userEngagement: 0,
      conversationTone: 'friendly'
    };
  }
  
  return {
    userName: context.userName || '',
    emotionalContext: {
      mood: ['positive', 'negative', 'neutral'].includes(context.emotionalContext?.mood) 
        ? context.emotionalContext.mood : 'neutral',
      energy: ['low', 'medium', 'high'].includes(context.emotionalContext?.energy) 
        ? context.emotionalContext.energy : 'medium',
      engagement: Math.max(0, Math.min(1, context.emotionalContext?.engagement || 0)),
      excitement: Math.max(0, Math.min(1, context.emotionalContext?.excitement || 0)),
      frustration: Math.max(0, Math.min(1, context.emotionalContext?.frustration || 0))
    },
    userPreferences: context.userPreferences || {},
    conversationHistory: Array.isArray(context.conversationHistory) ? context.conversationHistory : [],
    lastRecommendations: Array.isArray(context.lastRecommendations) ? context.lastRecommendations : [],
    backtrackingHistory: Array.isArray(context.backtrackingHistory) ? context.backtrackingHistory : [],
    userEngagement: Math.max(0, Math.min(1, context.userEngagement || 0)),
    conversationTone: ['friendly', 'formal', 'casual', 'enthusiastic', 'supportive'].includes(context.conversationTone) 
      ? context.conversationTone : 'friendly'
  };
}

/**
 * Validate follow-up request
 */
export function validateFollowUpRequest(body) {
  const errors = [];
  
  if (!body.conversationId) {
    errors.push("conversationId is required");
  }
  
  if (!body.followUp || typeof body.followUp !== 'string') {
    errors.push("followUp is required and must be a string");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate club comparison request
 */
export function validateComparisonRequest(body) {
  const errors = [];
  
  if (!body.clubs || !Array.isArray(body.clubs) || body.clubs.length < 2) {
    errors.push("at least 2 clubs are required for comparison");
  }
  
  if (!body.user || typeof body.user !== 'object') {
    errors.push("user profile is required");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
