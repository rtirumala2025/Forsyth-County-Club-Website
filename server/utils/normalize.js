/**
 * Normalize and expand user interests with synonyms and typo tolerance
 */

export function normalizeInterests(raw) {
  const txt = (raw || "").toLowerCase();
  const map = [
    { 
      keys: ["buisness", "business", "biz", "entrepreneur", "entrepreneurship", "deca", "fbla", "marketing", "finance", "economics", "accounting"], 
      tag: "Business" 
    },
    { 
      keys: ["stem", "robotics", "cs", "coding", "programming", "science", "engineering", "math", "mathematics", "technology", "computer", "physics", "chemistry"], 
      tag: "STEM" 
    },
    { 
      keys: ["art", "arts", "drawing", "painting", "theater", "drama", "music", "band", "choir", "orchestra", "creative", "design", "photography", "dance"], 
      tag: "Arts" 
    },
    { 
      keys: ["sport", "sports", "athletics", "football", "basketball", "soccer", "baseball", "volleyball", "tennis", "swimming", "track", "cross country"], 
      tag: "Sports" 
    },
    { 
      keys: ["service", "community", "volunteer", "nhs", "key club", "interact", "rotary", "charity", "helping", "outreach"], 
      tag: "Community Service" 
    },
    { 
      keys: ["lead", "leadership", "student council", "stuco", "government", "president", "vice president", "secretary", "treasurer"], 
      tag: "Leadership" 
    },
    { 
      keys: ["academic", "study", "learning", "education", "scholastic", "honor society", "beta club", "quiz bowl", "debate"], 
      tag: "Academic" 
    },
    { 
      keys: ["cultural", "diversity", "international", "language", "spanish", "french", "german", "chinese", "japanese", "heritage"], 
      tag: "Cultural" 
    },
    { 
      keys: ["religious", "faith", "christian", "bible", "fellowship", "church", "youth group"], 
      tag: "Religious" 
    },
    { 
      keys: ["recreational", "fun", "games", "chess", "board games", "card games", "hobby", "leisure"], 
      tag: "Recreational" 
    }
  ];
  
  const tags = new Set();
  map.forEach(({keys, tag}) => {
    if (keys.some(k => txt.includes(k))) {
      tags.add(tag);
    }
  });
  
  return Array.from(tags);
}

/**
 * Normalize club type preferences
 */
export function normalizeClubType(raw) {
  const txt = (raw || "").toLowerCase();
  const typeMap = {
    "competitive": ["competitive", "competition", "compete", "tournament", "championship"],
    "social": ["social", "fun", "casual", "relaxed", "friendly"],
    "academic": ["academic", "study", "learning", "educational", "scholastic"],
    "creative": ["creative", "artistic", "expressive", "innovative", "design"],
    "leadership": ["leadership", "lead", "manage", "organize", "govern"]
  };
  
  for (const [type, keywords] of Object.entries(typeMap)) {
    if (keywords.some(k => txt.includes(k))) {
      return type;
    }
  }
  
  return "social"; // default
}

/**
 * Normalize time commitment levels
 */
export function normalizeTimeCommitment(raw) {
  const txt = (raw || "").toLowerCase();
  
  if (txt.includes("low") || txt.includes("1-2") || txt.includes("flexible") || txt.includes("minimal")) {
    return "Low";
  }
  if (txt.includes("high") || txt.includes("6+") || txt.includes("intensive") || txt.includes("dedicated")) {
    return "High";
  }
  
  return "Medium"; // default
}

/**
 * Extract follow-up intent from user message
 */
export function extractFollowUpIntent(message) {
  const txt = (message || "").toLowerCase();
  
  // Business intent
  if (txt.includes("business") || txt.includes("fbla") || txt.includes("deca") || txt.includes("entrepreneur")) {
    return { type: "business", preferences: { category: "Business" } };
  }
  
  // STEM intent
  if (txt.includes("stem") || txt.includes("science") || txt.includes("technology") || txt.includes("engineering")) {
    return { type: "stem", preferences: { category: "STEM" } };
  }
  
  // Competitive intent
  if (txt.includes("competitive") || txt.includes("competition") || txt.includes("compete")) {
    return { type: "competitive", preferences: { type: "Competitive" } };
  }
  
  // Social intent
  if (txt.includes("social") || txt.includes("fun") || txt.includes("casual")) {
    return { type: "social", preferences: { type: "Social" } };
  }
  
  // Creative intent
  if (txt.includes("creative") || txt.includes("art") || txt.includes("design")) {
    return { type: "creative", preferences: { category: "Arts" } };
  }
  
  // Academic intent
  if (txt.includes("academic") || txt.includes("study") || txt.includes("learning")) {
    return { type: "academic", preferences: { category: "Academic" } };
  }
  
  // Leadership intent
  if (txt.includes("leadership") || txt.includes("lead") || txt.includes("manage")) {
    return { type: "leadership", preferences: { category: "Leadership" } };
  }
  
  // Time adjustment
  if (txt.includes("less time") || txt.includes("lower commitment") || txt.includes("flexible")) {
    return { type: "time_adjustment", preferences: { timeCommitment: "Low" } };
  }
  
  if (txt.includes("more time") || txt.includes("higher commitment") || txt.includes("intensive")) {
    return { type: "time_adjustment", preferences: { timeCommitment: "High" } };
  }
  
  // Different clubs
  if (txt.includes("different") || txt.includes("other") || txt.includes("alternatives")) {
    return { type: "different_clubs" };
  }
  
  // Friend recommendation
  if (txt.includes("friend") || txt.includes("someone else")) {
    return { type: "friend_recommendation" };
  }
  
  return { type: "general" };
}
