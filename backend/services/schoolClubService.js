const fs = require('fs');
const path = require('path');

// Club data loading state
let allClubData = [];
let loadAttempted = false;
let loadError = null;

function loadClubData() {
  if (loadAttempted) {
    if (loadError) throw loadError;
    return allClubData;
  }

  loadAttempted = true;
  console.log('🔍 Attempting to load club data...');
  
  try {
    // Try to load from frontend location first
    try {
      const frontendDataPath = path.resolve(__dirname, '../../frontend/src/shared/data/clubData.js');
      console.log(`📂 Attempting to load from: ${frontendDataPath}`);
      
      // Clear require cache to ensure fresh load
      delete require.cache[require.resolve(frontendDataPath)];
      
      const frontendModule = require(frontendDataPath);
      allClubData = frontendModule.allClubData || frontendModule.default?.allClubData || [];
      
      if (!Array.isArray(allClubData)) {
        throw new Error('Club data is not an array');
      }
      
      console.log(`✅ Successfully loaded club data for ${allClubData.length} schools`);
      console.log(`📊 Total clubs: ${allClubData.reduce((total, school) => 
        total + (Array.isArray(school.clubs) ? school.clubs.length : 0), 0)}`);
      
      return allClubData;
    } catch (frontendError) {
      console.warn('⚠️ Could not load frontend club data, trying fallback...', frontendError);
      
      // Fallback to local data file if available
      const localDataPath = path.resolve(__dirname, '../data/clubs.json');
      console.log(`🔍 Attempting to load from fallback: ${localDataPath}`);
      
      if (fs.existsSync(localDataPath)) {
        const rawData = fs.readFileSync(localDataPath, 'utf8');
        allClubData = JSON.parse(rawData);
        
        if (!Array.isArray(allClubData)) {
          throw new Error('Fallback club data is not an array');
        }
        
        console.log(`✅ Successfully loaded fallback club data for ${allClubData.length} schools`);
        return allClubData;
      }
      
      throw new Error('No club data available - frontend and fallback data not found');
    }
  } catch (error) {
    loadError = error;
    console.error('❌ Failed to load club data:', error);
    throw error;
  }
}

// Supported schools list for normalization
const SUPPORTED_SCHOOLS = (() => {
  try {
    return loadClubData().map(school => school.school).filter(Boolean);
  } catch (error) {
    console.error('❌ Error getting supported schools:', error);
    return [];
  }
})();

function normalizeSchoolName(input) {
  if (!input || typeof input !== 'string') {
    console.warn('⚠️ Invalid school name input:', input);
    return null;
  }
  
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
      schoolWords.includes(word) && 
      !['high', 'school', 'forsyth', 'academy', 'county'].includes(word)
    );
  });
  
  if (!partialMatch) {
    console.warn(`⚠️ Could not find matching school for: ${input}`);
  }
  
  return partialMatch || null;
}

function getAvailableSchools() {
  try {
    return [...SUPPORTED_SCHOOLS].sort();
  } catch (error) {
    console.error('❌ Error getting available schools:', error);
    return [];
  }
}

function getSchoolData(schoolName) {
  try {
    if (!schoolName) {
      console.warn('⚠️ No school name provided to getSchoolData');
      return null;
    }
    
    const normalizedSchool = normalizeSchoolName(schoolName);
    if (!normalizedSchool) {
      console.warn(`⚠️ Could not normalize school name: ${schoolName}`);
      return null;
    }
    
    const data = loadClubData();
    const schoolData = data.find(school => 
      school.school && school.school.toLowerCase() === normalizedSchool.toLowerCase()
    );
    
    if (!schoolData) {
      console.warn(`⚠️ No data found for school: ${normalizedSchool}`);
    }
    
    return schoolData || null;
  } catch (error) {
    console.error(`❌ Error getting school data for ${schoolName}:`, error);
    return null;
  }
}

function getSchoolClubs(schoolName, filters = {}) {
  try {
    console.log(`🔍 Getting clubs for school: ${schoolName}`);
    const schoolData = getSchoolData(schoolName);
    
    if (!schoolData || !schoolData.clubs) {
      console.warn(`⚠️ No clubs found for school: ${schoolName}`);
      return [];
    }
    
    let clubs = [...(schoolData.clubs || [])];
    
    // Apply filters if provided
    if (filters.category) {
      const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
      const categoryFilters = categories.map(cat => cat.toLowerCase());
      
      clubs = clubs.filter(club => 
        club.category && 
        categoryFilters.some(filter => 
          club.category.toLowerCase().includes(filter)
        )
      );
    }
    
    // Filter by interests/keywords if provided
    if (filters.interests) {
      const interests = Array.isArray(filters.interests) ? filters.interests : [filters.interests];
      const interestFilters = interests.map(i => i.toLowerCase());
      
      clubs = clubs.filter(club => {
        const searchText = `${club.name || ''} ${club.description || ''} ${club.category || ''} ${Array.isArray(club.activities) ? club.activities.join(' ') : ''}`.toLowerCase();
        return interestFilters.some(filter => searchText.includes(filter));
      });
    }
    
    console.log(`✅ Found ${clubs.length} clubs for ${schoolName}`);
    return clubs;
  } catch (error) {
    console.error(`❌ Error getting clubs for ${schoolName}:`, error);
    return [];
  }
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
