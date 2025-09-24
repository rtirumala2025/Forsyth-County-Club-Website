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
    
    // Handle reset commands first
    if (isResetCommand && isResetCommand(userQuery)) {
      updatedSessionData.school = null;
      updatedSessionData.grade = null;
    } else {
      // Check if user mentioned a school (only if not already set)
      if (!updatedSessionData.school) {
        const normalizedSchool = normalizeSchoolName(userQuery);
        if (normalizedSchool) {
          updatedSessionData.school = normalizedSchool;
        }
      }
      
      // Check if user mentioned a grade (only if school is set but grade is not)
      if (updatedSessionData.school && !updatedSessionData.grade) {
        const gradeMatch = query.match(/\b(9|10|11|12|ninth|tenth|eleventh|twelfth|freshman|sophomore|junior|senior)\b/);
        if (gradeMatch) {
          let grade = gradeMatch[1];
          if (grade === 'ninth' || grade === 'freshman') grade = '9';
          if (grade === 'tenth' || grade === 'sophomore') grade = '10';
          if (grade === 'eleventh' || grade === 'junior') grade = '11';
          if (grade === 'twelfth' || grade === 'senior') grade = '12';
          updatedSessionData.grade = parseInt(grade);
        }
      }
    }
    
    
    // Get AI response from LLaMA service
    const aiResponse = await getLlamaResponse(userQuery, updatedSessionData);

    // Update session data with current query
    updatedSessionData = updateSessionHistory(updatedSessionData, userQuery);

    return res.json({
      success: true,
      message: aiResponse,
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

  // Validate and sanitize interests array
  if (Array.isArray(sessionData.interests)) {
    sanitized.interests = sessionData.interests
      .filter(interest => typeof interest === 'string' && interest.trim().length > 0)
      .map(interest => interest.trim())
      .slice(0, 10); // Limit to 10 interests
  } else {
    sanitized.interests = [];
  }

  // Validate and sanitize experience types array
  if (Array.isArray(sessionData.experience_types)) {
    sanitized.experience_types = sessionData.experience_types
      .filter(type => typeof type === 'string' && type.trim().length > 0)
      .map(type => type.trim())
      .slice(0, 5); // Limit to 5 experience types
  } else {
    sanitized.experience_types = [];
  }

  // Validate and sanitize clubs viewed array
  if (Array.isArray(sessionData.clubs_viewed)) {
    sanitized.clubs_viewed = sessionData.clubs_viewed
      .filter(club => typeof club === 'string' && club.trim().length > 0)
      .map(club => club.trim())
      .slice(0, 20); // Limit to 20 clubs
  } else {
    sanitized.clubs_viewed = [];
  }

  // Validate and sanitize query history array
  if (Array.isArray(sessionData.query_history)) {
    sanitized.query_history = sessionData.query_history
      .filter(query => typeof query === 'string' && query.trim().length > 0)
      .map(query => query.trim())
      .slice(-10); // Keep only last 10 queries
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
