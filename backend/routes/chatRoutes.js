/**
 * Chat Routes for Forsyth County Club Website
 * 
 * This module defines the Express.js routes for handling chat interactions
 * with the AI-powered club recommendation system.
 */

const express = require('express');
// Switched to LLaMA (OpenRouter) service
const { getLlamaResponse } = require('../services/llamaService');

const router = express.Router();

/**
 * POST /chat
 * Main chat endpoint for AI-powered club recommendations
 * 
 * Accepts user queries and session data, returns AI-generated recommendations
 * and responses about clubs and activities.
 */
router.post('/chat', async (req, res) => {
  try {
    // Extract and validate request data
    const { userQuery, sessionData } = req.body;

    // Validate required fields
    if (!userQuery) {
      return res.status(400).json({
        success: false,
        error: 'userQuery is required',
        errorType: 'validation_error'
      });
    }

    if (typeof userQuery !== 'string' || userQuery.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'userQuery must be a non-empty string',
        errorType: 'validation_error'
      });
    }

    // Sanitize and prepare session data
    const sanitizedSessionData = sanitizeSessionData(sessionData || {});

    // Log the request for debugging (remove in production)
    console.log(`[${new Date().toISOString()}] Chat request:`, {
      query: userQuery.substring(0, 100) + (userQuery.length > 100 ? '...' : ''),
      school: sanitizedSessionData.school || 'none',
      grade: sanitizedSessionData.grade || 'none'
    });

    // Parse user response to extract school/grade information
    const { normalizeSchoolName } = require('../services/schoolClubService');
    const { isResetCommand } = require('../services/llamaService');
    
    // Update session data based on user input
    let updatedSessionData = { ...sanitizedSessionData };
    const query = userQuery.toLowerCase().trim();
    
    // Let the LLaMA service handle ALL parsing logic including reset commands
    // The route handler should only handle basic session management
    
    // Get AI response from LLaMA service
    const llamaResult = await getLlamaResponse(userQuery, updatedSessionData);

    // Update session data with the result from LLaMA service
    updatedSessionData = llamaResult.sessionData || updatedSessionData;
    
    // Update session data with current query
    updatedSessionData = updateSessionHistory(updatedSessionData, userQuery);

    return res.json({
      success: true,
      message: llamaResult.response || llamaResult,
      source: 'llama',
      sessionData: updatedSessionData
    });

  } catch (error) {
    console.error('🚨 Error in /chat endpoint:', {
      error: error.message,
      stack: error.stack,
      userQuery: userQuery?.substring(0, 100),
      timestamp: new Date().toISOString()
    });
    
    // Always return a successful response to prevent frontend errors
    res.status(200).json({
      success: true,
      message: JSON.stringify({
        success: true,
        message: "⚠️ Oops! I'm having trouble loading the clubs right now.\n👉 Please try again in a moment, or I can retry for you.",
        clubs: [],
        suggestions: ["🔄 Try Again", "🏫 Start Over"]
      }),
      source: 'error_fallback',
      sessionData: sanitizeSessionData(sessionData || {})
    });
  }
});

// Removed OpenAI admin diagnostics endpoint

/**
 * GET /chat/health
 * Health check endpoint for the chat service
 * 
 * Returns the status of the AI service and API connectivity
 */
router.get('/chat/health', async (req, res) => {
  try {
    // Simple health response now that OpenAI is removed
    res.status(200).json({
      service: 'Chat Service',
      status: 'healthy',
      message: 'Chat service is reachable',
      timestamp: new Date().toISOString(),
      endpoints: {
        chat: '/api/chat',
        health: '/api/chat/health',
        session: '/api/chat/session'
      }
    });
    
  } catch (error) {
    console.error('Error in health check:', error);
    
    res.status(503).json({
      service: 'Chat Service',
      status: 'unhealthy',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /chat/session
 * Session management endpoint
 * 
 * Allows frontend to update or retrieve session data
 */
router.post('/chat/session', async (req, res) => {
  try {
    const { action, sessionData } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'action is required (get, update, or reset)',
        errorType: 'validation_error'
      });
    }

    switch (action) {
      case 'get':
        // Return current session data (placeholder - in real app, retrieve from database/cache)
        res.json({
          success: true,
          sessionData: sessionData || {},
          message: 'Session data retrieved'
        });
        break;

      case 'update':
        // Update session data (placeholder - in real app, save to database/cache)
        const updatedData = sanitizeSessionData(sessionData || {});
        res.json({
          success: true,
          sessionData: updatedData,
          message: 'Session data updated'
        });
        break;

      case 'reset':
        // Reset session data
        const freshSession = createFreshSession();
        res.json({
          success: true,
          sessionData: freshSession,
          message: 'Session data reset'
        });
        break;

      default:
        res.status(400).json({
          success: false,
          error: 'Invalid action. Must be get, update, or reset',
          errorType: 'validation_error'
        });
    }

  } catch (error) {
    console.error('Error in /chat/session endpoint:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error occurred while managing session',
      errorType: 'server_error'
    });
  }
});

/**
 * GET /chat/suggestions
 * Get conversation starter suggestions
 * 
 * Returns helpful prompts to guide users in starting conversations
 */
router.get('/chat/suggestions', (req, res) => {
  try {
    const suggestions = [
      "What clubs are good for someone interested in technology?",
      "I'm looking for creative clubs to join",
      "What sports clubs are available?",
      "I want to help my community - what volunteer clubs exist?",
      "What clubs would help me with college applications?",
      "I'm interested in leadership opportunities",
      "What clubs meet after school?",
      "I'm new to the school - what clubs are beginner-friendly?"
    ];

    res.json({
      success: true,
      suggestions: suggestions,
      message: 'Conversation starters retrieved',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in /chat/suggestions endpoint:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve suggestions',
      errorType: 'server_error'
    });
  }
});

/**
 * Sanitize and validate session data
 * 
 * @param {Object} sessionData - Raw session data from request
 * @returns {Object} Sanitized session data
 */
function sanitizeSessionData(sessionData) {
  const sanitized = {};

  // Validate and sanitize school
  if (sessionData.school && typeof sessionData.school === 'string') {
    const { getAvailableSchools } = require('../services/schoolClubService');
    const schools = getAvailableSchools();
    if (schools.includes(sessionData.school)) {
      sanitized.school = sessionData.school;
    }
  }

  // Validate and sanitize grade
  if (sessionData.grade !== undefined) {
    const grade = parseInt(sessionData.grade);
    if (!isNaN(grade) && grade >= 9 && grade <= 12) {
      sanitized.grade = grade;
    }
  }

  // Validate and sanitize categories
  if (sessionData.categories) {
    if (Array.isArray(sessionData.categories) && sessionData.categories.length > 0) {
      const validCategories = ['STEM', 'Arts', 'Leadership', 'Sports', 'Community Service', 'Cultural/Diversity', 'Academic'];
      const filteredCategories = sessionData.categories
        .filter(cat => typeof cat === 'string' && cat.trim().length > 0)
        .map(cat => cat.trim())
        .filter(cat => validCategories.includes(cat) || cat.length > 0)
        .slice(0, 5); // Limit to 5 categories
      
      if (filteredCategories.length > 0) {
        sanitized.categories = filteredCategories;
      }
    }
  }

  // Validate and sanitize activity type
  if (sessionData.activityType && typeof sessionData.activityType === 'string') {
    const validActivityTypes = [
      'Hands-on projects', 'Academic competitions', 'Arts/creativity', 
      'Leadership/service', 'Sports/fitness', 'Social/cultural clubs'
    ];
    if (validActivityTypes.includes(sessionData.activityType) || sessionData.activityType.trim().length > 0) {
      sanitized.activityType = sessionData.activityType.trim();
    }
  }

  // Validate and sanitize time commitment
  if (sessionData.timeCommitment && typeof sessionData.timeCommitment === 'string') {
    const validTimeCommitments = ['Low', 'Medium', 'High'];
    if (validTimeCommitments.includes(sessionData.timeCommitment) || sessionData.timeCommitment.trim().length > 0) {
      sanitized.timeCommitment = sessionData.timeCommitment.trim();
    }
  }

  // Validate and sanitize goal
  if (sessionData.goal && typeof sessionData.goal === 'string') {
    const validGoals = ['Fun/social', 'Resume/college', 'Both'];
    if (validGoals.includes(sessionData.goal) || sessionData.goal.trim().length > 0) {
      sanitized.goal = sessionData.goal.trim();
    }
  }

  // Validate and sanitize teamwork preference
  if (sessionData.teamwork && typeof sessionData.teamwork === 'string') {
    const validTeamwork = ['Team-focused', 'Individual-focused', 'Both'];
    if (validTeamwork.includes(sessionData.teamwork) || sessionData.teamwork.trim().length > 0) {
      sanitized.teamwork = sessionData.teamwork.trim();
    }
  }

  // Validate and sanitize interests (legacy field)
  if (sessionData.interests) {
    if (typeof sessionData.interests === 'string' && sessionData.interests.trim().length > 0) {
      sanitized.interests = sessionData.interests.trim();
    } else if (Array.isArray(sessionData.interests) && sessionData.interests.length > 0) {
      const filteredInterests = sessionData.interests
        .filter(interest => typeof interest === 'string' && interest.trim().length > 0)
        .map(interest => interest.trim())
        .slice(0, 10); // Limit to 10 interests
      
      if (filteredInterests.length > 0) {
        sanitized.interests = filteredInterests;
      }
    }
  }

  // Validate and sanitize experience types array
  if (Array.isArray(sessionData.experience_types) && sessionData.experience_types.length > 0) {
    const filteredTypes = sessionData.experience_types
      .filter(type => typeof type === 'string' && type.trim().length > 0)
      .map(type => type.trim())
      .slice(0, 5); // Limit to 5 experience types
    
    if (filteredTypes.length > 0) {
      sanitized.experience_types = filteredTypes;
    }
  }

  // Validate and sanitize clubs viewed array
  if (Array.isArray(sessionData.clubs_viewed) && sessionData.clubs_viewed.length > 0) {
    const filteredClubs = sessionData.clubs_viewed
      .filter(club => typeof club === 'string' && club.trim().length > 0)
      .map(club => club.trim())
      .slice(0, 20); // Limit to 20 clubs
    
    if (filteredClubs.length > 0) {
      sanitized.clubs_viewed = filteredClubs;
    }
  } else {
    sanitized.clubs_viewed = [];
  }

  // Validate and sanitize query history array
  if (Array.isArray(sessionData.query_history) && sessionData.query_history.length > 0) {
    const filteredHistory = sessionData.query_history
      .filter(query => typeof query === 'string' && query.trim().length > 0)
      .map(query => query.trim())
      .slice(-10); // Keep only last 10 queries
    
    if (filteredHistory.length > 0) {
      sanitized.query_history = filteredHistory;
    }
  } else {
    sanitized.query_history = [];
  }

  return sanitized;
}

/**
 * Update session history with new query
 * 
 * @param {Object} sessionData - Current session data
 * @param {string} newQuery - New user query to add to history
 * @returns {Object} Updated session data
 */
function updateSessionHistory(sessionData, newQuery) {
  const updated = { ...sessionData };
  
  // Add query to history
  if (!updated.query_history) {
    updated.query_history = [];
  }
  
  updated.query_history.push(newQuery);
  
  // Keep only last 10 queries
  if (updated.query_history.length > 10) {
    updated.query_history = updated.query_history.slice(-10);
  }
  
  return updated;
}

/**
 * Create fresh session data object
 * 
 * @returns {Object} Fresh session data
 */
function createFreshSession() {
  return {
    grade: null,
    interests: [],
    experience_types: [],
    clubs_viewed: [],
    query_history: []
  };
}

module.exports = router;
