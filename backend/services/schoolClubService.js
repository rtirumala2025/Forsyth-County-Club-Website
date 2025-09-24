const fs = require('fs');
const path = require('path');

// Import shared club data from frontend
const { allClubData, getClubsBySchool: getClubsBySchoolHelper, getAvailableSchools: getAvailableSchoolsHelper } = require('../../frontend/src/shared/data/clubData');

// Load the club data from shared location
let clubData = null;

function loadClubData() {
  if (clubData) return clubData;
  
  // Use the comprehensive shared club data
  clubData = allClubData;
  
  console.log(`✅ Loaded comprehensive club data for ${clubData.length} schools`);
  console.log(`📊 Total clubs: ${clubData.reduce((total, school) => total + (school.clubs?.length || 0), 0)}`);
  
  return clubData;
}

// Supported schools list for normalization
const SUPPORTED_SCHOOLS = getAvailableSchoolsHelper();

function normalizeSchoolName(input) {
  if (!input || typeof input !== 'string') return null;
  
  const normalized = input.toLowerCase().trim();
  
  // Direct match
  const exactMatch = SUPPORTED_SCHOOLS.find(school => 
    school.toLowerCase() === normalized
  );
  if (exactMatch) return exactMatch;
  
  // Partial match (handles "west forsyth", "east forsyth high", etc.)
  const partialMatch = SUPPORTED_SCHOOLS.find(school => {
    const schoolLower = school.toLowerCase();
    const schoolWords = schoolLower.split(' ');
    const inputWords = normalized.split(' ');
    
    // For directional schools (North, South, East, West), require the direction word
    const directions = ['north', 'south', 'east', 'west'];
    const schoolDirection = schoolWords.find(word => directions.includes(word));
    const inputDirection = inputWords.find(word => directions.includes(word));
    
    if (schoolDirection && inputDirection) {
      return schoolDirection === inputDirection && inputWords.includes('forsyth');
    }
    
    // For non-directional schools, check if key words match
    return inputWords.some(word => 
      schoolWords.includes(word) && word !== 'high' && word !== 'school' && word !== 'forsyth'
    );
  });
  
  return partialMatch || null;
}

function getAvailableSchools() {
  return getAvailableSchoolsHelper().sort();
}

function getSchoolData(schoolName) {
  const normalizedName = normalizeSchoolName(schoolName);
  if (!normalizedName) return null;
  
  const data = loadClubData();
  return data.find(schoolData => 
    schoolData.school.toLowerCase() === normalizedName.toLowerCase()
  );
}

function getSchoolClubs(schoolName, filters = {}) {
  const schoolData = getSchoolData(schoolName);
  if (!schoolData) return [];
  
  let clubs = schoolData.clubs || [];
  
  // Filter by category if provided
  if (filters.category) {
    const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
    clubs = clubs.filter(club => 
      categories.some(cat => 
        club.category && club.category.toLowerCase().includes(cat.toLowerCase())
      )
    );
  }
  
  // Filter by interests/keywords if provided
  if (filters.interests) {
    const interests = Array.isArray(filters.interests) ? filters.interests : [filters.interests];
    clubs = clubs.filter(club => {
      const searchText = `${club.name} ${club.description} ${club.category} ${club.activities?.join(' ') || ''}`.toLowerCase();
      return interests.some(interest => 
        searchText.includes(interest.toLowerCase())
      );
    });
  }
  
  return clubs;
}

function formatClubsForLLaMA(clubs, schoolName, userGrade = null) {
  if (!clubs || clubs.length === 0) {
    return `No clubs found matching your criteria at ${schoolName}.`;
  }
  
  let formatted = `Available clubs at ${schoolName}:\n\n`;
  
  clubs.forEach((club, index) => {
    formatted += `${index + 1}. **${club.name}**\n`;
    formatted += `   Category: ${club.category || 'General'}\n`;
    formatted += `   Description: ${club.description || 'No description available'}\n`;
    if (club.sponsor) formatted += `   Sponsor: ${club.sponsor}\n`;
    if (club.meetingFrequency) formatted += `   Meetings: ${club.meetingFrequency}\n`;
    if (club.requirements) formatted += `   Requirements: ${club.requirements}\n`;
    formatted += '\n';
  });
  
  return formatted;
}

// Conversation state management
const conversationStates = new Map();

function getConversationState(sessionId) {
  if (!conversationStates.has(sessionId)) {
    conversationStates.set(sessionId, {
      step: 'school_selection', // school_selection -> grade_selection -> interests -> recommendations
      school: null,
      grade: null,
      interests: [],
      conversationHistory: []
    });
  }
  return conversationStates.get(sessionId);
}

function updateConversationState(sessionId, updates) {
  const state = getConversationState(sessionId);
  Object.assign(state, updates);
  conversationStates.set(sessionId, state);
  return state;
}

function determineNextStep(userQuery, currentState) {
  const query = userQuery.toLowerCase();
  
  // Check if user mentioned a school
  const schools = getAvailableSchools();
  const mentionedSchool = schools.find(school => 
    query.includes(school.toLowerCase()) || 
    school.toLowerCase().includes(query.replace(/high school|school/gi, '').trim())
  );
  
  if (mentionedSchool && currentState.step === 'school_selection') {
    return {
      step: 'grade_selection',
      school: mentionedSchool,
      nextPrompt: `Great! You selected ${mentionedSchool}. What grade are you in? (9, 10, 11, or 12)`
    };
  }
  
  // Check if user mentioned a grade
  const gradeMatch = query.match(/\b(9|10|11|12|ninth|tenth|eleventh|twelfth|freshman|sophomore|junior|senior)\b/);
  if (gradeMatch && currentState.step === 'grade_selection') {
    let grade = gradeMatch[1];
    if (grade === 'ninth' || grade === 'freshman') grade = '9';
    if (grade === 'tenth' || grade === 'sophomore') grade = '10';
    if (grade === 'eleventh' || grade === 'junior') grade = '11';
    if (grade === 'twelfth' || grade === 'senior') grade = '12';
    
    return {
      step: 'interests',
      grade: grade,
      nextPrompt: `Perfect! You're in grade ${grade}. What types of clubs or activities are you interested in? For example: STEM, arts, leadership, sports, service, etc.`
    };
  }
  
  // If we have school and grade, we can make recommendations
  if (currentState.school && currentState.grade && currentState.step === 'interests') {
    return {
      step: 'recommendations',
      interests: extractInterests(query),
      nextPrompt: null // LLaMA will generate the recommendations
    };
  }
  
  return null;
}

function extractInterests(query) {
  const interests = [];
  const interestKeywords = {
    'STEM': ['stem', 'science', 'technology', 'engineering', 'math', 'robotics', 'coding', 'computer'],
    'Arts': ['art', 'arts', 'creative', 'music', 'drama', 'theater', 'dance', 'visual'],
    'Leadership': ['leadership', 'student government', 'beta', 'honor society', 'service'],
    'Sports': ['sports', 'athletic', 'fitness', 'recreation', 'physical'],
    'Service': ['service', 'volunteer', 'community', 'help', 'charity'],
    'Cultural': ['culture', 'cultural', 'language', 'international', 'diversity'],
    'Academic': ['academic', 'study', 'tutoring', 'honor', 'scholarship']
  };
  
  const query_lower = query.toLowerCase();
  
  for (const [category, keywords] of Object.entries(interestKeywords)) {
    if (keywords.some(keyword => query_lower.includes(keyword))) {
      interests.push(category);
    }
  }
  
  // Also extract specific words that might be interests
  const words = query_lower.split(/\s+/);
  interests.push(...words.filter(word => word.length > 3));
  
  return [...new Set(interests)]; // Remove duplicates
}

module.exports = {
  loadClubData,
  getAvailableSchools,
  getSchoolData,
  getSchoolClubs,
  formatClubsForLLaMA,
  getConversationState,
  updateConversationState,
  determineNextStep,
  extractInterests,
  normalizeSchoolName
};
