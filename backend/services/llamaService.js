const { getAvailableSchools, getSchoolClubs, normalizeSchoolName } = require('./schoolClubService');

function isResetCommand(query) {
  const resetKeywords = [
    'restart', 'reset', 'start over', 'change school', 'switch school', 
    'different school', 'new school', 'pick another school', 'go back'
  ];
  const lowerQuery = query.toLowerCase().trim();
  return resetKeywords.some(keyword => lowerQuery.includes(keyword));
}

function buildJSONResponse(sessionData, clubs = null) {
  try {
    console.log('[DEBUG] Building JSON response with session data:', JSON.stringify(sessionData, null, 2));
    
    // Get available schools with error handling
    let schools = [];
    try {
      schools = getAvailableSchools();
      console.log(`[DEBUG] Loaded ${schools.length} available schools`);
    } catch (schoolError) {
      console.error('[ERROR] Failed to load available schools:', schoolError);
      // Continue with empty schools array - we'll handle it gracefully
    }
    
    // Validate session data
    if (!sessionData) {
      console.error('[ERROR] No session data provided to buildJSONResponse');
      return JSON.stringify({
        success: false,
        suggestions: ["Start over"],
        error: 'missing_session_data'
      });
    }
    
    // Normalize school name if not already done
    if (sessionData.school) {
      const normalizedSchool = normalizeSchoolName(sessionData.school);
      if (!normalizedSchool) {
        console.error(`[ERROR] Invalid school name: ${sessionData.school}`);
        return JSON.stringify({
          success: false,
          message: `I couldn't find "${sessionData.school}" in our system. Please select your school from the list below:`,
          clubs: [],
          suggestions: schools,
          nextStep: 'school_selection',
          error: 'invalid_school_name'
        });
      }
      
      // Update session with normalized school name if different
      if (sessionData.school !== normalizedSchool) {
        console.log(`Normalized school name from "${sessionData.school}" to "${normalizedSchool}"`);
        sessionData.school = normalizedSchool;
      }
    }
    
    
    // Step 2: Ask for grade if school is set but grade is not
    if (!sessionData.grade) {
      console.log('No grade set - requesting grade selection');
      const schoolName = sessionData.school || 'your school';
      return JSON.stringify({
        success: true,
        message: `Awesome choice! ${schoolName} has some fantastic clubs. What grade are you currently in?`,
        clubs: [],
        suggestions: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
        nextStep: 'grade_selection'
      });
    }
  
    // Step 3: Ask for club categories (CRITICAL STEP)
    if (!sessionData.categories || (Array.isArray(sessionData.categories) && sessionData.categories.length === 0)) {
      console.log('No categories set - requesting category selection');
      return JSON.stringify({
        success: true,
        message: `Perfect! As a grade ${sessionData.grade} student at ${sessionData.school}, you have access to amazing opportunities. Which areas spark your interest? Feel free to pick multiple!`,
        clubs: [],
        suggestions: ["STEM", "Arts", "Leadership", "Sports", "Community Service", "Cultural/Diversity", "Academic"],
        nextStep: 'category_selection'
      });
    }
  
    // Step 4: Ask for activity type preference
    if (!sessionData.activityType) {
      console.log('No activity type set - requesting activity preference');
      const categoryText = Array.isArray(sessionData.categories) ? 
        sessionData.categories.join(' and ') : 
        (sessionData.categories || 'These');
      
      return JSON.stringify({
        success: true,
        message: `That's a great choice! ${categoryText} clubs offer so many possibilities. What kind of activities get you most excited?`,
        clubs: [],
        suggestions: ["Hands-on projects", "Academic competitions", "Arts/creativity", "Leadership/service", "Sports/fitness", "Social/cultural clubs"],
        nextStep: 'activity_preference'
      });
    }
  
    // Step 5: Ask for time commitment preference
    if (!sessionData.timeCommitment) {
      console.log('No time commitment set - requesting time preference');
      const activityType = sessionData.activityType || 'This activity';
      
      return JSON.stringify({
        success: true,
        message: `Nice! ${activityType} sounds like a perfect fit for you. Now, let's be realistic about time - how much can you commit weekly?`,
        clubs: [],
        suggestions: ["Low (1-2 hours/week)", "Medium (3-5 hours/week)", "High (6+ hours/week)"],
        nextStep: 'time_commitment'
      });
    }
  
    // Step 6: Ask for goal preference
    if (!sessionData.goal) {
      console.log('No goal set - requesting goal preference');
      const timeCommitment = sessionData.timeCommitment || 'This level of';
      
      return JSON.stringify({
        success: true,
        message: `Smart thinking! ${timeCommitment} commitment works well for many students. What's driving your interest in joining clubs?`,
        clubs: [],
        suggestions: ["Fun/social", "Resume/college", "Both"],
        nextStep: 'goal_preference'
      });
    }
  
    // Step 7: Ask for teamwork preference
    if (!sessionData.teamwork) {
      console.log('No teamwork preference set - requesting teamwork preference');
      const goalText = sessionData.goal ? 
        `${sessionData.goal} is a fantastic motivation` : 
        'Your goals are important to us';
      
      return JSON.stringify({
        success: true,
        message: `That makes total sense! ${goalText}. Last question - do you thrive in team settings or prefer working independently?`,
        clubs: [],
        suggestions: ["Team-focused", "Individual-focused", "Both"],
        nextStep: 'teamwork_preference'
      });
    }
  
    // Step 8: Provide personalized club recommendations
    // All preferences collected, now we can recommend clubs
    if (clubs === null) {
      console.log('[DEBUG] All preferences collected - triggering club matching');
      const schoolName = sessionData.school || 'your school';
      
      try {
        // Attempt to get clubs for the school
        const matchResult = matchClubsToPreferences(sessionData);
        console.log(`[DEBUG] Match result:`, matchResult);
        
        // Handle error response from matchClubsToPreferences
        if (matchResult && matchResult.error === true) {
          console.warn('[WARN] Club matching returned error:', matchResult.message);
          return JSON.stringify({
            success: false,
            message: matchResult.message,
            clubs: [],
            suggestions: matchResult.suggestions || ["Try again", "See All Schools"],
            error: 'club_matching_failed',
            nextStep: 'error'
          });
        }
        
        // Extract clubs from successful response
        clubs = matchResult && matchResult.clubs ? matchResult.clubs : matchResult;
        
        // Ensure clubs is an array
        if (!Array.isArray(clubs)) {
          console.error('[ERROR] Invalid clubs data type:', typeof clubs);
          return JSON.stringify({
            success: false,
            message: `I'm having trouble loading the clubs data. Please try again.`,
            clubs: [],
            suggestions: ["Try again", "See All Schools"],
            error: 'invalid_clubs_data',
            nextStep: 'error'
          });
        }
        
        console.log(`[DEBUG] Found ${clubs.length} matching clubs`);
        
        // If no clubs found, provide helpful message
        if (clubs.length === 0) {
          console.warn('[WARN] No matching clubs found for preferences');
          return JSON.stringify({
            success: true,
            message: `I couldn't find any clubs that match all your criteria at ${schoolName}. Try broadening your preferences or check back later!`,
            clubs: [],
            suggestions: ["Try different preferences", "See All Clubs"],
            nextStep: 'no_clubs_found'
          });
        }
      } catch (error) {
        console.error('[ERROR] Failed to match clubs to preferences:', error);
        return JSON.stringify({
          success: false,
          message: error.message || `I'm having trouble finding clubs right now. Please try again in a moment.`,
          clubs: [],
          suggestions: ["Try again", "See All Schools"],
          error: 'club_matching_failed',
          nextStep: 'error'
        });
      }
    }
  
    // Format clubs for the response with error handling
    console.log(`[DEBUG] Formatting ${clubs.length} clubs for display`);
    
    // Ensure we have valid clubs data
    if (!Array.isArray(clubs)) {
      console.error('[ERROR] Invalid clubs data:', typeof clubs);
      return JSON.stringify({
        success: false,
        message: "Oops! There was a problem loading club information. Please try again.",
        clubs: [],
        suggestions: ["Try again", "Return to start"],
        error: 'invalid_clubs_data',
        nextStep: 'error'
      });
    }
    
    // Take top 3 clubs, or all if less than 3
    const clubsToFormat = clubs.slice(0, 3);
    console.log(`[DEBUG] Showing top ${clubsToFormat.length} of ${clubs.length} clubs`);
    
    // Format each club with error handling
    const formattedClubs = [];
    
    for (let i = 0; i < clubsToFormat.length; i++) {
      const club = clubsToFormat[i];
      const index = i; // Use loop index for consistent numbering
      
      try {
        if (!club || typeof club !== 'object') {
          console.warn(`[WARN] Invalid club data at index ${index}:`, club);
          continue; // Skip invalid entries
        }
      
        // Generate school slug using proper mapping
        const getSchoolSlug = (schoolName) => {
          const schoolMappings = {
            'East Forsyth High School': 'east-forsyth',
            'West Forsyth High School': 'west-forsyth',
            'Lambert High School': 'lambert',
            'Forsyth Central High School': 'forsyth-central',
            'Denmark High School': 'denmark',
            'South Forsyth High School': 'south-forsyth',
            'North Forsyth High School': 'north-forsyth',
            'Alliance Academy for Innovation': 'alliance-academy'
          };
          return schoolMappings[schoolName] || schoolName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        };
        
        const schoolSlug = getSchoolSlug(sessionData?.school || 'forsyth');
        
        // Use the club ID directly as the slug (club data already has proper IDs)
        const clubSlug = club.id || `club-${index + 1}`;
        
        // Build structured club card with clear sections and bullet points
        const sections = [];
        
        // Club name as plain text header (appears only once at the top)
        sections.push(`${club.name}`);
        sections.push('');
        
        // Description section with bullet point
        if (club.description) {
          sections.push(`Description:`);
          sections.push(` ${club.description.trim()}`);
          sections.push('');
        }
        
        // Match Score section with bullet point
        sections.push(`Match Score:`);
        sections.push(` ${Math.round(club.matchScore || 0)}/100`);
        sections.push('');
        
        // Why This Club Fits You section with bullet points
        let reasons = [];
        if (Array.isArray(club.personalizedExplanation) && club.personalizedExplanation.length > 0) {
          reasons = club.personalizedExplanation.map(e => e.replace(/^[\-\*]\s*/, '').trim());
        } else if (Array.isArray(club.rawReasons) && club.rawReasons.length > 0) {
          reasons = club.rawReasons.slice(0, 4).map(r => r.replace(/^[\-\*]\s*/, '').trim());
        }
        
        if (reasons.length > 0) {
          sections.push(`Why This Club Fits You:`);
          reasons.forEach(reason => {
            sections.push(` ${reason}`);
          });
          sections.push('');
        }
        
        // Sponsor section with bullet point
        sections.push(`Sponsor:`);
        sections.push(` ${club.sponsor || 'Contact school for advisor'}`);
        sections.push('');
        
        // Category section with bullet point
        sections.push(`Category:`);
        sections.push(` ${club.category || 'General'}`);
        sections.push('');
        
        // Add separator line between clubs
        sections.push('---');
        
        // Join all sections with newlines
        const formattedDescription = sections.join('\n');
    
        // Add formatted club to the results
        formattedClubs.push({
          name: clubName,
          description: formattedDescription.trim(),
          sponsor: club.sponsor || 'Contact school for advisor',
          category: club.category || 'General',
          link: `/clubs/${schoolSlug}/${clubSlug}`,
          // Include additional metadata for debugging
          _metadata: {
            id: club.id,
            matchScore: club.matchScore,
            hasPersonalizedExplanation: Array.isArray(club.personalizedExplanation) && 
                                      club.personalizedExplanation.length > 0
          }
        });
      } catch (error) {
        console.error(`[ERROR] Error formatting club at index ${index}:`, error);
        // Continue to next club instead of failing the whole request
      }
    }

    // Personalized introduction
    let personalizedMessage = `Top Club Recommendations for ${sessionData.school || 'Your School'}\n\n`;
    
    // Build dynamic preference summary
    const preferences = [];
    if (sessionData.categories) {
      const categoryText = Array.isArray(sessionData.categories) ? 
        sessionData.categories.join(', ') : 
        sessionData.categories;
      preferences.push(`Interested in: ${categoryText}`);
    }
    
    if (sessionData.activityType) preferences.push(`Activity type: ${sessionData.activityType}`);
    if (sessionData.timeCommitment) preferences.push(`Time commitment: ${sessionData.timeCommitment}`);
    if (sessionData.goal) preferences.push(`Goal: ${sessionData.goal}`);
    if (sessionData.teamwork) preferences.push(`Teamwork style: ${sessionData.teamwork}`);
    
    if (preferences.length > 0) {
      personalizedMessage += preferences.join('  ');
    }
    
    personalizedMessage += '\n\n---\n\n';
    personalizedMessage += `Your Top ${Math.min(3, clubs.length)} Matches\n\n`;
    personalizedMessage += `Each club is scored based on how well it matches your preferences.`;
    
    console.log(`Returning ${formattedClubs.length} formatted clubs with enhanced messaging`);
    
    return JSON.stringify({
      success: true,
      message: personalizedMessage,
      clubs: formattedClubs,
      suggestions: [
        "More Clubs", 
        "Meeting Times", 
        "Different Categories",
        "Ask Questions",
        "Start Over"
      ]
    });
  } catch (error) {
    console.error('Error in buildJSONResponse:', error);
    return JSON.stringify({
      success: false,
      message: "Oops! I'm having trouble generating a response. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      suggestions: ["Try again", "Start over"]
    });
  }
}


function parseUserResponse(userQuery, sessionData) {
  const query = userQuery.toLowerCase().trim();
  
  // Create a copy of session data to avoid mutations - FIX: Update sessionData before returning action
  let updatedSessionData = { ...sessionData };
  
  console.log(' parseUserResponse - Input:', { userQuery, sessionData });
  
  // Check for reset commands first
  if (isResetCommand(query)) {
    return { action: 'reset_all', sessionData: {} };
  }
  
  // If no school set, try to detect school name using normalization
  if (!updatedSessionData.school) {
    const normalizedSchool = normalizeSchoolName(query);
    if (normalizedSchool) {
      updatedSessionData.school = normalizedSchool;
      console.log(' Setting school:', normalizedSchool);
      return { action: 'set_school', school: normalizedSchool, sessionData: updatedSessionData };
    }
    // If not a school name, treat as school selection from suggestions
    const schools = getAvailableSchools();
    const matchedSchool = schools.find(school => 
      school.toLowerCase().includes(query) || query.includes(school.toLowerCase())
    );
    if (matchedSchool) {
      updatedSessionData.school = matchedSchool;
      console.log(' Setting matched school:', matchedSchool);
      return { action: 'set_school', school: matchedSchool, sessionData: updatedSessionData };
    }
  }
  
  // If school set but no grade, try to detect grade
  if (updatedSessionData.school && !updatedSessionData.grade) {
    const gradeMatch = query.match(/\b(9|10|11|12|ninth|tenth|eleventh|twelfth|freshman|sophomore|junior|senior)\b/);
    if (gradeMatch) {
      let grade = gradeMatch[1];
      if (grade === 'ninth' || grade === 'freshman') grade = '9';
      if (grade === 'tenth' || grade === 'sophomore') grade = '10';
      if (grade === 'eleventh' || grade === 'junior') grade = '11';
      if (grade === 'twelfth' || grade === 'senior') grade = '12';
      updatedSessionData.grade = parseInt(grade);
      console.log(' Setting grade:', parseInt(grade));
      return { action: 'set_grade', grade: parseInt(grade), sessionData: updatedSessionData };
    }
    // Handle "Grade X" format
    if (query.includes('grade')) {
      const gradeNum = query.match(/grade\s*(\d+)/);
      if (gradeNum && gradeNum[1] && ['9', '10', '11', '12'].includes(gradeNum[1])) {
        updatedSessionData.grade = parseInt(gradeNum[1]);
        console.log(' Setting grade (Grade X format):', parseInt(gradeNum[1]));
        return { action: 'set_grade', grade: parseInt(gradeNum[1]), sessionData: updatedSessionData };
      }
    }
  }
  
  // If school and grade set but no categories, detect categories
  if (updatedSessionData.school && updatedSessionData.grade && (!updatedSessionData.categories || (Array.isArray(updatedSessionData.categories) && updatedSessionData.categories.length === 0))) {
    const validCategories = ['STEM', 'Arts', 'Leadership', 'Sports', 'Community Service', 'Cultural/Diversity', 'Academic'];
    
    // Check for direct category matches first
    const directMatches = validCategories.filter(cat => 
      query.toLowerCase().includes(cat.toLowerCase()) || 
      userQuery.toLowerCase().includes(cat.toLowerCase())
    );
    
    if (directMatches.length > 0) {
      updatedSessionData.categories = directMatches;
      console.log(' Setting categories (direct):', directMatches);
      return { action: 'set_categories', categories: directMatches, sessionData: updatedSessionData };
    }
    
    // Parse multiple categories from comma-separated input or keywords
    const categoryKeywords = {
      'stem': 'STEM',
      'science': 'STEM',
      'technology': 'STEM',
      'engineering': 'STEM',
      'math': 'STEM',
      'robotics': 'STEM',
      'coding': 'STEM',
      'computer': 'STEM',
      'arts': 'Arts',
      'art': 'Arts',
      'creative': 'Arts',
      'music': 'Arts',
      'drama': 'Arts',
      'theater': 'Arts',
      'dance': 'Arts',
      'leadership': 'Leadership',
      'leader': 'Leadership',
      'service': 'Community Service',
      'volunteer': 'Community Service',
      'community': 'Community Service',
      'sports': 'Sports',
      'athletic': 'Sports',
      'fitness': 'Sports',
      'cultural': 'Cultural/Diversity',
      'diversity': 'Cultural/Diversity',
      'culture': 'Cultural/Diversity',
      'academic': 'Academic',
      'study': 'Academic',
      'competition': 'Academic'
    };
    
    const categories = [];
    const queryParts = query.split(/[,\s]+/).filter(part => part.length > 2);
    
    for (const part of queryParts) {
      for (const [keyword, category] of Object.entries(categoryKeywords)) {
        if (part.includes(keyword) && !categories.includes(category)) {
          categories.push(category);
        }
      }
    }
    
    if (categories.length > 0) {
      updatedSessionData.categories = categories;
      console.log(' Setting categories (keywords):', categories);
      return { action: 'set_categories', categories, sessionData: updatedSessionData };
    }
    
    // Default: treat any input as a category selection
    if (query.length > 2) {
      updatedSessionData.categories = [userQuery];
      console.log(' Setting categories (default):', [userQuery]);
      return { action: 'set_categories', categories: [userQuery], sessionData: updatedSessionData };
    }
  }
  
  // If categories set but no activity type, detect activity type
  if (updatedSessionData.school && updatedSessionData.grade && updatedSessionData.categories && !updatedSessionData.activityType) {
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
        updatedSessionData.activityType = activityType;
        console.log(' Setting activity type (keyword):', activityType);
        return { action: 'set_activity_type', activityType, sessionData: updatedSessionData };
      }
    }
    
    // Default: treat input as activity type
    updatedSessionData.activityType = userQuery;
    console.log(' Setting activity type (default):', userQuery);
    return { action: 'set_activity_type', activityType: userQuery, sessionData: updatedSessionData };
  }
  
  // If activity type set but no time commitment, detect time commitment
  if (updatedSessionData.school && updatedSessionData.grade && updatedSessionData.categories && updatedSessionData.activityType && !updatedSessionData.timeCommitment) {
    if (query.includes('low') || query.includes('1-2')) {
      updatedSessionData.timeCommitment = 'Low';
      console.log('⏰ Setting time commitment:', 'Low');
      return { action: 'set_time_commitment', timeCommitment: 'Low', sessionData: updatedSessionData };
    }
    if (query.includes('medium') || query.includes('3-5')) {
      updatedSessionData.timeCommitment = 'Medium';
      console.log('⏰ Setting time commitment:', 'Medium');
      return { action: 'set_time_commitment', timeCommitment: 'Medium', sessionData: updatedSessionData };
    }
    if (query.includes('high') || query.includes('6+')) {
      updatedSessionData.timeCommitment = 'High';
      console.log('⏰ Setting time commitment:', 'High');
      return { action: 'set_time_commitment', timeCommitment: 'High', sessionData: updatedSessionData };
    }
    // Default: treat input as time commitment
    updatedSessionData.timeCommitment = userQuery;
    console.log('⏰ Setting time commitment (default):', userQuery);
    return { action: 'set_time_commitment', timeCommitment: userQuery, sessionData: updatedSessionData };
  }
  
  // If time commitment set but no goal, detect goal
  if (updatedSessionData.school && updatedSessionData.grade && updatedSessionData.categories && updatedSessionData.activityType && updatedSessionData.timeCommitment && !updatedSessionData.goal) {
    if (query.includes('fun') || query.includes('social')) {
      updatedSessionData.goal = 'Fun/social';
      console.log(' Setting goal:', 'Fun/social');
      return { action: 'set_goal', goal: 'Fun/social', sessionData: updatedSessionData };
    }
    if (query.includes('resume') || query.includes('college')) {
      updatedSessionData.goal = 'Resume/college';
      console.log(' Setting goal:', 'Resume/college');
      return { action: 'set_goal', goal: 'Resume/college', sessionData: updatedSessionData };
    }
    if (query.includes('both')) {
      updatedSessionData.goal = 'Both';
      console.log(' Setting goal:', 'Both');
      return { action: 'set_goal', goal: 'Both', sessionData: updatedSessionData };
    }
    // Default: treat input as goal
    updatedSessionData.goal = userQuery;
    console.log(' Setting goal (default):', userQuery);
    return { action: 'set_goal', goal: userQuery, sessionData: updatedSessionData };
  }
  
  // FIX: If goal set but no teamwork preference, detect teamwork AND trigger recommendations after
  if (updatedSessionData.school && updatedSessionData.grade && updatedSessionData.categories && updatedSessionData.activityType && updatedSessionData.timeCommitment && updatedSessionData.goal && !updatedSessionData.teamwork) {
    if (query.includes('team') || query.includes('group')) {
      updatedSessionData.teamwork = 'Team-focused';
      console.log(' Setting teamwork:', 'Team-focused');
    } else if (query.includes('individual') || query.includes('alone')) {
      updatedSessionData.teamwork = 'Individual-focused';
      console.log(' Setting teamwork:', 'Individual-focused');
    } else if (query.includes('both')) {
      updatedSessionData.teamwork = 'Both';
      console.log(' Setting teamwork:', 'Both');
    } else {
      // Default: treat input as teamwork preference
      updatedSessionData.teamwork = userQuery;
      console.log(' Setting teamwork (default):', userQuery);
    }
    
    // FIX: After setting teamwork (final preference), immediately trigger recommendations
    console.log(' All preferences collected! Triggering recommendations with sessionData:', updatedSessionData);
    return { action: 'recommend_clubs', sessionData: updatedSessionData };
  }
  
  // FIX: If all preferences are already collected, recommend clubs
  if (updatedSessionData.school && updatedSessionData.grade && updatedSessionData.categories && updatedSessionData.activityType && updatedSessionData.timeCommitment && updatedSessionData.goal && updatedSessionData.teamwork) {
    console.log(' All preferences already collected! Triggering recommendations with sessionData:', updatedSessionData);
    return { action: 'recommend_clubs', sessionData: updatedSessionData };
  }
  
  console.log(' Continuing conversation flow');
  return { action: 'continue', sessionData: updatedSessionData };
}

/**
 * Match clubs to user preferences with comprehensive error handling and fuzzy matching
 * @param {Object} sessionData - User's session data including school and preferences
 * @returns {Object} Response object with clubs or error information
 */
function matchClubsToPreferences(sessionData) {
  const debugInfo = {
    school: sessionData?.school || 'unknown',
    timestamp: new Date().toISOString(),
    steps: {}
  };
  
  try {
    console.log(' [DEBUG] Starting club matching with session data:', JSON.stringify(sessionData, null, 2));
    
    // 1. Validate session data
    if (!sessionData) {
      const error = new Error('No session data provided');
      error.code = 'INVALID_SESSION';
      throw error;
    }

    // 2. Validate school name
    if (!sessionData.school) {
      const error = new Error('No school specified in session data');
      error.code = 'MISSING_SCHOOL';
      throw error;
    }
    
    // 3. Get available schools and validate dataset
    console.log(' [DEBUG] Loading available schools...');
    const availableSchools = getAvailableSchools();
    
    if (!Array.isArray(availableSchools) || availableSchools.length === 0) {
      console.error(' [ERROR] No schools available in dataset.');
      return {
        success: false,
        error: true,
        message: "No school data is available. Please check that the clubs database is loaded correctly.",
        recommendations: []
      };
    }
    
    // 4. Log dataset statistics
    console.log(' [DEBUG] Dataset statistics:', {
      uniqueSchools: availableSchools.length,
      availableSchools: availableSchools
    });
    
    console.log(' [DEBUG] Requested school:', sessionData.school);
    
    // 5. Normalize and validate school name
    const normalizedSchool = normalizeSchoolName(sessionData.school);
    if (!normalizedSchool) {
      const errorMessage = `No clubs found for "${sessionData.school}". Available schools: ${availableSchools.join(', ')}`;
      console.warn(` [WARN] ${errorMessage}`);
      return {
        success: false,
        error: true,
        message: errorMessage,
        clubs: [],
        suggestions: availableSchools.map(school => ({
          text: school,
          action: `Select ${school}`
        }))
      };
    }
    
    console.log(` [DEBUG] Normalized school name: "${normalizedSchool}"`);
    debugInfo.school = normalizedSchool;
    debugInfo.steps.schoolValidation = 'PASSED';
    
    // 6. Get clubs for the normalized school
    console.log(` [DEBUG] Loading clubs for school: ${normalizedSchool}`);
    const startTime = Date.now();
    
    try {
      const schoolClubs = getSchoolClubs(normalizedSchool);
      const loadTime = Date.now() - startTime;
      
      debugInfo.steps.clubLoading = {
        status: 'SUCCESS',
        clubCount: Array.isArray(schoolClubs) ? schoolClubs.length : 0,
        durationMs: loadTime
      };
      
      // 7. Validate loaded clubs
      if (!Array.isArray(schoolClubs)) {
        const error = new Error(`Invalid clubs data type: ${typeof schoolClubs}. Expected array.`);
        error.code = 'INVALID_CLUBS_DATA';
        throw error;
      }
      
      if (schoolClubs.length === 0) {
        console.warn(` [WARN] No clubs found for school: ${normalizedSchool}`);
        const errorMessage = `No clubs found for "${normalizedSchool}". Available schools: ${availableSchools.join(', ')}`;
        return {
          success: false,
          error: true,
          message: errorMessage,
          clubs: [],
          suggestions: availableSchools.map(school => ({
            text: school,
            action: `Select ${school}`
          }))
        };
      }
      
      console.log(` [SUCCESS] Loaded ${schoolClubs.length} clubs for ${normalizedSchool} in ${loadTime}ms`);
      console.log(' [DEBUG] Sample club:', JSON.stringify(schoolClubs[0], null, 2));
      
      // 11. Filter clubs by categories if specified
      let filteredClubs = [...schoolClubs];
      
      if (sessionData.categories && Array.isArray(sessionData.categories) && sessionData.categories.length > 0) {
        console.log(' [DEBUG] Filtering by categories:', sessionData.categories);
        
        filteredClubs = schoolClubs.filter(club => {
          if (!club.category) return false;
          
          // Check if club's category matches any of the user's selected categories
          return sessionData.categories.some(userCategory => {
            const categoryMap = {
              'STEM': ['STEM', 'Technology', 'Science', 'Engineering', 'Math', 'Computer Science'],
              'Arts': ['Arts', 'Creative', 'Music', 'Drama', 'Theater', 'Visual Arts'],
              'Leadership': ['Leadership', 'Service', 'Student Government'],
              'Sports': ['Sports', 'Athletic', 'Fitness', 'Recreation'],
              'Community Service': ['Service', 'Community', 'Volunteer', 'Outreach'],
              'Cultural/Diversity': ['Cultural', 'Diversity', 'International', 'Language'],
              'Academic': ['Academic', 'Competition', 'Honor', 'Scholarship']
            };
            
            const mappedCategories = categoryMap[userCategory] || [userCategory];
            return mappedCategories.some(mapped => 
              club.category.toLowerCase().includes(mapped.toLowerCase()) ||
              mapped.toLowerCase().includes(club.category.toLowerCase())
            );
          });
        });
        
        console.log(` [DEBUG] Filtered to ${filteredClubs.length} clubs matching categories`);
      }
      
      // 12. Score and rank clubs based on preferences
      const scoredClubs = filteredClubs.map(club => {
        let score = 0;
        const reasons = [];
        
        // Base score for category match
        if (sessionData.categories && Array.isArray(sessionData.categories)) {
          const categoryMatch = sessionData.categories.some(userCat => {
            const categoryMap = {
              'STEM': ['STEM', 'Technology', 'Science', 'Engineering', 'Math'],
              'Arts': ['Arts', 'Creative', 'Music', 'Drama', 'Theater'],
              'Leadership': ['Leadership', 'Service', 'Student Government'],
              'Sports': ['Sports', 'Athletic', 'Fitness'],
              'Community Service': ['Service', 'Community', 'Volunteer'],
              'Cultural/Diversity': ['Cultural', 'Diversity', 'International'],
              'Academic': ['Academic', 'Competition', 'Honor']
            };
            
            const mappedCategories = categoryMap[userCat] || [userCat];
            return mappedCategories.some(mapped => 
              club.category && club.category.toLowerCase().includes(mapped.toLowerCase())
            );
          });
          
          if (categoryMatch) {
            score += 30;
            reasons.push(`Matches your interest in ${sessionData.categories.join(', ')}`);
          }
        }
        
        // Activity type matching
        if (sessionData.activityType && club.description) {
          const activityKeywords = {
            'Hands-on projects': ['build', 'create', 'make', 'design', 'construct', 'hands-on'],
            'Academic competitions': ['compete', 'competition', 'tournament', 'contest', 'academic'],
            'Arts/creativity': ['art', 'creative', 'music', 'drama', 'perform', 'artistic'],
            'Leadership/service': ['lead', 'service', 'volunteer', 'community', 'help'],
            'Sports/fitness': ['sport', 'athletic', 'fitness', 'physical', 'exercise'],
            'Social/cultural clubs': ['social', 'cultural', 'meet', 'friends', 'community']
          };
          
          const keywords = activityKeywords[sessionData.activityType] || [];
          const descriptionLower = club.description.toLowerCase();
          const matchingKeywords = keywords.filter(keyword => descriptionLower.includes(keyword));
          
          if (matchingKeywords.length > 0) {
            score += 20;
            reasons.push(`Aligns with your preference for ${sessionData.activityType.toLowerCase()}`);
          }
        }
        
        // Goal alignment
        if (sessionData.goal) {
          if (sessionData.goal === 'Resume/college' || sessionData.goal === 'Both') {
            const resumeKeywords = ['competition', 'award', 'scholarship', 'college', 'university', 'achievement'];
            const hasResumeValue = resumeKeywords.some(keyword => 
              club.description && club.description.toLowerCase().includes(keyword)
            );
            if (hasResumeValue) {
              score += 15;
              reasons.push('Great for college applications and resume building');
            }
          }
          
          if (sessionData.goal === 'Fun/social' || sessionData.goal === 'Both') {
            const socialKeywords = ['fun', 'social', 'friends', 'community', 'meet', 'enjoy'];
            const hasSocialValue = socialKeywords.some(keyword => 
              club.description && club.description.toLowerCase().includes(keyword)
            );
            if (hasSocialValue) {
              score += 15;
              reasons.push('Perfect for meeting new people and having fun');
            }
          }
        }
        
        // Time commitment matching
        if (sessionData.timeCommitment) {
          const timeScore = {
            'Low': 10,
            'Medium': 15,
            'High': 20
          };
          score += timeScore[sessionData.timeCommitment] || 10;
          reasons.push(`Fits your ${sessionData.timeCommitment.toLowerCase()} time commitment preference`);
        }
        
        // Teamwork preference
        if (sessionData.teamwork) {
          if (sessionData.teamwork === 'Team-focused' || sessionData.teamwork === 'Both') {
            const teamKeywords = ['team', 'group', 'collaborate', 'together', 'members'];
            const isTeamOriented = teamKeywords.some(keyword => 
              club.description && club.description.toLowerCase().includes(keyword)
            );
            if (isTeamOriented) {
              score += 10;
              reasons.push('Emphasizes teamwork and collaboration');
            }
          }
        }
        
        // Ensure minimum score and cap maximum
        score = Math.max(score, 25);
        score = Math.min(score, 95);
        
        return {
          ...club,
          matchScore: score,
          personalizedExplanation: reasons.slice(0, 4), // Limit to top 4 reasons
          rawReasons: reasons
        };
      });
      
      // 13. Sort by score and return top matches
      const rankedClubs = scoredClubs
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5); // Return top 5 matches
      
      // 14. Ensure score differentiation for top clubs
      if (rankedClubs.length > 1) {
        for (let i = 1; i < rankedClubs.length; i++) {
          if (rankedClubs[i].matchScore === rankedClubs[i-1].matchScore) {
            rankedClubs[i].matchScore = Math.max(rankedClubs[i].matchScore - (i * 2), 25);
          }
        }
      }
      
      console.log(` [SUCCESS] Ranked ${rankedClubs.length} clubs with scores:`, 
        rankedClubs.map(c => ({ name: c.name, score: c.matchScore })));
      
      return {
        success: true,
        clubs: rankedClubs,
        school: normalizedSchool
      };
      
    } catch (error) {
      debugInfo.steps.clubLoading = {
        status: 'ERROR',
        error: error.message,
        durationMs: Date.now() - startTime
      };
      throw error; // Re-throw to be caught by outer try-catch
    }
    
  } catch (error) {
    console.error(` [ERROR] Failed to match clubs for ${debugInfo.school}:`, error);
    
    // Log detailed debug info
    debugInfo.error = {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    
    console.debug(' [DEBUG] Match error details:', JSON.stringify(debugInfo, null, 2));
    
    // Return error response
    return {
      success: false,
      error: true,
      message: error.message || 'An error occurred while processing your request',
      code: error.code || 'PROCESSING_ERROR',
      clubs: []
    };
  }
}

function getLlamaResponse(userQuery, sessionData = {}) {
  console.log(' Starting getLlamaResponse with:', { userQuery, sessionData });
  console.log(' Session data keys:', Object.keys(sessionData));
  console.log(' School:', sessionData.school);
  console.log(' Grade:', sessionData.grade);
  
  try {
    // FIX: Parse user response to determine what action to take and get updated sessionData
    const parseResult = parseUserResponse(userQuery, sessionData);
    console.log(' Parse result:', parseResult);
    console.log(' Updated sessionData from parseResult:', parseResult.sessionData);
    
    // FIX: Use the updated sessionData from parseResult instead of creating our own copy
    const updatedSessionData = parseResult.sessionData || { ...sessionData };
    
    // FIX: Handle the recommend_clubs action immediately when detected
    if (parseResult.action === 'recommend_clubs') {
      console.log(' All preferences collected - matching clubs');
      console.log(' Final sessionData for matching:', JSON.stringify(updatedSessionData, null, 2));
      
      try {
        // Call matchClubsToPreferences with the complete sessionData
        const result = matchClubsToPreferences(updatedSessionData);
        
        // If we got an error response (object with success: false), return it directly
        if (result && result.success === false) {
          console.warn(` [WARN] Club matching returned error: ${result.message}`);
          return {
            response: JSON.stringify({
              success: false,
              message: result.message,
              clubs: [],
              suggestions: result.suggestions || [" Try again", " Start over"]
            }),
            sessionData: updatedSessionData
          };
        }
        
        // Extract clubs from successful response
        const clubs = result && result.clubs ? result.clubs : [];
        console.log(` Found ${clubs.length} matched clubs`);
        
        // Pass the matched clubs to buildJSONResponse for formatting
        const response = buildJSONResponse(updatedSessionData, clubs);
        return {
          response: response,
          sessionData: updatedSessionData
        };
      } catch (error) {
        console.error(' [ERROR] Failed to match clubs:', error);
        
        // Create a detailed error response
        const errorResponse = {
          success: false,
          message: " I'm having trouble loading the clubs. " + 
                  (error.code === 'NO_CLUBS_DATA' ? 'The clubs database appears to be empty. ' : '') +
                  (error.availableSchools ? `Available schools: ${error.availableSchools.join(', ')}` : ''),
          clubs: [],
          suggestions: [" Try again", " Start over"]
        };
        
        // Log detailed error info
        console.error(' [ERROR] Error details:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        
        return {
          response: JSON.stringify(errorResponse),
          sessionData: updatedSessionData
        };
      }
    }
    
    // FIX: For all other actions, generate response based on current session state
    const response = buildJSONResponse(updatedSessionData, null);
    
    console.log(' Generated response successfully');
    console.log(' Final updated session data:', updatedSessionData);
    
    return {
      response: response,
      sessionData: updatedSessionData
    };
    
  } catch (error) {
    console.error(' Error in getLlamaResponse:', error);
    console.error('Stack trace:', error.stack);
    
    // Return error response but keep session data intact
    const errorResponse = JSON.stringify({
      success: false,
      message: " Oops! I'm having trouble processing your request. Please try again.",
      suggestions: [" Try again", " Start over"]
    });
    
    return {
      response: errorResponse,
      sessionData: sessionData
    };
  }
}

// Helper function to ensure consistent error responses
/**
 * Create a consistent error response object
 * @param {string} message - User-friendly error message
 * @param {string} code - Error code for debugging
 * @param {Object} details - Additional error details
 * @returns {Object} Formatted error response
 */
function createErrorResponse(message, code = 'UNKNOWN_ERROR', details = {}) {
  const response = {
    success: false,
    message,
    error: {
      code,
      ...details,
      timestamp: new Date().toISOString()
    },
    clubs: [],
    suggestions: [' Try again', ' Start over']
  };
  
  // Only include stack trace in development
  if (process.env.NODE_ENV !== 'production' && details.stack) {
    response.error.stack = details.stack;
  }
  
  return response;
}

module.exports = {
  getLlamaResponse,
  isResetCommand,
  matchClubsToPreferences // Export for testing
};
