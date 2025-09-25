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
  
  // Step 7: Provide personalized club recommendations
  // All preferences collected, now we can recommend clubs
  if (clubs === null) {
    // This means we have all preferences but no clubs were provided
    // This should trigger the matching algorithm
    return JSON.stringify({
      success: true,
      message: `Excellent! Based on your preferences, let me find the perfect clubs for you at ${sessionData.school}...`,
      clubs: [],
      suggestions: ["🔄 Restart", "📋 See All Clubs"]
    });
  }
  
  const formattedClubs = clubs.map((club, index) => {
    // Generate school slug (remove "High School" and convert to lowercase with dashes)
    const schoolSlug = sessionData.school
      .replace(/\s+High\s+School/i, '')
      .toLowerCase()
      .replace(/\s+/g, '-');
    
    // Generate club slug (convert to lowercase with dashes)
    const clubSlug = (club.id || club.name)
      .toLowerCase()
      .replace(/\s+/g, '-');
    
    // Enhanced description with match reasons
    let enhancedDescription = club.description;
    if (club.matchReasons && club.matchReasons.length > 0) {
      enhancedDescription += `\n\n🎯 **Why this matches:** ${club.matchReasons.join(', ')}`;
    }
    if (club.matchScore) {
      enhancedDescription += `\n📊 **Match Score:** ${club.matchScore}/8`;
    }
    
    return {
      name: `${index + 1}. ${club.name}`,
      description: enhancedDescription,
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
    
    // Create personalized message based on preferences
    let personalizedMessage = `🎯 **Perfect matches for you at ${sessionData.school}!**\n\n`;
    personalizedMessage += `✨ **Your Profile:** ${sessionData.activityType}, ${sessionData.timeCommitment} commitment, ${sessionData.goal} focus, ${sessionData.teamwork} preference\n\n`;
    personalizedMessage += `Here are your top 3 personalized club recommendations:`;
    
    return JSON.stringify({
      success: true,
      message: personalizedMessage,
      clubs: formattedClubs,
      suggestions: ["📋 See More Clubs", "🔄 Restart", "🔍 Refine Preferences"]
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
  
  // If school and grade set but no activity type, detect activity type
  if (sessionData.school && sessionData.grade && !sessionData.activityType) {
    const activityKeywords = {
      'hands-on': 'Hands-on projects',
      'projects': 'Hands-on projects',
      'building': 'Hands-on projects',
      'making': 'Hands-on projects',
      'academic': 'Academic competitions',
      'competitions': 'Academic competitions',
      'compete': 'Academic competitions',
      'quiz': 'Academic competitions',
      'arts': 'Arts/creativity',
      'creative': 'Arts/creativity',
      'art': 'Arts/creativity',
      'music': 'Arts/creativity',
      'drama': 'Arts/creativity',
      'leadership': 'Leadership/service',
      'service': 'Leadership/service',
      'volunteer': 'Leadership/service',
      'community': 'Leadership/service',
      'sports': 'Sports/fitness',
      'fitness': 'Sports/fitness',
      'athletic': 'Sports/fitness',
      'social': 'Social/cultural clubs',
      'cultural': 'Social/cultural clubs',
      'friends': 'Social/cultural clubs'
    };
    
    for (const [keyword, activityType] of Object.entries(activityKeywords)) {
      if (query.includes(keyword)) {
        return { action: 'set_activity_type', activityType };
      }
    }
    
    // If no specific keywords found but user provided input that looks like an activity type
    const activityOptions = ['hands-on projects', 'academic competitions', 'arts/creativity', 'leadership/service', 'sports/fitness', 'social/cultural clubs'];
    const matchesActivityOption = activityOptions.some(option => 
      query.includes(option.toLowerCase()) || option.toLowerCase().includes(query)
    );
    
    if (matchesActivityOption || (query.length > 3 && !query.includes('hour') && !query.includes('time') && !query.includes('commitment'))) {
      return { action: 'set_activity_type', activityType: userQuery };
    }
  }
  
  // If activity type set but no time commitment, detect time commitment
  if (sessionData.school && sessionData.grade && sessionData.activityType && !sessionData.timeCommitment) {
    if (query.includes('low') || query.includes('1-2')) {
      return { action: 'set_time_commitment', timeCommitment: 'Low' };
    }
    if (query.includes('medium') || query.includes('3-5')) {
      return { action: 'set_time_commitment', timeCommitment: 'Medium' };
    }
    if (query.includes('high') || query.includes('6+')) {
      return { action: 'set_time_commitment', timeCommitment: 'High' };
    }
    // Default handling
    if (query.length > 2) {
      return { action: 'set_time_commitment', timeCommitment: userQuery };
    }
  }
  
  // If time commitment set but no goal, detect goal
  if (sessionData.school && sessionData.grade && sessionData.activityType && sessionData.timeCommitment && !sessionData.goal) {
    if (query.includes('fun') || query.includes('social')) {
      return { action: 'set_goal', goal: 'Fun/social' };
    }
    if (query.includes('resume') || query.includes('college')) {
      return { action: 'set_goal', goal: 'Resume/college' };
    }
    if (query.includes('both')) {
      return { action: 'set_goal', goal: 'Both' };
    }
    // Default handling
    if (query.length > 2) {
      return { action: 'set_goal', goal: userQuery };
    }
  }
  
  // If goal set but no teamwork preference, detect teamwork
  if (sessionData.school && sessionData.grade && sessionData.activityType && sessionData.timeCommitment && sessionData.goal && !sessionData.teamwork) {
    
    if (query.includes('team') || query.includes('group')) {
      return { action: 'set_teamwork', teamwork: 'Team-focused' };
    }
    if (query.includes('individual') || query.includes('alone')) {
      return { action: 'set_teamwork', teamwork: 'Individual-focused' };
    }
    if (query.includes('both')) {
      return { action: 'set_teamwork', teamwork: 'Both' };
    }
    // Default handling
    if (query.length > 2) {
      return { action: 'set_teamwork', teamwork: userQuery };
    }
  }
  
  // If all preferences are collected, recommend clubs
  if (sessionData.school && sessionData.grade && sessionData.activityType && sessionData.timeCommitment && sessionData.goal && sessionData.teamwork) {
    return { action: 'recommend_clubs', preferences: sessionData };
  }
  
  return { action: 'continue' };
}

function matchClubsToPreferences(sessionData) {
  const { getSchoolClubs } = require('./schoolClubService');
  
  // Get all clubs for the school
  const allClubs = getSchoolClubs(sessionData.school);
  
  
  // Enhanced club metadata mapping for better matching
  const clubMetadata = {
    'Robotics Club (FRC)': {
      activityType: 'Hands-on projects',
      timeCommitment: 'High',
      goal: ['Resume/college', 'Fun/social'],
      teamwork: 'Team-focused'
    },
    'STEM-E': {
      activityType: 'Hands-on projects',
      timeCommitment: 'Medium',
      goal: ['Resume/college', 'Both'],
      teamwork: 'Team-focused'
    },
    'Computer Science Club': {
      activityType: 'Hands-on projects',
      timeCommitment: 'Medium',
      goal: ['Resume/college', 'Fun/social'],
      teamwork: 'Both'
    },
    'Academic Bowl': {
      activityType: 'Academic competitions',
      timeCommitment: 'Medium',
      goal: ['Resume/college'],
      teamwork: 'Team-focused'
    },
    'Science Olympiad': {
      activityType: 'Academic competitions',
      timeCommitment: 'High',
      goal: ['Resume/college'],
      teamwork: 'Team-focused'
    },
    'Art Club': {
      activityType: 'Arts/creativity',
      timeCommitment: 'Low',
      goal: ['Fun/social', 'Both'],
      teamwork: 'Both'
    },
    'Drama Club': {
      activityType: 'Arts/creativity',
      timeCommitment: 'Medium',
      goal: ['Fun/social', 'Resume/college'],
      teamwork: 'Team-focused'
    },
    'BETA Club': {
      activityType: 'Leadership/service',
      timeCommitment: 'Medium',
      goal: ['Resume/college'],
      teamwork: 'Team-focused'
    },
    'National Honor Society': {
      activityType: 'Leadership/service',
      timeCommitment: 'Low',
      goal: ['Resume/college'],
      teamwork: 'Both'
    },
    'Anime Club': {
      activityType: 'Social/cultural clubs',
      timeCommitment: 'Low',
      goal: ['Fun/social'],
      teamwork: 'Both'
    }
  };
  
  // Score each club based on preference matching
  const scoredClubs = allClubs.map(club => {
    const metadata = clubMetadata[club.name] || {
      activityType: 'Social/cultural clubs',
      timeCommitment: 'Medium',
      goal: ['Fun/social'],
      teamwork: 'Both'
    };
    
    let score = 0;
    let matchReasons = [];
    
    // Activity type matching (highest weight)
    if (metadata.activityType === sessionData.activityType) {
      score += 3;
      matchReasons.push(`Perfect match for ${sessionData.activityType.toLowerCase()}`);
    } else if (sessionData.activityType === 'Hands-on projects' && metadata.activityType === 'Academic competitions') {
      score += 1;
      matchReasons.push('Similar analytical approach');
    }
    
    // Time commitment matching
    if (metadata.timeCommitment === sessionData.timeCommitment) {
      score += 2;
      matchReasons.push(`${sessionData.timeCommitment.toLowerCase()} time commitment`);
    } else if (
      (sessionData.timeCommitment === 'Medium' && (metadata.timeCommitment === 'Low' || metadata.timeCommitment === 'High')) ||
      (sessionData.timeCommitment === 'Low' && metadata.timeCommitment === 'Medium')
    ) {
      score += 1;
      matchReasons.push('Flexible time commitment');
    }
    
    // Goal matching
    const goalArray = Array.isArray(metadata.goal) ? metadata.goal : [metadata.goal];
    if (goalArray.includes(sessionData.goal) || goalArray.includes('Both') || sessionData.goal === 'Both') {
      score += 2;
      matchReasons.push(`Aligns with your ${sessionData.goal.toLowerCase()} goals`);
    }
    
    // Teamwork preference matching
    if (metadata.teamwork === sessionData.teamwork || metadata.teamwork === 'Both' || sessionData.teamwork === 'Both') {
      score += 1;
      matchReasons.push(`Matches your ${sessionData.teamwork.toLowerCase()} preference`);
    }
    
    return {
      ...club,
      matchScore: score,
      matchReasons: matchReasons,
      metadata: metadata
    };
  });
  
  // Sort by score and return top 3
  return scoredClubs
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
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
    
    // Handle activity type selection
    if (parseResult.action === 'set_activity_type') {
      const updatedSessionData = {
        ...sessionData,
        activityType: parseResult.activityType
      };
      return {
        response: buildJSONResponse(updatedSessionData, userQuery),
        sessionData: updatedSessionData
      };
    }
    
    // Handle time commitment selection
    if (parseResult.action === 'set_time_commitment') {
      const updatedSessionData = {
        ...sessionData,
        timeCommitment: parseResult.timeCommitment
      };
      return {
        response: buildJSONResponse(updatedSessionData, userQuery),
        sessionData: updatedSessionData
      };
    }
    
    // Handle goal selection
    if (parseResult.action === 'set_goal') {
      const updatedSessionData = {
        ...sessionData,
        goal: parseResult.goal
      };
      return {
        response: buildJSONResponse(updatedSessionData, userQuery),
        sessionData: updatedSessionData
      };
    }
    
    // Handle teamwork preference selection
    if (parseResult.action === 'set_teamwork') {
      const updatedSessionData = {
        ...sessionData,
        teamwork: parseResult.teamwork
      };
      
      // Since this is the final preference, immediately get club recommendations
      const matchedClubs = matchClubsToPreferences(updatedSessionData);
      
      return {
        response: buildJSONResponse(updatedSessionData, userQuery, matchedClubs),
        sessionData: updatedSessionData
      };
    }
    
    // Handle club recommendations with preference matching
    if (parseResult.action === 'recommend_clubs') {
      const matchedClubs = matchClubsToPreferences(sessionData);
      
      return {
        response: buildJSONResponse(sessionData, userQuery, matchedClubs),
        sessionData: sessionData
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
