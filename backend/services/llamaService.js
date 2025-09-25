const axios = require('axios');
const { getAvailableSchools, getSchoolClubs, formatClubsForLLaMA, normalizeSchoolName } = require('./schoolClubService');

// LLaMA (OpenRouter) client wrapper with session-based club data integration
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function isResetCommand(query) {
  const resetKeywords = [
    'restart', 'reset', 'start over', 'change school', 'switch school', 
    'different school', 'new school', 'pick another school', 'go back'
  ];
  const lowerQuery = query.toLowerCase().trim();
  return resetKeywords.some(keyword => lowerQuery.includes(keyword));
}

function buildJSONResponse(sessionData, userQuery = '', clubs = null) {
  const schools = getAvailableSchools();
  
  // Step 1: Ask for school if not set
  if (!sessionData.school) {
    return JSON.stringify({
      success: true,
      message: "🏫 Welcome to the Forsyth County Club Recommender! Which high school do you attend?",
      clubs: [],
      suggestions: schools
    });
  }
  
  // Step 2: Ask for grade if school is set but grade is not
  if (!sessionData.grade) {
    return JSON.stringify({
      success: true,
      message: `Great! You selected ${sessionData.school}. What grade are you in? (9, 10, 11, or 12)`,
      clubs: [],
      suggestions: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"]
    });
  }
  
  // Step 3: Ask for activity type preference
  if (!sessionData.activityType) {
    return JSON.stringify({
      success: true,
      message: `Perfect! You're in grade ${sessionData.grade} at ${sessionData.school}. What type of activities do you prefer?`,
      clubs: [],
      suggestions: ["Hands-on projects", "Academic competitions", "Arts/creativity", "Leadership/service", "Sports/fitness", "Social/cultural clubs"]
    });
  }
  
  // Step 4: Ask for time commitment preference
  if (!sessionData.timeCommitment) {
    return JSON.stringify({
      success: true,
      message: `Great choice! How much time do you want to commit to club activities?`,
      clubs: [],
      suggestions: ["Low (1-2 hours/week)", "Medium (3-5 hours/week)", "High (6+ hours/week)"]
    });
  }
  
  // Step 5: Ask for goal preference
  if (!sessionData.goal) {
    return JSON.stringify({
      success: true,
      message: `Perfect! What's your main goal for joining clubs?`,
      clubs: [],
      suggestions: ["Fun/social", "Resume/college", "Both"]
    });
  }
  
  // Step 6: Ask for teamwork preference
  if (!sessionData.teamwork) {
    return JSON.stringify({
      success: true,
      message: `Almost done! Do you prefer working in teams or individually?`,
      clubs: [],
      suggestions: ["Team-focused", "Individual-focused", "Both"]
    });
  }
  
  // Step 4: Provide club recommendations (only if clubs are explicitly provided)
  if (clubs === null) {
    // No clubs provided, this shouldn't happen if we reach here
    return JSON.stringify({
      success: true,
      message: `Perfect! You're in grade ${sessionData.grade} at ${sessionData.school}. What types of clubs are you most interested in?`,
      clubs: [],
      suggestions: ["STEM", "Arts", "Sports", "Leadership", "Community Service", "Academic"]
    });
  }
  
  const formattedClubs = clubs.map(club => {
    // Generate school slug (remove "High School" and convert to lowercase with dashes)
    const schoolSlug = sessionData.school
      .replace(/\s+High\s+School/i, '')
      .toLowerCase()
      .replace(/\s+/g, '-');
    
    // Generate club slug (convert to lowercase with dashes)
    const clubSlug = (club.id || club.name)
      .toLowerCase()
      .replace(/\s+/g, '-');
    
    return {
      name: club.name,
      description: club.description,
      sponsor: club.sponsor || 'Contact school for advisor',
      category: club.category || 'General',
      link: `/clubs/${schoolSlug}/${clubSlug}`
    };
  });
  
  if (formattedClubs.length === 0) {
    // Get a diverse sample of clubs if no matches found
    const allSchoolClubs = getSchoolClubs(sessionData.school);
    const sampleClubs = allSchoolClubs.slice(0, 5).map(club => {
      const schoolSlug = sessionData.school
        .replace(/\s+High\s+School/i, '')
        .toLowerCase()
        .replace(/\s+/g, '-');
      
      const clubSlug = (club.id || club.name)
        .toLowerCase()
        .replace(/\s+/g, '-');
      
      return {
        name: club.name,
        description: club.description,
        sponsor: club.sponsor || 'Contact school for advisor',
        category: club.category || 'General',
        link: `/clubs/${schoolSlug}/${clubSlug}`
      };
    });
    
    return JSON.stringify({
      success: true,
      message: `Here are some popular clubs at ${sessionData.school} you might enjoy:`,
      clubs: sampleClubs,
      suggestions: ["STEM", "Arts", "Sports", "Leadership", "Community Service", "Academic", "🔄 Restart"]
    });
  }
  
  const interestText = Array.isArray(sessionData.interests) 
    ? sessionData.interests.join(', ') 
    : sessionData.interests;
  
  return JSON.stringify({
    success: true,
    message: `Here are some ${interestText} clubs at ${sessionData.school} you might enjoy:`,
    clubs: formattedClubs,
    suggestions: ["STEM", "Arts", "Sports", "Leadership", "Community Service", "Academic", "🔄 Restart"]
  });
}

function getCategoryEmoji(category) {
  const emojiMap = {
    'STEM': '🤖',
    'Arts': '🎭',
    'Leadership': '👑',
    'Sports': '⚽',
    'Service': '🤝',
    'Cultural': '🌍',
    'Academic': '📚',
    'Recreational': '🎮'
  };
  return emojiMap[category] || '🎯';
}

function parseUserResponse(userQuery, sessionData) {
  const query = userQuery.toLowerCase().trim();
  
  // Check for reset commands first
  if (isResetCommand(query)) {
    return { action: 'reset_all' };
  }
  
  // If no school set, try to detect school name using normalization
  if (!sessionData.school) {
    const normalizedSchool = normalizeSchoolName(query);
    if (normalizedSchool) {
      return { action: 'set_school', school: normalizedSchool };
    }
  }
  
  // If school set but no grade, try to detect grade
  if (sessionData.school && !sessionData.grade) {
    const gradeMatch = query.match(/\b(9|10|11|12|ninth|tenth|eleventh|twelfth|freshman|sophomore|junior|senior)\b/);
    if (gradeMatch) {
      let grade = gradeMatch[1];
      if (grade === 'ninth' || grade === 'freshman') grade = '9';
      if (grade === 'tenth' || grade === 'sophomore') grade = '10';
      if (grade === 'eleventh' || grade === 'junior') grade = '11';
      if (grade === 'twelfth' || grade === 'senior') grade = '12';
      return { action: 'set_grade', grade: parseInt(grade) };
    }
  }
  
  // If school and grade set but no interests, detect interests
  if (sessionData.school && sessionData.grade && (!sessionData.interests || (typeof sessionData.interests === 'string' && sessionData.interests.trim() === '') || (Array.isArray(sessionData.interests) && sessionData.interests.length === 0))) {
    const interestKeywords = ['stem', 'arts', 'sports', 'leadership', 'service', 'academic', 'community', 'music', 'drama', 'science', 'math', 'technology', 'robotics', 'coding'];
    const foundInterests = interestKeywords.filter(keyword => query.includes(keyword));
    
    if (foundInterests.length > 0 || query.length > 3) {
      return { action: 'set_interests', interests: userQuery };
    }
  }
  
  // If all info is set, this is a follow-up query
  if (sessionData.school && sessionData.grade && sessionData.interests && sessionData.interests !== '') {
    return { action: 'recommend_clubs', interests: userQuery };
  }
  
  return { action: 'continue' };
}

async function getLlamaResponse(userQuery, sessionData = {}) {
  try {
    // Parse user response and determine action
    const parseResult = parseUserResponse(userQuery, sessionData);
    
    // Handle reset command
    if (parseResult.action === 'reset_all') {
      return {
        response: buildJSONResponse({}, userQuery, []),
        sessionData: {}
      };
    }
    
    // Handle school selection
    if (parseResult.action === 'set_school') {
      const updatedSessionData = { 
        ...sessionData,
        school: parseResult.school 
      };
      return {
        response: buildJSONResponse(updatedSessionData, userQuery, []),
        sessionData: updatedSessionData
      };
    }
    
    // Handle grade selection
    if (parseResult.action === 'set_grade') {
      const updatedSessionData = { 
        ...sessionData,
        school: sessionData.school, 
        grade: parseResult.grade 
      };
      return {
        response: buildJSONResponse(updatedSessionData, userQuery),
        sessionData: updatedSessionData
      };
    }
    
    // Handle interests selection
    if (parseResult.action === 'set_interests') {
      const updatedSessionData = {
        ...sessionData,
        school: sessionData.school,
        grade: sessionData.grade,
        interests: parseResult.interests
      };
      
      // Get clubs based on interests
      const interestKeywords = parseResult.interests.toLowerCase().split(/[,\s]+/).filter(w => w.length > 2);
      const clubs = getSchoolClubs(sessionData.school, {
        interests: interestKeywords,
        grade: sessionData.grade
      });
      
      // If no specific matches, get a diverse sample
      const finalClubs = clubs.length > 0 ? clubs.slice(0, 7) : getSchoolClubs(sessionData.school).slice(0, 5);
      
      return {
        response: buildJSONResponse(updatedSessionData, userQuery, finalClubs),
        sessionData: updatedSessionData
      };
    }
    
    // Default case - return current state
    return {
      response: buildJSONResponse(sessionData, userQuery, []),
      sessionData: sessionData
    };
    
  } catch (err) {
    console.error('[LLaMA] Error in getLlamaResponse:', err?.response?.status, err?.response?.data || err.message);
    return {
      response: JSON.stringify({
        success: true,
        message: "⚠️ Oops! I'm having trouble loading the clubs right now.\n👉 Please try again in a moment, or I can retry for you.",
        clubs: [],
        suggestions: ["🔄 Try Again", "🏫 Start Over"]
      }),
      sessionData: sessionData
    };
  }
}

module.exports = {
  getLlamaResponse,
  isResetCommand,
}
