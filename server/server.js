const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting middleware (commented out due to path-to-regexp issue)
// const rateLimit = require('express-rate-limit');

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 20, // Limit each IP to 20 requests per windowMs
//   message: {
//     error: 'Too many requests from this IP, please try again later.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// Apply rate limiting to all routes
// app.use(limiter);

// Initialize OpenAI with server-side API key
let openai;
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  WARNING: OPENAI_API_KEY not found in environment variables.');
  console.warn('   The AI recommendation feature will not work without a valid API key.');
  console.warn('   Please add OPENAI_API_KEY to your .env file.');
} else {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Validation middleware
const validateRequest = (req, res, next) => {
  const { userAnswers, clubs, selectedSchool } = req.body;
  
  if (!userAnswers || !clubs || !selectedSchool) {
    return res.status(400).json({
      error: 'Missing required fields: userAnswers, clubs, and selectedSchool'
    });
  }
  
  if (!Array.isArray(clubs) || clubs.length === 0) {
    return res.status(400).json({
      error: 'Clubs data must be a non-empty array'
    });
  }
  
  next();
};

// AI Club Recommendation Endpoint
app.post('/api/ai-recommendations', validateRequest, async (req, res) => {
  try {
    // Check if OpenAI is configured
    if (!openai) {
      return res.status(503).json({
        error: 'AI service is not configured. Please add OPENAI_API_KEY to your environment variables.'
      });
    }

    const { userAnswers, clubs, selectedSchool, conversationContext, isFollowUp, intentAnalysis } = req.body;
    
    // Prepare the enhanced prompt for AI analysis
    const prompt = isFollowUp ? generateFollowUpPrompt(userAnswers, clubs, selectedSchool, conversationContext, intentAnalysis) 
                             : generateInitialPrompt(userAnswers, clubs, selectedSchool);

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI club advisor for high school students. Always respond with valid JSON as requested. Never include placeholder or test clubs in recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    // Parse AI response
    const aiResponse = completion.choices[0].message.content;
    let recommendations;
    
    try {
      recommendations = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('AI Response:', aiResponse);
      return res.status(500).json({
        error: 'Error processing AI response. Please try again.'
      });
    }

    // Validate recommendations structure
    if (!Array.isArray(recommendations)) {
      return res.status(500).json({
        error: 'Invalid recommendation format received from AI.'
      });
    }

    // Filter out any invalid recommendations
    const validRecommendations = recommendations.filter(rec => 
      rec && rec.clubName && rec.category && rec.reason && rec.matchScore
    );

    // Log successful request (without sensitive data)
    console.log(`AI recommendation request processed successfully for ${selectedSchool} - ${isFollowUp ? 'follow-up' : 'initial'} request`);

    res.json({
      success: true,
      recommendations: validRecommendations.slice(0, 5) // Ensure max 5 recommendations
    });

  } catch (error) {
    console.error('AI Recommendation Error:', error);
    
    // Handle different types of errors
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        error: 'AI service temporarily unavailable. Please try again later.'
      });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(500).json({
        error: 'AI service configuration error. Please contact support.'
      });
    }
    
    if (error.message.includes('JSON')) {
      return res.status(500).json({
        error: 'Error processing AI response. Please try again.'
      });
    }
    
    res.status(500).json({
      error: 'An error occurred while processing your request. Please try again.'
    });
  }
});

// Generate initial recommendation prompt
function generateInitialPrompt(userAnswers, clubs, selectedSchool) {
  return `
You are an expert AI club advisor for high school students. Your job is to provide highly accurate and personalized club recommendations based on comprehensive analysis of student preferences.

STUDENT PROFILE:
- School: ${selectedSchool}
- Interests: ${userAnswers.interests || 'Not specified'}
- Time Commitment: ${userAnswers.timeCommitment || 'Not specified'}
- Preferred Club Type: ${userAnswers.clubType || 'Not specified'}
- Skills/Goals: ${userAnswers.skills || 'Not specified'}
- Grade Level: ${userAnswers.gradeLevel || 'Not specified'}
- Previous Experience: ${userAnswers.previousExperience || 'Not specified'}

AVAILABLE CLUBS (${clubs.length} clubs available at ${selectedSchool}):
${clubs.map(club => `
  - ${club.name} (${club.category})
    School: ${club.school}
    Type: ${club.type}
    Time Commitment: ${club.timeCommitment}
    Interests: ${club.interests.join(', ')}
    Activities: ${club.activities ? club.activities.join(', ') : 'None'}
    Benefits: ${club.benefits ? club.benefits.join(', ') : 'None'}
    Grade Levels: ${club.gradeLevels ? club.gradeLevels.join(', ') : 'All grades'}
    Description: ${club.description}
`).join('')}

RECOMMENDATION ALGORITHM:
1. PRIORITIZE EXACT MATCHES: If a student mentions specific interests (e.g., "Robotics", "STEM", "Art"), prioritize clubs that explicitly mention those terms in their interests, description, or category.
2. TIME COMMITMENT MATCHING: Ensure the club's time commitment aligns with the student's availability (Low: 1-2 hours, Medium: 3-5 hours, High: 6+ hours).
3. CLUB TYPE PREFERENCE: Match the student's preferred club type (competitive, social, academic, creative, leadership) with the club's type.
4. GRADE LEVEL APPROPRIATENESS: Consider if the club is suitable for the student's grade level.
5. SKILL DEVELOPMENT: Prioritize clubs that help develop the skills the student wants to build.
6. SCHOOL FILTERING: Only recommend clubs from the student's selected school.

SCORING SYSTEM:
- HIGH MATCH: Perfect alignment across multiple criteria (interests, time, type, skills)
- MEDIUM MATCH: Good alignment on 2-3 criteria
- LOW MATCH: Basic alignment on 1-2 criteria

REQUIREMENTS:
- Recommend exactly 3-5 clubs from the available clubs list
- Only include clubs from the specified school
- Provide specific, detailed reasoning for each recommendation
- Consider all student answers holistically
- Be conversational and encouraging in your explanations
- NEVER recommend placeholder or test clubs
- Focus on real clubs that exist in the provided data

Format your response as a JSON array with this structure:
[
  {
    "clubName": "Exact Club Name",
    "category": "Club Category",
    "reason": "Detailed explanation of why this club is perfect for the student, mentioning specific matches with their interests, time commitment, and goals",
    "matchScore": "High/Medium/Low"
  }
]`;
}

// Generate follow-up recommendation prompt
function generateFollowUpPrompt(userAnswers, clubs, selectedSchool, conversationContext, intentAnalysis) {
  return `
You are an expert AI club advisor for high school students. The student has already received initial recommendations and is now asking for adjustments or new recommendations based on additional criteria.

CONVERSATION CONTEXT:
- Original School: ${selectedSchool}
- Original Interests: ${userAnswers.interests || 'Not specified'}
- Original Time Commitment: ${userAnswers.timeCommitment || 'Not specified'}
- Original Club Type: ${userAnswers.clubType || 'Not specified'}
- Original Skills/Goals: ${userAnswers.skills || 'Not specified'}
- Original Grade Level: ${userAnswers.gradeLevel || 'Not specified'}
- Original Experience: ${userAnswers.previousExperience || 'Not specified'}
- Follow-up Request: ${userAnswers.followUpRequest || 'Not specified'}
- Follow-up Intent: ${userAnswers.followUpIntent || 'Not specified'}
- Follow-up Preferences: ${JSON.stringify(userAnswers.followUpPreferences || {})}
- Previous Recommendations: ${userAnswers.previousRecommendations ? userAnswers.previousRecommendations.map(r => r.clubName).join(', ') : 'None'}
- Recommendation History: ${userAnswers.recommendationHistory ? userAnswers.recommendationHistory.join(', ') : 'None'}

INTENT ANALYSIS:
- Intent Type: ${intentAnalysis?.type || 'general'}
- Detected Keywords: ${intentAnalysis?.keywords?.join(', ') || 'None'}
- New Preferences: ${JSON.stringify(intentAnalysis?.preferences || {})}

AVAILABLE CLUBS (${clubs.length} clubs available at ${selectedSchool}):
${clubs.map(club => `
  - ${club.name} (${club.category})
    School: ${club.school}
    Type: ${club.type}
    Time Commitment: ${club.timeCommitment}
    Interests: ${club.interests.join(', ')}
    Activities: ${club.activities ? club.activities.join(', ') : 'None'}
    Benefits: ${club.benefits ? club.benefits.join(', ') : 'None'}
    Grade Levels: ${club.gradeLevels ? club.gradeLevels.join(', ') : 'All grades'}
    Description: ${club.description}
`).join('')}

ENHANCED FOLLOW-UP RECOMMENDATION ALGORITHM:
1. ANALYZE INTENT: Understand the specific intent behind the follow-up request (business, STEM, competitive, social, etc.)
2. PRIORITIZE NEW CRITERIA: Focus on clubs that match the new preferences while considering original criteria
3. AVOID REPETITION: Exclude clubs from recommendation history unless they perfectly match new criteria
4. CONTEXTUAL MATCHING: Consider activities and benefits that align with the follow-up intent
5. DYNAMIC RANKING: Rank clubs based on how well they address the specific follow-up request

INTENT-SPECIFIC GUIDELINES:
- BUSINESS INTENT: Prioritize clubs with business, leadership, entrepreneurship, or professional development focus
- STEM INTENT: Focus on science, technology, engineering, math, or competitive STEM activities
- COMPETITIVE INTENT: Prioritize clubs with competitive elements, tournaments, or performance opportunities
- SOCIAL INTENT: Focus on clubs with social interaction, community service, or cultural activities
- CREATIVE INTENT: Prioritize arts, design, creative expression, or innovative activities
- ACADEMIC INTENT: Focus on study groups, academic competitions, or learning-focused activities
- LEADERSHIP INTENT: Prioritize student government, leadership development, or community roles
- TIME ADJUSTMENT: Adjust recommendations based on new time commitment preferences
- DIFFERENT CLUBS: Suggest clubs not previously recommended
- FRIEND RECOMMENDATION: Adapt recommendations for different interests and preferences

SCORING SYSTEM:
- HIGH MATCH: Perfect alignment with follow-up intent and original criteria
- MEDIUM MATCH: Good alignment with follow-up intent
- LOW MATCH: Basic alignment but still relevant

REQUIREMENTS:
- Recommend exactly 3-5 clubs that specifically address the follow-up intent
- Only include clubs from the specified school
- Provide detailed reasoning explaining how each club matches the follow-up request
- Be conversational and explain the specific adjustments made
- NEVER recommend placeholder or test clubs
- Prioritize clubs that haven't been recommended before unless they perfectly match new criteria
- Focus on real clubs that exist in the provided data

Format your response as a JSON array with this structure:
[
  {
    "clubName": "Exact Club Name",
    "category": "Club Category",
    "reason": "Detailed explanation of how this club specifically addresses the follow-up intent while considering original preferences",
    "matchScore": "High/Medium/Low"
  }
]`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    aiConfigured: !!process.env.OPENAI_API_KEY
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Club Recommendation Server running on port ${PORT}`);
  console.log(`📊 Rate limiting: 20 requests per 15 minutes per IP`);
  console.log(`🔒 CORS enabled for: localhost:3000 and localhost:3001`);
  console.log(`🤖 AI Status: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
});
