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

function buildJSONResponse(sessionData, userQuery = '', clubs = []) {
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
      message: `Great! You selected ${sessionData.school}. What grade are you in?`,
      clubs: [],
      suggestions: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"]
    });
  }
  
  // Step 3: Both school and grade are set - provide recommendations or ask for interests
  if (clubs.length === 0 && !userQuery.includes('STEM') && !userQuery.includes('Arts') && !userQuery.includes('Leadership')) {
    return JSON.stringify({
      success: true,
      message: `Perfect! You're in grade ${sessionData.grade} at ${sessionData.school}. What types of clubs are you interested in?`,
      clubs: [],
      suggestions: ["STEM", "Arts", "Leadership", "Sports", "Community Service", "Academic"]
    });
  }
  
  // Step 4: Provide club recommendations
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
      description: `${getCategoryEmoji(club.category)} ${club.description}`,
      sponsor: club.sponsor || 'Contact school for advisor',
      category: club.category || 'General',
      link: `/clubs/${schoolSlug}/${clubSlug}`
    };
  });
  
  if (formattedClubs.length === 0) {
    return JSON.stringify({
      success: true,
      message: `😔 I don't have specific clubs matching your interests at ${sessionData.school} right now. Would you like to explore other categories or restart?`,
      clubs: [],
      suggestions: ["STEM", "Arts", "Leadership", "Sports", "🔄 Restart"]
    });
  }
  
  return JSON.stringify({
    success: true,
    message: `Hi grade ${sessionData.grade} student! Here are some clubs you might enjoy at ${sessionData.school}:`,
    clubs: formattedClubs,
    suggestions: ["STEM", "Arts", "Leadership", "Sports", "Community Service", "Academic", "🔄 Restart"]
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
  
  // If both school and grade are set, this is an interests/recommendation query
  if (sessionData.school && sessionData.grade) {
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
      return buildJSONResponse({}, userQuery, []);
    }
    
    // Handle school selection
    if (parseResult.action === 'set_school') {
      return buildJSONResponse({ school: parseResult.school }, userQuery, []);
    }
    
    // Handle grade selection
    if (parseResult.action === 'set_grade') {
      return buildJSONResponse({ 
        school: sessionData.school, 
        grade: parseResult.grade 
      }, userQuery, []);
    }
    
    // If no school set, return school selection prompt
    if (!sessionData.school) {
      return buildJSONResponse(sessionData, userQuery, []);
    }
    
    // If no grade set, return grade selection prompt
    if (!sessionData.grade) {
      return buildJSONResponse(sessionData, userQuery, []);
    }
    
    // Both school and grade are set - make recommendations
    if (parseResult.action === 'recommend_clubs') {
      // Get clubs from the school's dataset
      const clubs = getSchoolClubs(sessionData.school, {
        interests: parseResult.interests.split(/[,\s]+/).filter(w => w.length > 2)
      });
      
      // If no clubs found, get all clubs from the school
      const allClubs = clubs.length > 0 ? clubs : getSchoolClubs(sessionData.school);
      
      return buildJSONResponse(sessionData, userQuery, allClubs);
    }
    
    // Default case - ask for interests
    return buildJSONResponse(sessionData, userQuery, []);
    
  } catch (err) {
    console.error('[LLaMA] Error calling OpenRouter:', err?.response?.status, err?.response?.data || err.message);
    return JSON.stringify({
      success: false,
      message: "😔 Sorry! I'm having trouble connecting right now. Please try again or restart.",
      clubs: [],
      suggestions: ["🔄 Restart"]
    });
  }
}

module.exports = {
  getLlamaResponse,
  isResetCommand,
}
