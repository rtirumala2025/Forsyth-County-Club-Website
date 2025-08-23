import clubs from "../data/clubs.js";
import { getAIRecommendations } from "../services/ai.service.js";
import { filterBySchool, heuristicRecommendations } from "../services/rank.service.js";
import { validateRecommendationRequest } from "../utils/schema.js";
import { normalizeInterests, normalizeClubType, normalizeTimeCommitment, extractFollowUpIntent } from "../utils/normalize.js";

// In-memory conversation storage (in production, use Redis or database)
const conversations = new Map(); // conversationId -> { user, lastRecommendations, timestamp }

/**
 * Main recommendation endpoint
 */
export async function recommend(req, res) {
  try {
    const { 
      conversationId, 
      school, 
      interests, 
      timeCommitment, 
      type, 
      skills, 
      grade, 
      priorExperience, 
      followUp 
    } = req.body || {};

    // Validate request
    const validation = validateRecommendationRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: "Invalid request", 
        details: validation.errors 
      });
    }

    // Filter clubs by school (hard filter)
    const schoolClubs = filterBySchool(clubs, school);
    if (schoolClubs.length === 0) {
      return res.status(404).json({ 
        error: `No clubs found for ${school}. Please try a different school.` 
      });
    }

    // Normalize user inputs
    const normalizedInterests = normalizeInterests(interests.join(" "));
    const normalizedType = normalizeClubType(type);
    const normalizedTimeCommitment = normalizeTimeCommitment(timeCommitment);

    // Check if this is a follow-up request
    const isFollowUp = !!followUp;
    let followUpIntent = null;
    
    if (isFollowUp) {
      followUpIntent = extractFollowUpIntent(followUp);
    }

    // Prepare user object
    const user = {
      school,
      interests: normalizedInterests,
      timeCommitment: normalizedTimeCommitment,
      type: normalizedType,
      skills: skills || null,
      grade,
      priorExperience: priorExperience || null,
      followUp: followUp || null,
      followUpIntent: followUpIntent?.type || null
    };

    // Get conversation context
    const context = conversations.get(conversationId) || {};
    
    // Try AI recommendations first
    let recommendations;
    let source = "ai";
    
    try {
      const aiResult = await getAIRecommendations({ 
        user, 
        clubs: schoolClubs, 
        context, 
        isFollowUp 
      });
      recommendations = aiResult.recommendations;
    } catch (aiError) {
      console.error("AI recommendation failed, using fallback:", aiError.message);
      
      // Fallback to heuristic recommendations
      recommendations = heuristicRecommendations({ 
        user, 
        clubs: schoolClubs, 
        isFollowUp 
      });
      source = "fallback";
    }

    // Update conversation context
    conversations.set(conversationId, {
      user,
      lastRecommendations: recommendations,
      timestamp: new Date().toISOString()
    });

    // Clean up old conversations (older than 1 hour)
    cleanupOldConversations();

    // Return response
    res.json({
      success: true,
      source,
      recommendations,
      school,
      conversationId,
      message: source === "fallback" ? 
        "Using backup recommendations (AI temporarily unavailable)" : 
        "AI-powered recommendations generated successfully"
    });

  } catch (error) {
    console.error("Recommendation controller error:", error);
    res.status(500).json({ 
      error: "Server error. Please try again.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Follow-up recommendation endpoint
 */
export async function followUpRecommend(req, res) {
  try {
    const { conversationId, followUp } = req.body || {};

    if (!conversationId || !followUp) {
      return res.status(400).json({ 
        error: "conversationId and followUp are required" 
      });
    }

    // Get conversation context
    const context = conversations.get(conversationId);
    if (!context) {
      return res.status(404).json({ 
        error: "Conversation not found. Please start a new recommendation." 
      });
    }

    const { user, lastRecommendations } = context;

    // Filter clubs by school
    const schoolClubs = filterBySchool(clubs, user.school);
    if (schoolClubs.length === 0) {
      return res.status(404).json({ 
        error: `No clubs found for ${user.school}.` 
      });
    }

    // Extract follow-up intent
    const followUpIntent = extractFollowUpIntent(followUp);

    // Update user with follow-up information
    const updatedUser = {
      ...user,
      followUp,
      followUpIntent: followUpIntent.type,
      previousRecommendations: lastRecommendations
    };

    // Try AI recommendations first
    let recommendations;
    let source = "ai";
    
    try {
      const aiResult = await getAIRecommendations({ 
        user: updatedUser, 
        clubs: schoolClubs, 
        context, 
        isFollowUp: true 
      });
      recommendations = aiResult.recommendations;
    } catch (aiError) {
      console.error("AI follow-up failed, using fallback:", aiError.message);
      
      // Fallback to heuristic recommendations
      recommendations = heuristicRecommendations({ 
        user: updatedUser, 
        clubs: schoolClubs, 
        isFollowUp: true 
      });
      source = "fallback";
    }

    // Update conversation context
    conversations.set(conversationId, {
      user: updatedUser,
      lastRecommendations: recommendations,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      source,
      recommendations,
      school: user.school,
      conversationId,
      followUpIntent: followUpIntent.type,
      message: source === "fallback" ? 
        "Using backup recommendations for your follow-up request" : 
        "AI-powered follow-up recommendations generated successfully"
    });

  } catch (error) {
    console.error("Follow-up recommendation error:", error);
    res.status(500).json({ 
      error: "Server error. Please try again.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get conversation status
 */
export function getConversationStatus(req, res) {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    const context = conversations.get(conversationId);
    if (!context) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json({
      success: true,
      conversationId,
      hasRecommendations: !!context.lastRecommendations,
      recommendationCount: context.lastRecommendations?.length || 0,
      timestamp: context.timestamp
    });

  } catch (error) {
    console.error("Get conversation status error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Clean up old conversations (older than 1 hour)
 */
function cleanupOldConversations() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  for (const [conversationId, context] of conversations.entries()) {
    if (new Date(context.timestamp) < oneHourAgo) {
      conversations.delete(conversationId);
    }
  }
}

/**
 * Get available schools
 */
export function getAvailableSchools(req, res) {
  try {
    const schools = [...new Set(clubs.map(club => club.school))].sort();
    
    res.json({
      success: true,
      schools,
      count: schools.length
    });

  } catch (error) {
    console.error("Get available schools error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
