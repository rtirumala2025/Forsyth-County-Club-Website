import { normalizeInterests, extractFollowUpIntent } from "../utils/normalize.js";
import { sanitizeRecommendations } from "../utils/schema.js";
import { extractConversationalContext, generateContextualFollowUps, detectConversationIntent } from "../utils/conversation.js";

/**
 * Filter clubs by school (case-insensitive)
 */
export function filterBySchool(clubs, school) {
  if (!school || !clubs) return [];
  
  const targetSchool = school.toLowerCase().trim();
  return clubs.filter(club => {
    const clubSchool = (club.school || "").toLowerCase().trim();
    return clubSchool === targetSchool;
  });
}

/**
 * Enhanced heuristic recommendation algorithm with conversational reasoning
 */
export function heuristicRecommendations({ user, clubs, context = {}, isFollowUp = false }) {
  if (!clubs || clubs.length === 0) return [];

  // Extract conversational context for enhanced reasoning
  const conversationContext = extractConversationalContext(context);
  
  // Normalize user interests
  const normalizedInterests = normalizeInterests(user.interests?.join(" ") || "");
  
  // For follow-ups, also consider the follow-up request
  let followUpInterests = [];
  if (isFollowUp && user.followUp) {
    const followUpIntent = extractFollowUpIntent(user.followUp);
    if (followUpIntent.preferences?.category) {
      followUpInterests.push(followUpIntent.preferences.category);
    }
  }
  
  const allWantedInterests = new Set([...normalizedInterests, ...followUpInterests]);

  // Score each club with enhanced conversational reasoning
  const scoredClubs = clubs.map(club => {
    let score = 0;
    const scoringDetails = {
      interestMatches: [],
      categoryMatch: false,
      timeCommitmentMatch: false,
      typeMatch: false,
      followUpSpecific: false,
      engagementBonus: 0
    };
    
    // Interest matching (highest weight)
    const clubInterests = club.interests || [];
    const interestMatches = clubInterests.filter(interest => 
      allWantedInterests.has(interest)
    );
    score += interestMatches.length * 3;
    scoringDetails.interestMatches = interestMatches;
    
    // Category matching
    if (allWantedInterests.has(club.category)) {
      score += 2;
      scoringDetails.categoryMatch = true;
    }
    
    // Time commitment matching with conversational context
    if (user.timeCommitment && club.timeCommitment) {
      if (user.timeCommitment.toLowerCase() === club.timeCommitment.toLowerCase()) {
        score += 2;
        scoringDetails.timeCommitmentMatch = true;
      } else if (user.timeCommitment === "Medium" && club.timeCommitment !== "High") {
        score += 1;
      }
    }
    
    // Club type matching
    if (user.type && club.type) {
      if (user.type.toLowerCase() === club.type.toLowerCase()) {
        score += 2;
        scoringDetails.typeMatch = true;
      }
    }
    
    // Enhanced follow-up specific scoring with conversational context
    if (isFollowUp && user.followUp) {
      const followUpIntent = extractFollowUpIntent(user.followUp);
      const conversationIntent = detectConversationIntent(user.followUp, conversationContext);
      
      // Business intent
      if (followUpIntent.type === "business" && club.category === "Business") {
        score += 5;
        scoringDetails.followUpSpecific = true;
      }
      
      // STEM intent
      if (followUpIntent.type === "stem" && club.category === "STEM") {
        score += 5;
        scoringDetails.followUpSpecific = true;
      }
      
      // Competitive intent
      if (followUpIntent.type === "competitive" && club.type === "Competitive") {
        score += 3;
        scoringDetails.followUpSpecific = true;
      }
      
      // Social intent
      if (followUpIntent.type === "social" && club.type === "Social") {
        score += 3;
        scoringDetails.followUpSpecific = true;
      }
      
      // Creative intent
      if (followUpIntent.type === "creative" && club.category === "Arts") {
        score += 5;
        scoringDetails.followUpSpecific = true;
      }
      
      // Academic intent
      if (followUpIntent.type === "academic" && club.category === "Academic") {
        score += 5;
        scoringDetails.followUpSpecific = true;
      }
      
      // Leadership intent
      if (followUpIntent.type === "leadership" && club.category === "Leadership") {
        score += 5;
        scoringDetails.followUpSpecific = true;
      }
      
      // Time adjustment
      if (followUpIntent.type === "time_adjustment") {
        if (followUpIntent.preferences?.timeCommitment === "Low" && club.timeCommitment === "Low") {
          score += 3;
          scoringDetails.followUpSpecific = true;
        } else if (followUpIntent.preferences?.timeCommitment === "High" && club.timeCommitment === "High") {
          score += 3;
          scoringDetails.followUpSpecific = true;
        }
      }
      
      // Different clubs - avoid previous recommendations
      if (followUpIntent.type === "different_clubs" && user.previousRecommendations) {
        const previousNames = user.previousRecommendations.map(r => r.name || r.clubName);
        if (previousNames.includes(club.name)) {
          score -= 10; // Heavily penalize previous recommendations
        }
      }
      
      // Engagement-based scoring
      if (conversationContext.userEngagement > 0.7) {
        score += 1; // Bonus for highly engaged users
        scoringDetails.engagementBonus = 1;
      }
    }
    
    return {
      club,
      score,
      scoringDetails,
      matchScore: score >= 6 ? "High" : score >= 3 ? "Medium" : "Low"
    };
  });

  // Sort by score (highest first) and take top 7 for enhanced recommendations
  const topClubs = scoredClubs
    .sort((a, b) => b.score - a.score)
    .slice(0, 7)
    .map(item => ({
      name: item.club.name,
      category: item.club.category,
      school: item.club.school,
      reason: generateEnhancedConversationalReason(item, user, conversationContext, isFollowUp),
      matchScore: item.matchScore,
      progressiveDetails: generateProgressiveDetails(item, user, conversationContext),
      engagementLevel: determineEngagementLevel(item.score, conversationContext),
      suggestedFollowUp: generateContextualFollowUp(item, conversationContext)
    }));

  return sanitizeRecommendations(topClubs, 7);
}

/**
 * Generate enhanced conversational reasoning with personality
 */
function generateEnhancedConversationalReason(scoredItem, user, conversationContext, isFollowUp) {
  const { club, scoringDetails, score } = scoredItem;
  const { userName, emotionalContext, userPreferences } = conversationContext;
  
  let reasons = [];
  const name = userName || 'you';
  
  // Interest matches with conversational tone
  if (scoringDetails.interestMatches.length > 0) {
    const interestReasons = [
      `I can totally see your passion for ${scoringDetails.interestMatches.join(', ')} shining through in this club!`,
      `Your love for ${scoringDetails.interestMatches.join(', ')} would be perfect here - it's like this club was made for you!`,
      `This club is all about ${scoringDetails.interestMatches.join(', ')}, which I know gets you excited!`,
      `Your interest in ${scoringDetails.interestMatches.join(', ')} would fit right in with what this club does!`
    ];
    reasons.push(interestReasons[Math.floor(Math.random() * interestReasons.length)]);
  }
  
  // Category match with personalization
  if (scoringDetails.categoryMatch) {
    const categoryReasons = [
      `The ${club.category} focus aligns perfectly with what you're looking for!`,
      `Your ${club.category} interests would be right at home here!`,
      `This ${club.category} club seems like it was designed with you in mind!`,
      `The ${club.category} emphasis matches your interests perfectly!`
    ];
    reasons.push(categoryReasons[Math.floor(Math.random() * categoryReasons.length)]);
  }
  
  // Time commitment with conversational context
  if (scoringDetails.timeCommitmentMatch) {
    const timeReasons = [
      `The time commitment works perfectly with your ${user.timeCommitment} schedule!`,
      `It fits your ${user.timeCommitment} availability like a glove!`,
      `Your ${user.timeCommitment} works great with their meeting schedule!`,
      `The time commitment aligns perfectly with your ${user.timeCommitment}!`
    ];
    reasons.push(timeReasons[Math.floor(Math.random() * timeReasons.length)]);
  }
  
  // Club type with emotional context
  if (scoringDetails.typeMatch) {
    const typeReasons = [
      `The ${user.type} environment you're looking for? This club has exactly that vibe!`,
      `If you want a ${user.type} experience, this club delivers exactly that!`,
      `This club offers the ${user.type} atmosphere you're craving!`,
      `The ${user.type} setting you prefer? This club nails it!`
    ];
    reasons.push(typeReasons[Math.floor(Math.random() * typeReasons.length)]);
  }
  
  // Follow-up specific reasoning
  if (scoringDetails.followUpSpecific && isFollowUp) {
    const followUpReasons = [
      `This specifically addresses what you're looking for in your follow-up request!`,
      `Based on your recent question, this club would be a great fit!`,
      `This directly responds to what you just asked about!`,
      `Perfect for addressing your follow-up needs!`
    ];
    reasons.push(followUpReasons[Math.floor(Math.random() * followUpReasons.length)]);
  }
  
  // Emotional context enhancements
  if (emotionalContext?.excitement > 0.5) {
    reasons.push("I can tell you're excited about this kind of opportunity!");
  } else if (emotionalContext?.frustration > 0.3) {
    reasons.push("I think this could be a great way to address what you're looking for!");
  }
  
  // Default reason if no specific matches
  if (reasons.length === 0) {
    const defaultReasons = [
      `I think this ${club.category} club could be a really interesting opportunity for you to explore!`,
      `This ${club.category} club might surprise you with how well it fits your interests!`,
      `I believe this ${club.category} club could be a great match for what you're looking for!`,
      `This ${club.category} club seems like it could be a perfect fit for your goals!`
    ];
    reasons.push(defaultReasons[Math.floor(Math.random() * defaultReasons.length)]);
  }
  
  // Add personalization
  let finalReason = reasons.join(' ');
  if (userName && !finalReason.includes(userName)) {
    finalReason = `${userName}, ${finalReason.toLowerCase()}`;
  }
  
  return finalReason;
}

/**
 * Generate progressive details for enhanced disclosure
 */
function generateProgressiveDetails(scoredItem, user, conversationContext) {
  const { club, scoringDetails } = scoredItem;
  const { userName } = conversationContext;
  
  const essential = `This ${club.category} club matches your interests in ${scoringDetails.interestMatches.join(', ') || club.category}`;
  
  const expanded = `${essential}. The club focuses on ${(club.activities || []).join(', ') || 'various activities'} and offers benefits like ${(club.benefits || []).join(', ') || 'skill development and networking'}. The time commitment is ${club.timeCommitment || 'flexible'} and it provides a ${club.type || 'social'} environment.`;
  
  const personalized = `Based on what I know about ${userName || 'you'}, this club seems like a great fit because it aligns with your ${user.interests?.join(', ') || 'interests'} and your preference for ${user.timeCommitment || 'flexible'} time commitment. The ${club.type || 'social'} atmosphere should match your style perfectly!`;
  
  return {
    essential,
    expanded,
    personalized
  };
}

/**
 * Determine engagement level based on score and context
 */
function determineEngagementLevel(score, conversationContext) {
  const { userEngagement, emotionalContext } = conversationContext;
  
  if (score >= 8 || userEngagement > 0.7 || emotionalContext?.excitement > 0.5) {
    return 'high';
  } else if (score >= 5 || userEngagement > 0.4) {
    return 'medium';
  }
  return 'low';
}

/**
 * Generate contextual follow-up for individual recommendations
 */
function generateContextualFollowUp(scoredItem, conversationContext) {
  const { club } = scoredItem;
  const { userPreferences, emotionalContext } = conversationContext;
  
  const followUps = [
    `Tell me more about ${club.name}`,
    `What other ${club.category} clubs are available?`,
    `Show me clubs with similar time commitment`,
    `What about more ${userPreferences?.competitive ? 'competitive' : 'social'} clubs?`
  ];
  
  // Add preference-based follow-ups
  if (userPreferences?.stem && club.category === 'STEM') {
    followUps.push("Show me more STEM opportunities");
  }
  
  if (userPreferences?.business && club.category === 'Business') {
    followUps.push("What about more business clubs?");
  }
  
  // Add emotional context follow-ups
  if (emotionalContext?.excitement > 0.5) {
    followUps.push("I'm excited about this! What's next?");
  }
  
  if (emotionalContext?.frustration > 0.3) {
    followUps.push("Can you suggest something different?");
  }
  
  return followUps[Math.floor(Math.random() * followUps.length)];
}

/**
 * Enhanced re-ranking for follow-up requests with conversational context
 */
export function reRankForFollowUp({ originalRecommendations, clubs, followUpRequest, context }) {
  if (!followUpRequest || !clubs) return originalRecommendations;
  
  const conversationContext = extractConversationalContext(context);
  const followUpIntent = extractFollowUpIntent(followUpRequest);
  
  // If it's a "different clubs" request, exclude previous recommendations
  if (followUpIntent.type === "different_clubs") {
    const previousNames = context.lastRecommendations?.map(r => r.name) || [];
    const availableClubs = clubs.filter(club => !previousNames.includes(club.name));
    
    if (availableClubs.length > 0) {
      return heuristicRecommendations({
        user: { ...context.user, followUp: followUpRequest },
        clubs: availableClubs,
        context: conversationContext,
        isFollowUp: true
      });
    }
  }
  
  // For other follow-up types, re-rank existing clubs with enhanced context
  return heuristicRecommendations({
    user: { ...context.user, followUp: followUpRequest },
    clubs,
    context: conversationContext,
    isFollowUp: true
  });
}

/**
 * Generate adaptive follow-up suggestions based on conversation context
 */
export function generateAdaptiveFollowUpSuggestions({ currentRecommendations, conversationContext, userEngagement }) {
  return generateContextualFollowUps(currentRecommendations, conversationContext);
}

/**
 * Enhanced club comparison with conversational reasoning
 */
export function compareClubs(clubs, user, conversationContext) {
  if (!clubs || clubs.length < 2) return null;
  
  const { userName, emotionalContext } = conversationContext;
  const name = userName || 'you';
  
  const comparison = {
    clubs: clubs.map(club => ({
      name: club.name,
      category: club.category,
      strengths: generateClubStrengths(club, user, conversationContext),
      weaknesses: generateClubWeaknesses(club, user, conversationContext),
      bestFor: generateBestForReasoning(club, user, conversationContext)
    })),
    summary: generateComparisonSummary(clubs, user, conversationContext),
    recommendation: generateComparisonRecommendation(clubs, user, conversationContext)
  };
  
  return comparison;
}

/**
 * Generate club strengths with conversational tone
 */
function generateClubStrengths(club, user, conversationContext) {
  const strengths = [];
  const { userName } = conversationContext;
  
  if (club.category && user.interests?.some(interest => 
    interest.toLowerCase().includes(club.category.toLowerCase())
  )) {
    strengths.push(`Perfect match for your ${club.category} interests`);
  }
  
  if (club.timeCommitment === user.timeCommitment) {
    strengths.push(`Ideal time commitment for your schedule`);
  }
  
  if (club.type === user.type) {
    strengths.push(`Matches your preferred ${club.type} environment`);
  }
  
  if (club.activities && club.activities.length > 0) {
    strengths.push(`Offers diverse activities: ${club.activities.join(', ')}`);
  }
  
  if (strengths.length === 0) {
    strengths.push(`Good overall fit for your profile`);
  }
  
  return strengths;
}

/**
 * Generate club weaknesses with constructive tone
 */
function generateClubWeaknesses(club, user, conversationContext) {
  const weaknesses = [];
  
  if (club.timeCommitment !== user.timeCommitment) {
    weaknesses.push(`Time commitment might not match your availability`);
  }
  
  if (club.type !== user.type) {
    weaknesses.push(`Environment might be different from what you prefer`);
  }
  
  if (weaknesses.length === 0) {
    weaknesses.push(`No major concerns identified`);
  }
  
  return weaknesses;
}

/**
 * Generate "best for" reasoning
 */
function generateBestForReasoning(club, user, conversationContext) {
  const { userName } = conversationContext;
  
  if (club.category === 'STEM' && user.interests?.some(i => i.toLowerCase().includes('stem'))) {
    return `Perfect for ${userName || 'you'} if you're passionate about science and technology`;
  }
  
  if (club.category === 'Business' && user.interests?.some(i => i.toLowerCase().includes('business'))) {
    return `Ideal for ${userName || 'you'} if you're interested in entrepreneurship and leadership`;
  }
  
  if (club.type === 'Competitive' && user.type === 'Competitive') {
    return `Great for ${userName || 'you'} if you enjoy challenges and competition`;
  }
  
  return `Good choice for ${userName || 'you'} if you want to explore ${club.category} opportunities`;
}

/**
 * Generate comparison summary
 */
function generateComparisonSummary(clubs, user, conversationContext) {
  const { userName } = conversationContext;
  
  const categories = [...new Set(clubs.map(c => c.category))];
  const types = [...new Set(clubs.map(c => c.type))];
  
  return `I've compared ${clubs.length} clubs for you, ${userName || 'there'}! They cover ${categories.join(', ')} categories and offer ${types.join(', ')} environments. Each has its own strengths, so it really depends on what aspects are most important to you.`;
}

/**
 * Generate comparison recommendation
 */
function generateComparisonRecommendation(clubs, user, conversationContext) {
  const { userName, emotionalContext } = conversationContext;
  
  // Find the highest scoring club
  const bestClub = clubs.reduce((best, current) => 
    (current.matchScore === 'High' && best.matchScore !== 'High') ? current : best
  );
  
  if (bestClub) {
    return `Based on your preferences, ${userName || 'I think'} ${bestClub.name} might be the best fit for you! It aligns well with your interests and schedule.`;
  }
  
  return `All of these clubs have their merits, ${userName || 'there'}! I'd recommend choosing based on which aspects matter most to you - time commitment, activities, or the overall environment.`;
}
