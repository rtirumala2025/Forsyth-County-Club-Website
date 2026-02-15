/**
 * Smart Club Recommendation Service
 * 
 * This service provides intelligent club recommendations using a hybrid approach:
 * 1. Rule-based matching for fast, reliable responses
 * 2. AI-powered fallback for complex, personalized queries
 * 
 * Features:
 * - No AI branding - appears as "Smart Club Recommender"
 * - Context-aware recommendations using session data
 * - Graceful error handling and fallback
 * - Performance optimization with caching
 * - Mobile and desktop responsive
 */

import { uniqueClubs, clubCategories, interestAreas, experienceTypes } from '../data/clubDiscoveryData';

// Cache for recent recommendations to improve performance
const recommendationCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Check if the smart recommendation service is available
const isServiceAvailable = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/health');
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.log('Smart recommendation service health check failed:', error);
    return false;
  }
};

// Call the hybrid recommendation endpoint
const callSmartRecommendationService = async (userQuery: string, selectedSchool: string | null = null, conversationContext: any = {}) => {
  try {
    // Check cache first for performance
    const cacheKey = `${userQuery}-${selectedSchool}-${JSON.stringify(conversationContext)}`;
    const cached = recommendationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const response = await fetch('http://localhost:8000/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userQuery,
        sessionData: {
          grade: conversationContext.grade || null,
          interests: conversationContext.interests || [],
          experience_types: conversationContext.experience_types || [],
          clubs_viewed: conversationContext.clubs_viewed || [],
          query_history: conversationContext.query_history || []
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Smart recommendation service error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the response
    recommendationCache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    console.log('Smart recommendation service call failed:', error);
    return null;
  }
};

// Enhanced conversation state with smart recommendations
export const smartConversationState = {
  step: 'greeting',
  mainInterest: null,
  subcategory: null,
  recommendations: [],
  smartRecommendations: [],
  isServiceAvailable: false,
  userSession: {
    interests: [],
    experienceTypes: [],
    clubsViewed: [],
    queryHistory: [],
    grade: null
  },
  lastRecommendationSource: null, // Track if last recommendation was from rules or AI
  confidence: null
};

// Get club recommendations based on main interest and subcategory
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
  const clubIds = clubCategories[mainInterest]?.[subcategory] || [];

  // Find matching clubs in the school's data
  clubIds.forEach(clubId => {
    const targetClub = uniqueClubs[clubId];
    if (targetClub) {
      const matchingClubs = schoolClubs.filter(club =>
        club.name.toLowerCase().includes(targetClub.name.toLowerCase()) ||
        club.category.toLowerCase().includes(targetClub.category.toLowerCase()) ||
        club.description.toLowerCase().includes(targetClub.description.toLowerCase())
      );
      matchingClubs.forEach(club => recommendations.add(club));
    }
  });

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
  const filteredRecommendations = uniqueRecommendations.filter((club: any) => {
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

// Check if user input is a guided flow selection or free-form query
export const isGuidedFlowInput = (userInput, currentState) => {
  const inputLower = userInput.toLowerCase();

  // Check for reset/start over
  if (inputLower.includes('start over') || inputLower.includes('reset') || inputLower.includes('')) {
    return true;
  }

  // Check for main interest selection
  for (const [interest, data] of Object.entries(interestAreas)) {
    if (inputLower.includes(interest.toLowerCase()) || inputLower.includes(data.icon)) {
      return true;
    }
  }

  // Check for subcategory selection
  for (const [sub, data] of Object.entries(experienceTypes)) {
    if (inputLower.includes(sub.toLowerCase()) || inputLower.includes(data.icon)) {
      return true;
    }
  }

  // Check for follow-up actions
  if (inputLower.includes('see more') || inputLower.includes('') ||
    inputLower.includes('ask') || inputLower.includes('')) {
    return true;
  }

  // If none of the above, it's likely a free-form query
  return false;
};

// Process user input with smart recommendation integration
export const processUserInputSmart = async (userInput, currentState, allClubData, selectedSchool = null) => {
  const inputLower = userInput.toLowerCase();

  // Update user session
  const updatedState = { ...currentState };
  updatedState.userSession.queryHistory.push(userInput);

  // Check if this is a guided flow input
  if (isGuidedFlowInput(userInput, currentState)) {
    // Process as guided flow (existing logic)
    return processGuidedFlowInput(userInput, updatedState, allClubData, selectedSchool);
  } else {
    // Process as free-form query with smart recommendations
    return await processFreeFormQuerySmart(userInput, updatedState, allClubData, selectedSchool);
  }
};

// Process guided flow input (existing logic)
const processGuidedFlowInput = (userInput, currentState, allClubData, selectedSchool) => {
  const inputLower = userInput.toLowerCase();

  // Check for reset/start over
  if (inputLower.includes('start over') || inputLower.includes('reset') || inputLower.includes('')) {
    return {
      ...currentState,
      step: 'greeting',
      mainInterest: null,
      subcategory: null,
      recommendations: [],
      smartRecommendations: []
    };
  }

  // Check for main interest selection
  for (const [interest, data] of Object.entries(interestAreas)) {
    if (inputLower.includes(interest.toLowerCase()) || inputLower.includes(data.icon)) {
      // Update user session
      const updatedState = { ...currentState };
      updatedState.userSession.interests.push(interest);

      return {
        ...updatedState,
        step: 'main_interest_selected',
        mainInterest: interest,
        subcategory: null,
        recommendations: []
      };
    }
  }

  // Check for subcategory selection
  for (const [sub, data] of Object.entries(experienceTypes)) {
    if (inputLower.includes(sub.toLowerCase()) || inputLower.includes(data.icon)) {
      const recommendations = getClubRecommendations(currentState.mainInterest, sub, allClubData, selectedSchool);

      // Update user session
      const updatedState = { ...currentState };
      updatedState.userSession.experienceTypes.push(sub);

      return {
        ...updatedState,
        step: recommendations.length > 0 ? 'subcategory_selected' : 'no_matches',
        subcategory: sub,
        recommendations: recommendations
      };
    }
  }

  // Check for follow-up actions
  if (inputLower.includes('see more') || inputLower.includes('')) {
    return {
      ...currentState,
      step: 'follow_up'
    };
  }

  if (inputLower.includes('ask') || inputLower.includes('')) {
    return {
      ...currentState,
      step: 'follow_up'
    };
  }

  // Default: stay in current state
  return currentState;
};

// Process free-form query with smart recommendations
const processFreeFormQuerySmart = async (userInput, currentState, allClubData, selectedSchool) => {
  // Check service availability
  const serviceAvailable = await isServiceAvailable();

  if (serviceAvailable) {
    try {
      // Call smart recommendation service
      const smartResponse = await callSmartRecommendationService(userInput, selectedSchool, currentState.userSession);

      if (smartResponse && smartResponse.reply) {
        return {
          ...currentState,
          step: 'smart_recommendations',
          smartRecommendations: [{
            id: 'smart-response',
            name: 'Smart Recommendation',
            description: smartResponse.reply,
            category: 'Smart Recommendation',
            isSmartResponse: true,
            source: smartResponse.source,
            confidence: smartResponse.confidence,
            matchedPatterns: smartResponse.matched_patterns || []
          }],
          recommendations: [], // Clear static recommendations when using smart service
          lastRecommendationSource: smartResponse.source,
          confidence: smartResponse.confidence
        };
      }
    } catch (error) {
      console.log('Smart recommendation processing failed, falling back to static recommendations:', error);
    }
  }

  // Fallback to static recommendations based on keywords
  const fallbackRecommendations = getFallbackRecommendations(userInput, allClubData, selectedSchool);

  return {
    ...currentState,
    step: 'fallback_recommendations',
    recommendations: fallbackRecommendations,
    smartRecommendations: [],
    lastRecommendationSource: 'fallback',
    confidence: 'low'
  };
};

// Get fallback recommendations when smart service is unavailable
const getFallbackRecommendations = (userInput, allClubData, selectedSchool) => {
  if (!allClubData || allClubData.length === 0) return [];

  const inputLower = userInput.toLowerCase();
  const recommendations = new Set();

  // Filter clubs by selected school
  let schoolClubs = [];
  if (selectedSchool) {
    const schoolData = allClubData.find(school => school.school === selectedSchool);
    if (schoolData) {
      schoolClubs = schoolData.clubs || schoolData.club || [];
    }
  } else {
    schoolClubs = allClubData.flatMap(school => school.clubs || school.club || []);
  }

  // Find clubs that match the user input keywords
  schoolClubs.forEach(club => {
    const clubText = `${club.name} ${club.description} ${club.category}`.toLowerCase();

    // Check if any word in the input matches the club
    const inputWords = inputLower.split(/\s+/);
    const hasMatch = inputWords.some(word =>
      word.length > 2 && clubText.includes(word)
    );

    if (hasMatch) {
      recommendations.add(club);
    }
  });

  // If no keyword matches, return popular clubs
  if (recommendations.size === 0) {
    return schoolClubs.slice(0, 3);
  }

  return Array.from(recommendations).slice(0, 5);
};

// Generate conversation flow based on current state
export const generateSmartConversationFlow = (conversationState) => {
  const { step, mainInterest, subcategory, recommendations, smartRecommendations, lastRecommendationSource, confidence } = conversationState;

  switch (step) {
    case 'greeting':
      return {
        text: "Hi there!  I'm your Smart Club Recommender! I'm here to help you discover the perfect clubs that match your interests and goals. What are you passionate about?",
        quickReplies: Object.keys(interestAreas).map(interest =>
          `${interest} ${interestAreas[interest].icon}`
        ),
        type: 'greeting'
      };

    case 'main_interest_selected':
      const interestData = interestAreas[mainInterest];
      return {
        text: `Excellent choice! ${interestData.description} offers incredible opportunities for growth and connection. What type of experience are you looking for?`,
        quickReplies: Object.keys(experienceTypes).map(sub =>
          `${experienceTypes[sub].icon} ${sub.charAt(0).toUpperCase() + sub.slice(1)}`
        ),
        type: 'subcategory_selection'
      };

    case 'subcategory_selected':
      const subData = experienceTypes[subcategory];
      return {
        text: `Perfect! ${subData.description}. Here are some clubs I think you'd absolutely love:`,
        recommendations: recommendations,
        quickReplies: [' Start Over', ' See More Clubs', ' Ask Questions'],
        type: 'recommendations'
      };

    case 'smart_recommendations':
      const sourceText = lastRecommendationSource === 'rules' ? 'recommended' : 'suggested';
      const confidenceText = confidence === 'high' ? 'Highly Recommended' : 'Recommended';
      return {
        text: `Based on your interests, here's what I ${sourceText} for you:`,
        recommendations: smartRecommendations,
        quickReplies: [' Start Over', ' Try Guided Flow', ' Ask More Questions'],
        type: 'smart_recommendations',
        confidence: confidence,
        source: lastRecommendationSource
      };

    case 'fallback_recommendations':
      return {
        text: `Here are some clubs that might match what you're looking for:`,
        recommendations: recommendations,
        quickReplies: [' Start Over', ' Try Guided Flow', ' Ask More Questions'],
        type: 'fallback_recommendations'
      };

    case 'no_matches':
      return {
        text: `Hmm, I didn't find a perfect match for ${mainInterest} + ${subcategory}, but here are some popular ${mainInterest} clubs you might enjoy:`,
        recommendations: recommendations,
        quickReplies: [' Start Over', ' Try Different Category', ' Ask Questions'],
        type: 'fallback'
      };

    case 'follow_up':
      return {
        text: "What would you like to explore next?",
        quickReplies: [' Start Over', ' Explore Another Category', ' Ask Questions'],
        type: 'follow_up'
      };

    default:
      return {
        text: "I'm here to help you discover amazing clubs! What interests you most?",
        quickReplies: Object.keys(interestAreas).map(interest =>
          `${interest} ${interestAreas[interest].icon}`
        ),
        type: 'greeting'
      };
  }
};

// Generate natural bot responses
export const generateSmartBotResponse = (conversationState) => {
  return generateSmartConversationFlow(conversationState);
};

// Get personalized recommendations based on user session
export const getPersonalizedRecommendations = (recommendations, userSession) => {
  if (!userSession || recommendations.length === 0) return recommendations;

  // Create a copy to avoid mutating the original
  const personalized = [...recommendations];

  // Reorder based on user preferences (don't remove any)
  personalized.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Prefer clubs from categories the user has shown interest in
    if (userSession.interests.includes(a.category)) scoreA += 2;
    if (userSession.interests.includes(b.category)) scoreB += 2;

    // Prefer clubs the user hasn't seen yet
    if (!userSession.clubsViewed.includes(a.id)) scoreA += 1;
    if (!userSession.clubsViewed.includes(b.id)) scoreB += 1;

    return scoreB - scoreA;
  });

  return personalized;
};

// Clear cache (useful for testing or when user preferences change)
export const clearRecommendationCache = () => {
  recommendationCache.clear();
};

// Get cache statistics (useful for debugging)
export const getCacheStats = () => {
  return {
    size: recommendationCache.size,
    entries: Array.from(recommendationCache.keys())
  };
};
