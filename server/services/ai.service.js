import OpenAI from "openai";
import { validateAIResponse, sanitizeRecommendations } from "../utils/schema.js";
import { extractConversationalContext, generatePersonalityPrompt } from "../utils/conversation.js";

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
  });
}

/**
 * Enhanced AI recommendations with dynamic reasoning and conversational flow
 */
export async function getAIRecommendations({ user, clubs, context, isFollowUp = false }) {
  try {
    // Extract conversational context for enhanced reasoning
    const conversationContext = extractConversationalContext(context);
    
    // Generate personality-aware system prompt
    const systemPrompt = generatePersonalityPrompt(conversationContext);
    
    // Create enhanced user prompt with conversational context
    const userPrompt = isFollowUp ? 
      createEnhancedFollowUpPrompt(user, clubs, conversationContext) : 
      createEnhancedInitialPrompt(user, clubs, conversationContext);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4, // Slightly higher for more creative responses
      max_tokens: 1200 // Increased for more detailed reasoning
    });

    // Parse and validate response
    const responseContent = completion.choices[0].message.content;
    let data;
    
    try {
      data = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("AI returned invalid JSON:", responseContent);
      throw new Error("AI returned non-JSON response");
    }

    // Validate response structure
    const validation = validateAIResponse(data);
    if (!validation.isValid) {
      console.error("AI response validation failed:", validation.error);
      throw new Error("AI response structure invalid");
    }

    // Sanitize and enhance recommendations with conversational elements
    const recommendations = sanitizeRecommendations(data.recommendations, 7);
    const enhancedRecommendations = enhanceRecommendationsWithContext(recommendations, conversationContext);
    
    return {
      source: "ai",
      recommendations: enhancedRecommendations,
      conversationInsights: data.conversationInsights || {},
      followUpSuggestions: data.followUpSuggestions || []
    };

  } catch (error) {
    console.error("AI service error:", error);
    throw error;
  }
}

/**
 * Enhanced initial recommendation prompt with conversational context
 */
function createEnhancedInitialPrompt(user, clubs, conversationContext) {
  const { userName, emotionalContext, userPreferences, conversationHistory } = conversationContext;
  
  return `Recommend 5-7 clubs for this high school student with dynamic, conversational reasoning:

STUDENT PROFILE:
- Name: ${userName || 'Student'}
- School: ${user.school}
- Interests: ${user.interests.join(', ')}
- Time Commitment: ${user.timeCommitment}
- Preferred Club Type: ${user.type}
- Skills/Goals: ${user.skills || 'Not specified'}
- Grade Level: ${user.grade}
- Previous Experience: ${user.priorExperience || 'Not specified'}

EMOTIONAL CONTEXT:
- Mood: ${emotionalContext?.mood || 'neutral'}
- Energy Level: ${emotionalContext?.energy || 'medium'}
- Engagement: ${emotionalContext?.engagement || 0}
- Excitement: ${emotionalContext?.excitement || 0}
- Frustration: ${emotionalContext?.frustration || 0}

USER PREFERENCES & HISTORY:
- Detected Preferences: ${JSON.stringify(userPreferences)}
- Conversation History: ${conversationHistory?.length || 0} previous interactions
- Previous Recommendations: ${conversationContext.lastRecommendations?.map(r => r.name).join(', ') || 'None'}

AVAILABLE CLUBS (${clubs.length} clubs at ${user.school}):
${clubs.map(club => `
- ${club.name} (${club.category})
  Type: ${club.type}
  Time Commitment: ${club.timeCommitment}
  Interests: ${club.interests.join(', ')}
  Description: ${club.description}
  Activities: ${(club.activities || []).join(', ')}
  Benefits: ${(club.benefits || []).join(', ')}
`).join('')}

ENHANCED RECOMMENDATION REQUIREMENTS:
1. Only recommend clubs from ${user.school}
2. Provide conversational, engaging reasoning that matches the student's emotional state
3. Consider the student's name and personalize responses accordingly
4. Adapt tone based on emotional context (excited, supportive, encouraging, etc.)
5. Include progressive disclosure - essential info first, details available on expansion
6. Make explanations variable in length and style based on engagement level
7. Consider previous recommendations to avoid repetition
8. Score matches as High/Medium/Low with detailed reasoning
9. Include conversation insights for future interactions
10. Suggest contextual follow-up questions

Return JSON with this structure:
{
  "recommendations": [
    {
      "name": "Exact Club Name",
      "category": "Club Category",
      "school": "School Name",
      "reason": "Conversational, personalized explanation",
      "matchScore": "High|Medium|Low",
      "progressiveDetails": {
        "essential": "Key reason for recommendation",
        "expanded": "Detailed explanation with activities and benefits",
        "personalized": "Specific connection to student's interests"
      },
      "engagementLevel": "high|medium|low",
      "suggestedFollowUp": "Contextual question or suggestion"
    }
  ],
  "conversationInsights": {
    "detectedInterests": ["interest1", "interest2"],
    "engagementPatterns": "high|medium|low",
    "preferredTone": "excited|supportive|encouraging|casual",
    "learningPreferences": "visual|hands-on|social|competitive"
  },
  "followUpSuggestions": [
    "Show me more competitive clubs",
    "What about clubs with less time commitment?",
    "Can you suggest clubs for my friend who likes art?"
  ]
}`;
}

/**
 * Enhanced follow-up recommendation prompt with adaptive conversation flow
 */
function createEnhancedFollowUpPrompt(user, clubs, conversationContext) {
  const { userName, emotionalContext, userPreferences, conversationHistory, backtrackingHistory } = conversationContext;
  
  return `The student is asking for follow-up recommendations: "${user.followUp}"

STUDENT CONTEXT:
- Name: ${userName || 'Student'}
- School: ${user.school}
- Original Interests: ${user.interests.join(', ')}
- Original Time Commitment: ${user.timeCommitment}
- Original Club Type: ${user.type}
- Grade Level: ${user.grade}

FOLLOW-UP ANALYSIS:
- Request: "${user.followUp}"
- Intent: ${user.followUpIntent || 'general'}
- Emotional State: ${emotionalContext?.mood || 'neutral'}
- Engagement Level: ${emotionalContext?.engagement || 0}

CONVERSATION HISTORY:
- Previous Recommendations: ${conversationContext.lastRecommendations?.map(r => r.name).join(', ') || 'None'}
- Backtracking History: ${backtrackingHistory?.length || 0} changes made
- User Preferences Evolution: ${JSON.stringify(userPreferences)}
- Conversation Flow: ${conversationHistory?.length || 0} interactions

AVAILABLE CLUBS (${clubs.length} clubs at ${user.school}):
${clubs.map(club => `
- ${club.name} (${club.category})
  Type: ${club.type}
  Time Commitment: ${club.timeCommitment}
  Interests: ${club.interests.join(', ')}
  Description: ${club.description}
  Activities: ${(club.activities || []).join(', ')}
  Benefits: ${(club.benefits || []).join(', ')}
`).join('')}

ADAPTIVE FOLLOW-UP REQUIREMENTS:
1. Address the specific follow-up request with conversational reasoning
2. Adapt tone based on emotional context and engagement level
3. Consider backtracking history to understand user's decision-making process
4. Avoid repeating previous recommendations unless they perfectly match new criteria
5. Provide progressive disclosure with essential and expanded details
6. Include personalized connections to the student's evolving preferences
7. Suggest contextual follow-up questions based on detected interests
8. Update conversation insights for future learning
9. Handle off-topic requests with friendly redirection
10. Provide multiple follow-up suggestions for continued engagement

Return JSON with the same structure as initial recommendations, but with enhanced follow-up context.`;
}

/**
 * Enhance recommendations with conversational context and personality
 */
function enhanceRecommendationsWithContext(recommendations, conversationContext) {
  const { userName, emotionalContext, userPreferences } = conversationContext;
  
  return recommendations.map(rec => {
    // Add personalized elements based on context
    const enhancedReason = enhanceReasoningWithPersonality(rec.reason, conversationContext);
    
    return {
      ...rec,
      reason: enhancedReason,
      progressiveDetails: rec.progressiveDetails || {
        essential: rec.reason,
        expanded: rec.reason,
        personalized: `Based on what I know about ${userName || 'you'}, this club seems like a great fit!`
      },
      engagementLevel: rec.engagementLevel || 'medium',
      suggestedFollowUp: rec.suggestedFollowUp || generateContextualFollowUp(rec, conversationContext)
    };
  });
}

/**
 * Enhance reasoning with personality and emotional context
 */
function enhanceReasoningWithPersonality(reason, conversationContext) {
  const { userName, emotionalContext, userPreferences } = conversationContext;
  
  let enhancedReason = reason;
  
  // Add personalization if we have a name
  if (userName && !reason.includes(userName)) {
    enhancedReason = enhancedReason.replace(/^/, `${userName}, `);
  }
  
  // Add emotional context
  if (emotionalContext?.excitement > 0.5) {
    enhancedReason = enhancedReason.replace(/\.$/, ' - I can tell you\'re excited about this!');
  } else if (emotionalContext?.frustration > 0.3) {
    enhancedReason = enhancedReason.replace(/\.$/, ' - I understand this might be challenging, but I think this could work well for you.');
  }
  
  // Add preference-based enhancements
  if (userPreferences?.competitive && reason.toLowerCase().includes('competitive')) {
    enhancedReason = enhancedReason.replace(/\.$/, ' - Perfect for your competitive spirit!');
  }
  
  return enhancedReason;
}

/**
 * Generate contextual follow-up suggestions
 */
function generateContextualFollowUp(recommendation, conversationContext) {
  const { userPreferences, emotionalContext } = conversationContext;
  
  const followUps = [
    `Tell me more about ${recommendation.name}`,
    `What other ${recommendation.category} clubs are available?`,
    `Show me clubs with similar time commitment`,
    `What about more ${userPreferences?.competitive ? 'competitive' : 'social'} clubs?`
  ];
  
  return followUps[Math.floor(Math.random() * followUps.length)];
}

/**
 * Get conversational insights for learning and adaptation
 */
export async function getConversationalInsights({ conversationHistory, userResponses, emotionalContext }) {
  try {
    const prompt = `Analyze this conversation for insights:

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.type}: ${msg.text}`).join('\n')}

USER RESPONSES:
${JSON.stringify(userResponses)}

EMOTIONAL CONTEXT:
${JSON.stringify(emotionalContext)}

Provide insights in JSON format:
{
  "engagementPatterns": "high|medium|low",
  "preferredTopics": ["topic1", "topic2"],
  "communicationStyle": "direct|casual|detailed|brief",
  "decisionMakingStyle": "quick|thoughtful|comparative|intuitive",
  "learningPreferences": ["visual", "hands-on", "social", "competitive"],
  "frustrationTriggers": ["complexity", "repetition", "lack of options"],
  "motivationFactors": ["achievement", "social connection", "skill development"],
  "suggestedAdaptations": {
    "tone": "excited|supportive|encouraging|casual",
    "detailLevel": "high|medium|low",
    "interactionStyle": "directive|suggestive|collaborative"
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a conversation analyst. Provide insights in JSON format only." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 600
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("Conversational insights error:", error);
    return {
      engagementPatterns: "medium",
      preferredTopics: [],
      communicationStyle: "casual",
      decisionMakingStyle: "thoughtful",
      learningPreferences: ["social"],
      frustrationTriggers: [],
      motivationFactors: ["skill development"],
      suggestedAdaptations: {
        tone: "supportive",
        detailLevel: "medium",
        interactionStyle: "collaborative"
      }
    };
  }
}

/**
 * Generate adaptive follow-up suggestions based on conversation context
 */
export async function generateAdaptiveFollowUps({ currentRecommendations, conversationContext, userEngagement }) {
  try {
    const prompt = `Based on this conversation context, generate 3-5 adaptive follow-up suggestions:

CURRENT RECOMMENDATIONS:
${currentRecommendations.map(r => `- ${r.name} (${r.category})`).join('\n')}

CONVERSATION CONTEXT:
- User Engagement: ${userEngagement}
- Emotional State: ${conversationContext.emotionalContext?.mood || 'neutral'}
- Previous Interactions: ${conversationContext.conversationHistory?.length || 0}
- User Preferences: ${JSON.stringify(conversationContext.userPreferences)}

Generate follow-up suggestions that:
1. Match the user's engagement level
2. Consider their emotional state
3. Build on their preferences
4. Provide clear next steps
5. Encourage continued interaction

Return as JSON array of strings.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Generate conversational follow-up suggestions in JSON array format." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 400
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response.suggestions || [];
  } catch (error) {
    console.error("Adaptive follow-ups error:", error);
    return [
      "Show me more clubs in different categories",
      "What about clubs with different time commitments?",
      "Can you suggest clubs for my friend?",
      "Tell me more about the clubs you recommended"
    ];
  }
}
