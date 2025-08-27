// Club Recommendation Service
// Maps user interests to specific clubs and provides intelligent recommendations

// Main interest categories with their specific clubs
export const interestCategories = {
  'STEM': {
    icon: '🔬',
    description: 'Science, Technology, Engineering, and Mathematics',
    clubs: {
      'competitive': ['Science Olympiad', 'Math Team', 'Robotics Club', 'Academic Team'],
      'leadership': ['STEM Leadership Club', 'Science Club', 'Technology Club'],
      'casual': ['Computer Science Club', 'Coding Club', 'Engineering Club'],
      'creative': ['Digital Arts Club', 'Technology Club', 'Innovation Club']
    }
  },
  'Arts': {
    icon: '🎨',
    description: 'Creative expression and artistic activities',
    clubs: {
      'competitive': ['Drama Club', 'Art Competition Club', 'Music Ensemble'],
      'leadership': ['Art Club', 'Drama Club', 'Creative Leadership Club'],
      'casual': ['Art Club', 'Photography Club', 'Creative Writing Club'],
      'creative': ['Art Club', 'Drama Club', 'Creative Writing Club', 'Photography Club']
    }
  },
  'Sports': {
    icon: '⚽',
    description: 'Athletic activities and physical fitness',
    clubs: {
      'competitive': ['Soccer Team', 'Basketball Team', 'Track Team', 'Swimming Team'],
      'leadership': ['Athletic Leadership Club', 'Sports Management Club'],
      'casual': ['Fitness Club', 'Recreational Sports Club', 'Outdoor Club'],
      'creative': ['Dance Club', 'Color Guard', 'Cheerleading']
    }
  },
  'Business': {
    icon: '💼',
    description: 'Business, entrepreneurship, and leadership',
    clubs: {
      'competitive': ['FBLA', 'DECA', 'Business Competition Club'],
      'leadership': ['Student Council', 'Business Club', 'Leadership Club'],
      'casual': ['Entrepreneurship Club', 'Business Club', 'Social Entrepreneurship Club'],
      'creative': ['Marketing Club', 'Business Innovation Club', 'Design Thinking Club']
    }
  },
  'Service': {
    icon: '🤝',
    description: 'Community service and volunteer work',
    clubs: {
      'competitive': ['Service Competition Club', 'Volunteer Leadership Club'],
      'leadership': ['Key Club', 'Interact Club', 'Community Service Club'],
      'casual': ['Volunteer Club', 'Community Service Club', 'Charity Club'],
      'creative': ['Environmental Club', 'Social Justice Club', 'Community Arts Club']
    }
  },
  'Academic': {
    icon: '📚',
    description: 'Academic excellence and scholarly pursuits',
    clubs: {
      'competitive': ['Debate Team', 'Academic Team', 'Quiz Bowl', 'Mock Trial'],
      'leadership': ['National Honor Society', 'Beta Club', 'Academic Leadership Club'],
      'casual': ['Book Club', 'Study Group Club', 'Academic Support Club'],
      'creative': ['Literary Magazine', 'Creative Writing Club', 'Poetry Club']
    }
  },
  'Cultural': {
    icon: '🌍',
    description: 'Cultural diversity and international interests',
    clubs: {
      'competitive': ['Model UN', 'Cultural Competition Club', 'Language Olympiad'],
      'leadership': ['International Club', 'Cultural Leadership Club', 'Diversity Club'],
      'casual': ['Cultural Club', 'Language Clubs', 'International Club'],
      'creative': ['Cultural Arts Club', 'International Film Club', 'Cultural Dance Club']
    }
  },
  'Recreational': {
    icon: '🎮',
    description: 'Fun activities and hobbies',
    clubs: {
      'competitive': ['Chess Club', 'Gaming Club', 'ESports'],
      'leadership': ['Recreational Leadership Club', 'Hobby Club'],
      'casual': ['Chess Club', 'Gaming Club', 'Book Club', 'Hobby Club'],
      'creative': ['Creative Gaming Club', 'Art & Craft Club', 'DIY Club']
    }
  }
};

// Subcategory descriptions
export const subcategoryDescriptions = {
  'competitive': {
    icon: '⚡',
    description: 'Clubs with tournaments, competitions, and performance opportunities',
    examples: 'debate tournaments, science competitions, sports teams'
  },
  'leadership': {
    icon: '👔',
    description: 'Clubs focused on developing leadership skills and taking initiative',
    examples: 'student council, honor societies, club officer positions'
  },
  'casual': {
    icon: '🎉',
    description: 'Relaxed clubs for socializing and pursuing interests without pressure',
    examples: 'hobby groups, social clubs, interest-based meetups'
  },
  'creative': {
    icon: '🎨',
    description: 'Clubs for artistic expression and creative projects',
    examples: 'art clubs, creative writing, drama, music'
  }
};

// Get club recommendations based on main interest and subcategory, filtered by school
export const getClubRecommendations = (mainInterest, subcategory, allClubData, selectedSchool = null) => {
  if (!allClubData || allClubData.length === 0) return [];
  
  // Filter clubs by selected school if provided
  let schoolClubs = [];
  if (selectedSchool) {
    const schoolData = allClubData.find(school => school.school === selectedSchool);
    if (schoolData) {
      schoolClubs = schoolData.clubs || schoolData.club || [];
    }
  } else {
    // If no school selected, use all clubs
    schoolClubs = allClubData.flatMap(school => school.clubs || school.club || []);
  }
  
  const recommendations = new Set();
  
  // Get the specific clubs for this interest + subcategory combination
  const interestData = interestCategories[mainInterest];
  if (interestData && interestData.clubs[subcategory]) {
    const targetClubs = interestData.clubs[subcategory];
    
    // Find matching clubs in the school's data
    targetClubs.forEach(clubName => {
      const matchingClubs = schoolClubs.filter(club => 
        club.name.toLowerCase().includes(clubName.toLowerCase()) ||
        club.category.toLowerCase().includes(clubName.toLowerCase()) ||
        club.description.toLowerCase().includes(clubName.toLowerCase())
      );
      matchingClubs.forEach(club => recommendations.add(club));
    });
  }
  
  // If no specific matches, try broader category matching within the school
  if (recommendations.size === 0) {
    const categoryMatches = schoolClubs.filter(club => {
      const clubText = `${club.name} ${club.description} ${club.category}`.toLowerCase();
      return clubText.includes(mainInterest.toLowerCase()) ||
             clubText.includes(subcategory.toLowerCase());
    });
    categoryMatches.forEach(club => recommendations.add(club));
  }
  
  // Convert Set to Array and remove duplicates by club name
  const uniqueRecommendations = Array.from(recommendations);
  const seenNames = new Set();
  const filteredRecommendations = uniqueRecommendations.filter(club => {
    const normalizedName = club.name.toLowerCase().trim();
    if (seenNames.has(normalizedName)) {
      return false;
    }
    seenNames.add(normalizedName);
    return true;
  });
  
  // If still no matches, return popular clubs from the main category within the school
  if (filteredRecommendations.length === 0) {
    const popularClubs = schoolClubs.filter(club => {
      const clubText = `${club.name} ${club.description} ${club.category}`.toLowerCase();
      return clubText.includes(mainInterest.toLowerCase());
    });
    
    // Remove duplicates from popular clubs too
    const seenPopularNames = new Set();
    const uniquePopularClubs = popularClubs.filter(club => {
      const normalizedName = club.name.toLowerCase().trim();
      if (seenPopularNames.has(normalizedName)) {
        return false;
      }
      seenPopularNames.add(normalizedName);
      return true;
    });
    
    return uniquePopularClubs.slice(0, 3);
  }
  
  return filteredRecommendations.slice(0, 5); // Return top 5 matches
};

// Generate conversation flow based on current state
export const generateConversationFlow = (conversationState) => {
  const { step, mainInterest, subcategory, recommendations } = conversationState;
  
  switch (step) {
    case 'greeting':
      return {
        text: "Hi there! 👋 I'm your personal club discovery assistant! I'm excited to help you find the perfect clubs that match your interests and personality. What interests you most?",
        quickReplies: Object.keys(interestCategories).map(interest => 
          `${interest} ${interestCategories[interest].icon}`
        ),
        type: 'greeting'
      };
      
    case 'main_interest_selected':
      const interestData = interestCategories[mainInterest];
      return {
        text: `Great choice! ${interestData.description} offers amazing opportunities. What type of experience are you looking for?`,
        quickReplies: Object.keys(subcategoryDescriptions).map(sub => 
          `${subcategoryDescriptions[sub].icon} ${sub.charAt(0).toUpperCase() + sub.slice(1)}`
        ),
        type: 'subcategory_selection'
      };
      
    case 'subcategory_selected':
      const subData = subcategoryDescriptions[subcategory];
      return {
        text: `Perfect! ${subData.description}. Here are some clubs I think you'd love:`,
        recommendations: recommendations,
        quickReplies: ['🔄 Start Over', '📚 See More Clubs', '💬 Ask Questions'],
        type: 'recommendations'
      };
      
    case 'no_matches':
      return {
        text: `Hmm, I didn't find a perfect match for ${mainInterest} + ${subcategory}, but here are some popular ${mainInterest} clubs you might enjoy:`,
        recommendations: recommendations,
        quickReplies: ['🔄 Start Over', '📚 Try Different Category', '💬 Ask Questions'],
        type: 'fallback'
      };
      
    case 'follow_up':
      return {
        text: "What would you like to do next?",
        quickReplies: ['🔄 Start Over', '📚 Explore Another Category', '💬 Ask Questions'],
        type: 'follow_up'
      };
      
    default:
      return {
        text: "I'm here to help you discover amazing clubs! What interests you most?",
        quickReplies: Object.keys(interestCategories).map(interest => 
          `${interest} ${interestCategories[interest].icon}`
        ),
        type: 'greeting'
      };
  }
};

// Process user input and determine next conversation step
export const processUserInput = (userInput, currentState, allClubData, selectedSchool = null) => {
  const inputLower = userInput.toLowerCase();
  
  // Check for reset/start over
  if (inputLower.includes('start over') || inputLower.includes('reset') || inputLower.includes('🔄')) {
    return {
      step: 'greeting',
      mainInterest: null,
      subcategory: null,
      recommendations: []
    };
  }
  
  // Check for main interest selection
  for (const [interest, data] of Object.entries(interestCategories)) {
    if (inputLower.includes(interest.toLowerCase()) || inputLower.includes(data.icon)) {
      return {
        step: 'main_interest_selected',
        mainInterest: interest,
        subcategory: null,
        recommendations: []
      };
    }
  }
  
  // Check for subcategory selection
  for (const [sub, data] of Object.entries(subcategoryDescriptions)) {
    if (inputLower.includes(sub.toLowerCase()) || inputLower.includes(data.icon)) {
      const recommendations = getClubRecommendations(currentState.mainInterest, sub, allClubData, selectedSchool);
      return {
        step: recommendations.length > 0 ? 'subcategory_selected' : 'no_matches',
        mainInterest: currentState.mainInterest,
        subcategory: sub,
        recommendations: recommendations
      };
    }
  }
  
  // Check for follow-up actions
  if (inputLower.includes('see more') || inputLower.includes('📚')) {
    return {
      ...currentState,
      step: 'follow_up'
    };
  }
  
  if (inputLower.includes('ask') || inputLower.includes('💬')) {
    return {
      ...currentState,
      step: 'follow_up'
    };
  }
  
  // Default: stay in current state
  return currentState;
};

// Generate natural bot responses
export const generateBotResponse = (conversationState) => {
  return generateConversationFlow(conversationState);
};
