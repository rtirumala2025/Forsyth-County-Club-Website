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
    console.log('📤 Building JSON response with session data:', JSON.stringify(sessionData, null, 2));
    
    const schools = getAvailableSchools();
    
    // Validate session data
    if (!sessionData) {
      console.error('❌ No session data provided');
      return JSON.stringify({
        success: false,
        message: "⚠️ Oops! I'm having trouble with your session. Let's start over.",
        suggestions: ["🔄 Start over"]
      });
    }
    
    // Step 1: Ask for school if not set
    if (!sessionData.school) {
      console.log('ℹ️ No school set - requesting school selection');
      return JSON.stringify({
        success: true,
        message: "🏫 Welcome to the Forsyth County Club Recommender! Which high school do you attend?",
        clubs: [],
        suggestions: schools,
        nextStep: 'school_selection'
      });
    }
    
    // Validate school name
    const normalizedSchool = normalizeSchoolName(sessionData.school);
    if (!normalizedSchool) {
      console.error(`❌ Invalid school name: ${sessionData.school}`);
      return JSON.stringify({
        success: false,
        message: `⚠️ I couldn't find "${sessionData.school}" in our system. Please select your school from the list below:`,
        clubs: [],
        suggestions: schools,
        nextStep: 'school_selection'
      });
    }
    
    // Update session with normalized school name
    if (sessionData.school !== normalizedSchool) {
      console.log(`ℹ️ Normalized school name from "${sessionData.school}" to "${normalizedSchool}"`);
      sessionData.school = normalizedSchool;
    }
    
    // Step 2: Ask for grade if school is set but grade is not
    if (!sessionData.grade) {
      console.log('ℹ️ No grade set - requesting grade selection');
      return JSON.stringify({
        success: true,
        message: `Awesome choice! ${sessionData.school} has some fantastic clubs. What grade are you currently in?`,
        clubs: [],
        suggestions: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
        nextStep: 'grade_selection'
      });
    }
  
    // Step 3: Ask for club categories (CRITICAL STEP)
    if (!sessionData.categories || (Array.isArray(sessionData.categories) && sessionData.categories.length === 0)) {
      console.log('ℹ️ No categories set - requesting category selection');
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
      console.log('ℹ️ No activity type set - requesting activity preference');
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
      console.log('ℹ️ No time commitment set - requesting time preference');
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
      console.log('ℹ️ No goal set - requesting goal preference');
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
      console.log('ℹ️ No teamwork preference set - requesting teamwork preference');
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
      console.log('ℹ️ All preferences collected - triggering club matching');
      const schoolName = sessionData.school || 'your school';
      
      return JSON.stringify({
        success: true,
        message: `Excellent! Based on your preferences, let me find the perfect clubs for you at ${schoolName}...`,
        clubs: [],
        suggestions: ["🔄 Restart", "📋 See All Clubs"],
        nextStep: 'finding_clubs'
      });
    }
  
    // FIX: Format exactly 3 clubs for the response when clubs are provided
    console.log(`🎯 Formatting ${clubs.length} clubs for display`);
    
    // FIX: Ensure we only show exactly 3 clubs
    const clubsToFormat = clubs.slice(0, 3);
    console.log(`📋 Showing top ${clubsToFormat.length} clubs`);
    
    const formattedClubs = clubsToFormat.map((club, index) => {
      if (!club || typeof club !== 'object') {
        console.warn('⚠️ Invalid club data:', club);
        return null;
      }
      
      try {
        // Generate school slug (remove "High School" and convert to lowercase with dashes)
        const schoolSlug = (sessionData.school || '')
          .replace(/\s+High\s+School/i, '')
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-');
        
        // Generate club slug (convert to lowercase with dashes)
        const clubName = club.name || 'unnamed-club';
        const clubSlug = (club.id || clubName)
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-');
        
        // FIX: Create clean bullet point formatting with match score, sponsor, and category
        let formattedDescription = `${club.description || 'No description available'}\n\n`;
        
        // Match Score Section - FIX: Always show match score prominently
        if (typeof club.matchScore === 'number') {
          formattedDescription += `📊 **Match Score: ${Math.round(club.matchScore)}/100**\n\n`;
        }
        
        // FIX: Show sponsor and category prominently
        formattedDescription += `👨‍🏫 **Sponsor:** ${club.sponsor || 'Contact school for advisor'}\n`;
        formattedDescription += `🏷️ **Category:** ${club.category || 'General'}\n\n`;
        
        // Personalized Explanation Section - FIX: Use bullet points
        if (Array.isArray(club.personalizedExplanation) && club.personalizedExplanation.length > 0) {
          formattedDescription += `🎯 **Why This Club Fits You:**\n`;
          club.personalizedExplanation.forEach(explanation => {
            if (explanation) {
              formattedDescription += `• ${explanation}\n`;
            }
          });
          formattedDescription += `\n`;
        } else if (club.rawReasons && Array.isArray(club.rawReasons) && club.rawReasons.length > 0) {
          // Fallback to raw reasons if personalized explanation isn't available
          formattedDescription += `🎯 **Why This Club Fits You:**\n`;
          club.rawReasons.forEach(reason => {
            if (reason) {
              formattedDescription += `• ${reason}\n`;
            }
          });
          formattedDescription += `\n`;
        }
    
        return {
          name: `${index + 1}. ${clubName}`,
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
        };
      } catch (error) {
        console.error(`❌ Error formatting club ${club.name || 'unknown'}:`, error);
        return null;
      }
    }).filter(club => club !== null); // Remove any null entries

    // FIX: Create the response object with exactly 3 club recommendations
    const categoryText = Array.isArray(sessionData.categories) ? 
      sessionData.categories.join(' and ') : 
      (sessionData.categories || 'your interests');
    
    let personalizedMessage = `🎉 **Fantastic! I found your perfect matches at ${sessionData.school || 'your school'}!**\n\n`;
    personalizedMessage += `Based on your love for **${categoryText}**`;
    
    if (sessionData.activityType) {
      personalizedMessage += `, preference for **${sessionData.activityType}**`;
    }
    if (sessionData.timeCommitment) {
      personalizedMessage += `, **${sessionData.timeCommitment.toLowerCase()}** time commitment`;
    }
    if (sessionData.goal) {
      personalizedMessage += `, **${sessionData.goal.toLowerCase()}** goals`;
    }
    if (sessionData.teamwork) {
      personalizedMessage += `, and **${sessionData.teamwork.toLowerCase()}** style`;
    }
    
    personalizedMessage += `, here are your top 3 personalized recommendations:\n\n`;
    personalizedMessage += `*Each club has been carefully analyzed and scored based on how well it matches your unique preferences.*`;
    
    console.log(`✅ Returning ${formattedClubs.length} formatted clubs`);
    
    return JSON.stringify({
      success: true,
      message: personalizedMessage,
      clubs: formattedClubs,
      suggestions: [
        "🔍 See More Clubs", 
        "📅 Meeting Times & Details", 
        "🎯 Explore Another Category",
        "💬 Ask Questions About These Clubs",
        "🔄 Start Over"
      ]
    });
  } catch (error) {
    console.error('❌ Error in buildJSONResponse:', error);
    return JSON.stringify({
      success: false,
      message: "⚠️ Oops! I'm having trouble generating a response. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      suggestions: ["🔄 Try again", "🏠 Start over"]
    });
  }
}


function parseUserResponse(userQuery, sessionData) {
  const query = userQuery.toLowerCase().trim();
  
  // Create a copy of session data to avoid mutations - FIX: Update sessionData before returning action
  let updatedSessionData = { ...sessionData };
  
  console.log('🔍 parseUserResponse - Input:', { userQuery, sessionData });
  
  // Check for reset commands first
  if (isResetCommand(query)) {
    return { action: 'reset_all', sessionData: {} };
  }
  
  // If no school set, try to detect school name using normalization
  if (!updatedSessionData.school) {
    const normalizedSchool = normalizeSchoolName(query);
    if (normalizedSchool) {
      updatedSessionData.school = normalizedSchool;
      console.log('🏫 Setting school:', normalizedSchool);
      return { action: 'set_school', school: normalizedSchool, sessionData: updatedSessionData };
    }
    // If not a school name, treat as school selection from suggestions
    const schools = getAvailableSchools();
    const matchedSchool = schools.find(school => 
      school.toLowerCase().includes(query) || query.includes(school.toLowerCase())
    );
    if (matchedSchool) {
      updatedSessionData.school = matchedSchool;
      console.log('🏫 Setting matched school:', matchedSchool);
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
      console.log('📚 Setting grade:', parseInt(grade));
      return { action: 'set_grade', grade: parseInt(grade), sessionData: updatedSessionData };
    }
    // Handle "Grade X" format
    if (query.includes('grade')) {
      const gradeNum = query.match(/grade\s*(\d+)/);
      if (gradeNum && gradeNum[1] && ['9', '10', '11', '12'].includes(gradeNum[1])) {
        updatedSessionData.grade = parseInt(gradeNum[1]);
        console.log('📚 Setting grade (Grade X format):', parseInt(gradeNum[1]));
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
      console.log('🎯 Setting categories (direct):', directMatches);
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
      console.log('🎯 Setting categories (keywords):', categories);
      return { action: 'set_categories', categories, sessionData: updatedSessionData };
    }
    
    // Default: treat any input as a category selection
    if (query.length > 2) {
      updatedSessionData.categories = [userQuery];
      console.log('🎯 Setting categories (default):', [userQuery]);
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
        console.log('🎨 Setting activity type (keyword):', activityType);
        return { action: 'set_activity_type', activityType, sessionData: updatedSessionData };
      }
    }
    
    // Default: treat input as activity type
    updatedSessionData.activityType = userQuery;
    console.log('🎨 Setting activity type (default):', userQuery);
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
      console.log('🎯 Setting goal:', 'Fun/social');
      return { action: 'set_goal', goal: 'Fun/social', sessionData: updatedSessionData };
    }
    if (query.includes('resume') || query.includes('college')) {
      updatedSessionData.goal = 'Resume/college';
      console.log('🎯 Setting goal:', 'Resume/college');
      return { action: 'set_goal', goal: 'Resume/college', sessionData: updatedSessionData };
    }
    if (query.includes('both')) {
      updatedSessionData.goal = 'Both';
      console.log('🎯 Setting goal:', 'Both');
      return { action: 'set_goal', goal: 'Both', sessionData: updatedSessionData };
    }
    // Default: treat input as goal
    updatedSessionData.goal = userQuery;
    console.log('🎯 Setting goal (default):', userQuery);
    return { action: 'set_goal', goal: userQuery, sessionData: updatedSessionData };
  }
  
  // FIX: If goal set but no teamwork preference, detect teamwork AND trigger recommendations after
  if (updatedSessionData.school && updatedSessionData.grade && updatedSessionData.categories && updatedSessionData.activityType && updatedSessionData.timeCommitment && updatedSessionData.goal && !updatedSessionData.teamwork) {
    if (query.includes('team') || query.includes('group')) {
      updatedSessionData.teamwork = 'Team-focused';
      console.log('👥 Setting teamwork:', 'Team-focused');
    } else if (query.includes('individual') || query.includes('alone')) {
      updatedSessionData.teamwork = 'Individual-focused';
      console.log('👥 Setting teamwork:', 'Individual-focused');
    } else if (query.includes('both')) {
      updatedSessionData.teamwork = 'Both';
      console.log('👥 Setting teamwork:', 'Both');
    } else {
      // Default: treat input as teamwork preference
      updatedSessionData.teamwork = userQuery;
      console.log('👥 Setting teamwork (default):', userQuery);
    }
    
    // FIX: After setting teamwork (final preference), immediately trigger recommendations
    console.log('🎉 All preferences collected! Triggering recommendations with sessionData:', updatedSessionData);
    return { action: 'recommend_clubs', sessionData: updatedSessionData };
  }
  
  // FIX: If all preferences are already collected, recommend clubs
  if (updatedSessionData.school && updatedSessionData.grade && updatedSessionData.categories && updatedSessionData.activityType && updatedSessionData.timeCommitment && updatedSessionData.goal && updatedSessionData.teamwork) {
    console.log('🎉 All preferences already collected! Triggering recommendations with sessionData:', updatedSessionData);
    return { action: 'recommend_clubs', sessionData: updatedSessionData };
  }
  
  console.log('➡️ Continuing conversation flow');
  return { action: 'continue', sessionData: updatedSessionData };
}

function matchClubsToPreferences(sessionData) {
  console.log('🔍 Starting club matching with session data:', JSON.stringify(sessionData, null, 2));
  
  if (!sessionData || !sessionData.school) {
    console.error('❌ No school specified in session data');
    return [];
  }
  
  // Get all clubs for the school with error handling
  let allClubs = [];
  try {
    allClubs = getSchoolClubs(sessionData.school);
    console.log(`✅ Loaded ${allClubs.length} clubs for ${sessionData.school}`);
    
    if (!Array.isArray(allClubs) || allClubs.length === 0) {
      console.warn(`⚠️ No clubs found for school: ${sessionData.school}`);
      return [];
    }
  } catch (error) {
    console.error(`❌ Error loading clubs for ${sessionData.school}:`, error);
    return [];
  }
  
  // Deep club analysis with evidence-based matching
  const clubAnalysis = {
    'Robotics Club (FRC)': {
      activityType: 'Hands-on projects',
      timeCommitment: 'High',
      goal: ['Resume/college', 'Fun/social'],
      teamwork: 'Team-focused',
      skills: ['engineering', 'programming', 'problem-solving', 'competition'],
      uniqueAspects: ['national competitions', 'real robot building', 'FIRST program prestige'],
      evidence: 'designing, building, and programming robots to compete in regional and national events'
    },
    'STEM-E': {
      activityType: 'Hands-on projects',
      timeCommitment: 'Medium',
      goal: ['Resume/college', 'Both'],
      teamwork: 'Team-focused',
      skills: ['entrepreneurship', 'innovation', 'project management', 'real-world application'],
      uniqueAspects: ['business skills', 'solving real problems', 'student-led teams'],
      evidence: 'hands-on STEM + entrepreneurship projects to solve real-world problems'
    },
    'Computer Science Club': {
      activityType: 'Hands-on projects',
      timeCommitment: 'Medium',
      goal: ['Resume/college', 'Fun/social'],
      teamwork: 'Both',
      skills: ['coding', 'software development', 'technical skills', 'career prep'],
      uniqueAspects: ['internship preparation', 'coding competitions', 'flexible individual/team work'],
      evidence: 'learn coding, work on projects, and prepare for competitions and internships'
    },
    'Academic Bowl': {
      activityType: 'Academic competitions',
      timeCommitment: 'Medium',
      goal: ['Resume/college'],
      teamwork: 'Team-focused',
      skills: ['quick thinking', 'broad knowledge', 'competitive spirit', 'teamwork'],
      uniqueAspects: ['fast-paced competition', 'trivia mastery', 'team strategy'],
      evidence: 'competitive academic knowledge testing in team format'
    },
    'Science Olympiad': {
      activityType: 'Academic competitions',
      timeCommitment: 'High',
      goal: ['Resume/college'],
      teamwork: 'Team-focused',
      skills: ['scientific knowledge', 'laboratory skills', 'competition strategy', 'specialization'],
      uniqueAspects: ['multiple science events', 'state/national competition', 'specialized roles'],
      evidence: 'competitive science events requiring deep subject knowledge and lab skills'
    },
    'Art Club': {
      activityType: 'Arts/creativity',
      timeCommitment: 'Low',
      goal: ['Fun/social', 'Both'],
      teamwork: 'Both',
      skills: ['creativity', 'artistic expression', 'visual arts', 'relaxation'],
      uniqueAspects: ['stress relief', 'creative outlet', 'flexible participation'],
      evidence: 'creative artistic expression and skill development in visual arts'
    },
    'Drama Club': {
      activityType: 'Arts/creativity',
      timeCommitment: 'Medium',
      goal: ['Fun/social', 'Resume/college'],
      teamwork: 'Team-focused',
      skills: ['performance', 'public speaking', 'collaboration', 'confidence building'],
      uniqueAspects: ['stage performance', 'character development', 'audience engagement'],
      evidence: 'theatrical performances requiring memorization, character work, and teamwork'
    },
    'BETA Club': {
      activityType: 'Leadership/service',
      timeCommitment: 'Medium',
      goal: ['Resume/college'],
      teamwork: 'Team-focused',
      skills: ['leadership', 'community service', 'organization', 'character development'],
      uniqueAspects: ['service hours', 'leadership opportunities', 'character recognition'],
      evidence: 'community service projects and leadership development activities'
    },
    'National Honor Society': {
      activityType: 'Leadership/service',
      timeCommitment: 'Low',
      goal: ['Resume/college'],
      teamwork: 'Both',
      skills: ['academic excellence', 'service', 'leadership', 'character'],
      uniqueAspects: ['prestigious recognition', 'scholarship opportunities', 'honor cord'],
      evidence: 'recognition of academic achievement combined with service and leadership'
    },
    'Anime Club': {
      activityType: 'Social/cultural clubs',
      timeCommitment: 'Low',
      goal: ['Fun/social'],
      teamwork: 'Both',
      skills: ['cultural appreciation', 'discussion', 'community building', 'relaxation'],
      uniqueAspects: ['shared interests', 'casual atmosphere', 'cultural exploration'],
      evidence: 'discussion and appreciation of Japanese animation and culture'
    }
  };
  
  // Filter clubs by categories first
  const categoryFilteredClubs = allClubs.filter(club => {
    if (!sessionData.categories || sessionData.categories.length === 0) {
      return true; // No category filter
    }
    
    // Check if club's category matches any of the user's selected categories
    const clubCategory = club.category || 'General';
    return sessionData.categories.some(userCategory => {
      // Map user categories to club categories
      const categoryMap = {
        'STEM': ['STEM', 'Technology', 'Science'],
        'Arts': ['Arts', 'Creative', 'Music', 'Drama'],
        'Leadership': ['Leadership', 'Service'],
        'Sports': ['Sports', 'Athletic', 'Fitness'],
        'Community Service': ['Service', 'Community', 'Volunteer'],
        'Cultural/Diversity': ['Cultural', 'Diversity', 'International'],
        'Academic': ['Academic', 'Competition', 'Honor']
      };
      
      const mappedCategories = categoryMap[userCategory] || [userCategory];
      return mappedCategories.some(mapped => 
        clubCategory.toLowerCase().includes(mapped.toLowerCase()) ||
        mapped.toLowerCase().includes(clubCategory.toLowerCase())
      );
    });
  });
  
  // Advanced scoring algorithm with personalized analysis
  const scoredClubs = categoryFilteredClubs.map(club => {
    const analysis = clubAnalysis[club.name] || {
      activityType: 'Social/cultural clubs',
      timeCommitment: 'Medium',
      goal: ['Fun/social'],
      teamwork: 'Both',
      skills: ['general participation'],
      uniqueAspects: ['social interaction'],
      evidence: 'club participation and community building'
    };
    
    let score = 0;
    const personalizedReasons = [];
    const evidencePoints = [];
    
    // Category matching with nuanced scoring (0-25 points)
    if (sessionData.categories && sessionData.categories.length > 0) {
      const clubCategory = club.category || 'General';
      let categoryScore = 0;
      
      sessionData.categories.forEach(userCategory => {
        const categoryMap = {
          'STEM': ['STEM', 'Technology', 'Science'],
          'Arts': ['Arts', 'Creative', 'Music', 'Drama'],
          'Leadership': ['Leadership', 'Service'],
          'Sports': ['Sports', 'Athletic', 'Fitness'],
          'Community Service': ['Service', 'Community', 'Volunteer'],
          'Cultural/Diversity': ['Cultural', 'Diversity', 'International'],
          'Academic': ['Academic', 'Competition', 'Honor']
        };
        
        const mappedCategories = categoryMap[userCategory] || [userCategory];
        if (mappedCategories.some(mapped => clubCategory.toLowerCase().includes(mapped.toLowerCase()))) {
          categoryScore += 25;
          personalizedReasons.push(`Directly matches your ${userCategory} interests`);
        }
      });
      
      score += Math.min(categoryScore, 25); // Cap at 25 points
    }
    
    // Activity type matching with evidence (0-20 points)
    if (analysis.activityType === sessionData.activityType) {
      score += 20;
      evidencePoints.push(`Perfect for ${sessionData.activityType.toLowerCase()} - ${analysis.evidence}`);
    } else if (sessionData.activityType === 'Hands-on projects' && analysis.activityType === 'Academic competitions') {
      score += 12;
      evidencePoints.push(`Great analytical challenge - ${analysis.evidence}`);
    } else if (sessionData.activityType === 'Leadership/service' && analysis.activityType === 'Arts/creativity') {
      score += 8;
      evidencePoints.push(`Develops leadership through creative collaboration - ${analysis.evidence}`);
    }
    
    // Time commitment realistic matching (0-15 points)
    const timeMap = { 'Low': 1, 'Medium': 2, 'High': 3 };
    const userTime = timeMap[sessionData.timeCommitment];
    const clubTime = timeMap[analysis.timeCommitment];
    
    if (userTime === clubTime) {
      score += 15;
      personalizedReasons.push(`Perfect ${sessionData.timeCommitment.toLowerCase()} time commitment match`);
    } else if (Math.abs(userTime - clubTime) === 1) {
      score += 10;
      personalizedReasons.push(`Manageable time commitment (${analysis.timeCommitment.toLowerCase()} vs your ${sessionData.timeCommitment.toLowerCase()} preference)`);
    } else {
      score += 3;
      personalizedReasons.push(`Different time commitment but still doable`);
    }
    
    // Goal alignment with depth (0-15 points)
    const goalArray = Array.isArray(analysis.goal) ? analysis.goal : [analysis.goal];
    if (goalArray.includes(sessionData.goal)) {
      score += 15;
      personalizedReasons.push(`Directly supports your ${sessionData.goal.toLowerCase()} goals`);
    } else if (goalArray.includes('Both') || sessionData.goal === 'Both') {
      score += 12;
      personalizedReasons.push(`Versatile club supporting multiple goals including yours`);
    } else {
      score += 5;
      personalizedReasons.push(`Different primary goal but still valuable`);
    }
    
    // Teamwork style matching (0-10 points)
    if (analysis.teamwork === sessionData.teamwork) {
      score += 10;
      personalizedReasons.push(`Perfect ${sessionData.teamwork.toLowerCase()} environment`);
    } else if (analysis.teamwork === 'Both' || sessionData.teamwork === 'Both') {
      score += 8;
      personalizedReasons.push(`Flexible teamwork style accommodating your preference`);
    } else {
      score += 4;
      personalizedReasons.push(`Different teamwork style but good growth opportunity`);
    }
    
    // Unique aspects bonus (0-15 points)
    let uniqueBonus = 0;
    analysis.uniqueAspects.forEach(aspect => {
      if (sessionData.goal === 'Resume/college' && aspect.includes('competition')) uniqueBonus += 5;
      if (sessionData.goal === 'Fun/social' && aspect.includes('social')) uniqueBonus += 5;
      if (sessionData.activityType === 'Hands-on projects' && aspect.includes('building')) uniqueBonus += 5;
    });
    score += Math.min(uniqueBonus, 15);
    
    // Create personalized explanation highlighting different aspects
    const explanation = createPersonalizedExplanation(club, analysis, sessionData, personalizedReasons, evidencePoints);
    
    return {
      ...club,
      matchScore: Math.round(score),
      personalizedExplanation: explanation,
      analysis: analysis,
      rawReasons: personalizedReasons
    };
  });
  
  // Ensure variety in recommendations - not all from same narrow field
  const sortedClubs = scoredClubs.sort((a, b) => b.matchScore - a.matchScore);
  const diverseRecommendations = ensureVariety(sortedClubs, sessionData);
  
  return diverseRecommendations.slice(0, 3);
}

function createPersonalizedExplanation(club, analysis, sessionData) {
  const explanations = [];
  
  // Highlight unique aspects based on user preferences
  if (sessionData.goal === 'Resume/college') {
    if (analysis.uniqueAspects.includes('national competitions')) {
      explanations.push("🏆 **Competition Excellence**: National-level competitions look amazing on college applications");
    } else if (analysis.uniqueAspects.includes('leadership opportunities')) {
      explanations.push("👑 **Leadership Development**: Build the leadership experience colleges love to see");
    } else if (analysis.uniqueAspects.includes('prestigious recognition')) {
      explanations.push("🎖️ **Academic Prestige**: This recognition carries significant weight with admissions");
    }
  }
  
  if (sessionData.goal === 'Fun/social') {
    if (analysis.uniqueAspects.includes('casual atmosphere')) {
      explanations.push("😊 **Relaxed Vibe**: Perfect for unwinding and making friends without pressure");
    } else if (analysis.uniqueAspects.includes('creative outlet')) {
      explanations.push("🎨 **Creative Expression**: Great way to explore your artistic side and meet like-minded people");
    } else if (analysis.uniqueAspects.includes('shared interests')) {
      explanations.push("🤝 **Community**: Connect with others who share your passions");
    }
  }
  
  // Activity-specific highlights
  if (sessionData.activityType === 'Hands-on projects') {
    if (analysis.skills.includes('programming')) {
      explanations.push("💻 **Technical Skills**: Build real programming skills through hands-on projects");
    } else if (analysis.skills.includes('engineering')) {
      explanations.push("🔧 **Engineering Practice**: Apply engineering principles to solve real problems");
    }
  }
  
  // Time commitment reality check
  if (analysis.timeCommitment !== sessionData.timeCommitment) {
    if (analysis.timeCommitment === 'High' && sessionData.timeCommitment === 'Medium') {
      explanations.push("⏰ **Time Note**: This is a high-commitment club, but the experience is incredibly rewarding");
    } else if (analysis.timeCommitment === 'Low' && sessionData.timeCommitment === 'Medium') {
      explanations.push("⏰ **Flexible Time**: Lower time commitment gives you room for other activities too");
    }
  }
  
  return explanations.slice(0, 3); // Limit to 3 key points
}

function ensureVariety(sortedClubs) {
  if (sortedClubs.length <= 3) return sortedClubs;
  
  const result = [];
  const categoriesUsed = new Set();
  const activityTypesUsed = new Set();
  
  // First, add the highest scoring club
  if (sortedClubs.length > 0) {
    result.push(sortedClubs[0]);
    categoriesUsed.add(sortedClubs[0].category);
    activityTypesUsed.add(sortedClubs[0].analysis?.activityType);
  }
  
  // Then add clubs that provide variety
  for (let i = 1; i < sortedClubs.length && result.length < 3; i++) {
    const club = sortedClubs[i];
    const clubCategory = club.category;
    const clubActivityType = club.analysis?.activityType;
    
    // Prefer clubs that add variety, but don't exclude high-scoring matches
    const addsVariety = !categoriesUsed.has(clubCategory) || !activityTypesUsed.has(clubActivityType);
    const highScore = club.matchScore >= 70; // High threshold for variety override
    
    if (addsVariety || highScore || result.length === 2) {
      result.push(club);
      categoriesUsed.add(clubCategory);
      activityTypesUsed.add(clubActivityType);
    }
  }
  
  // If we still need more clubs, add the next highest scoring ones
  for (let i = 1; i < sortedClubs.length && result.length < 3; i++) {
    const club = sortedClubs[i];
    if (!result.includes(club)) {
      result.push(club);
    }
  }
  
  return result;
}

function getLlamaResponse(userQuery, sessionData = {}) {
  console.log('🔍 Starting getLlamaResponse with:', { userQuery, sessionData });
  console.log('📊 Session data keys:', Object.keys(sessionData));
  console.log('🏫 School:', sessionData.school);
  console.log('📚 Grade:', sessionData.grade);
  
  try {
    // FIX: Parse user response to determine what action to take and get updated sessionData
    const parseResult = parseUserResponse(userQuery, sessionData);
    console.log('🔍 Parse result:', parseResult);
    console.log('📤 Updated sessionData from parseResult:', parseResult.sessionData);
    
    // FIX: Use the updated sessionData from parseResult instead of creating our own copy
    const updatedSessionData = parseResult.sessionData || { ...sessionData };
    
    // FIX: Handle the recommend_clubs action immediately when detected
    if (parseResult.action === 'recommend_clubs') {
      console.log('🎉 All preferences collected - matching clubs');
      console.log('📋 Final sessionData for matching:', JSON.stringify(updatedSessionData, null, 2));
      
      try {
        // FIX: Call matchClubsToPreferences with the complete sessionData
        const matchedClubs = matchClubsToPreferences(updatedSessionData);
        console.log(`✅ Found ${matchedClubs.length} matched clubs`);
        
        // FIX: Pass the matched clubs to buildJSONResponse for formatting
        const response = buildJSONResponse(updatedSessionData, matchedClubs);
        return {
          response: response,
          sessionData: updatedSessionData
        };
      } catch (error) {
        console.error('❌ Error matching clubs:', error);
        // FIX: Return error but still show some clubs if possible
        const errorResponse = JSON.stringify({
          success: false,
          message: "⚠️ I found some great clubs but had trouble analyzing them. Here's what I found:",
          clubs: [],
          suggestions: ["🔄 Try again", "🏠 Start over"]
        });
        return {
          response: errorResponse,
          sessionData: updatedSessionData
        };
      }
    }
    
    // FIX: For all other actions, generate response based on current session state
    const response = buildJSONResponse(updatedSessionData, null);
    
    console.log('✅ Generated response successfully');
    console.log('📤 Final updated session data:', updatedSessionData);
    
    return {
      response: response,
      sessionData: updatedSessionData
    };
    
  } catch (error) {
    console.error('❌ Error in getLlamaResponse:', error);
    console.error('Stack trace:', error.stack);
    
    // Return error response but keep session data intact
    const errorResponse = JSON.stringify({
      success: false,
      message: "⚠️ Oops! I'm having trouble processing your request. Please try again.",
      suggestions: ["🔄 Try again", "🏠 Start over"]
    });
    
    return {
      response: errorResponse,
      sessionData: sessionData
    };
  }
}

module.exports = {
  getLlamaResponse,
  isResetCommand
};
