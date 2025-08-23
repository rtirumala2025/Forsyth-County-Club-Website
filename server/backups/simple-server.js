const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

// Test AI endpoint with enhanced intent analysis and follow-up support
app.post('/api/ai-recommendations', (req, res) => {
  const { userAnswers, clubs, selectedSchool, isFollowUp, intentAnalysis } = req.body;
  
  let recommendations = [];
  
  if (isFollowUp) {
    // Handle follow-up requests with enhanced intent analysis
    const followUpRequest = userAnswers.followUpRequest || '';
    const previousRecommendations = userAnswers.previousRecommendations || [];
    const recommendationHistory = userAnswers.recommendationHistory || [];
    const previousClubNames = [...new Set([...previousRecommendations.map(r => r.clubName), ...recommendationHistory])];
    
    // Use intent analysis for more accurate recommendations
    const intent = intentAnalysis?.type || 'general';
    const intentPreferences = intentAnalysis?.preferences || {};
    
    if (intent === 'business') {
      // Prioritize business-related clubs
      clubs.forEach(club => {
        const clubText = `${club.name} ${club.category} ${club.description} ${club.interests.join(' ')}`.toLowerCase();
        if ((clubText.includes('business') || clubText.includes('fbla') || clubText.includes('entrepreneur') || 
             clubText.includes('leadership') || clubText.includes('professional')) && 
            !previousClubNames.includes(club.name)) {
          recommendations.push({
            clubName: club.name,
            category: club.category,
            reason: `This ${club.category} club focuses on business and leadership, perfect for your interest in business-related activities.`,
            matchScore: "High"
          });
        }
      });
    } else if (intent === 'stem') {
      // Prioritize STEM-focused clubs
      clubs.forEach(club => {
        const clubText = `${club.name} ${club.category} ${club.description} ${club.interests.join(' ')}`.toLowerCase();
        if ((clubText.includes('stem') || clubText.includes('science') || clubText.includes('technology') || 
             clubText.includes('engineering') || clubText.includes('math') || clubText.includes('robotics')) && 
            !previousClubNames.includes(club.name)) {
          recommendations.push({
            clubName: club.name,
            category: club.category,
            reason: `This ${club.category} club focuses on STEM activities, matching your interest in science and technology.`,
            matchScore: "High"
          });
        }
      });
    } else if (intent === 'competitive') {
      // Prioritize competitive clubs
      clubs.forEach(club => {
        if (club.type === 'Competitive' && !previousClubNames.includes(club.name)) {
          recommendations.push({
            clubName: club.name,
            category: club.category,
            reason: `This is a competitive ${club.category} club that offers tournaments and competitions.`,
            matchScore: "High"
          });
        }
      });
    } else if (intent === 'creative') {
      // Prioritize creative/arts clubs
      clubs.forEach(club => {
        const clubText = `${club.name} ${club.category} ${club.description} ${club.interests.join(' ')}`.toLowerCase();
        if ((clubText.includes('art') || clubText.includes('creative') || clubText.includes('design') || 
             clubText.includes('music') || clubText.includes('drama')) && 
            !previousClubNames.includes(club.name)) {
          recommendations.push({
            clubName: club.name,
            category: club.category,
            reason: `This ${club.category} club focuses on creative expression and artistic activities.`,
            matchScore: "High"
          });
        }
      });
    } else if (intent === 'social') {
      // Prioritize social clubs
      clubs.forEach(club => {
        if (club.type === 'Social' && !previousClubNames.includes(club.name)) {
          recommendations.push({
            clubName: club.name,
            category: club.category,
            reason: `This ${club.category} club offers social interaction and community activities.`,
            matchScore: "High"
          });
        }
      });
    } else if (intent === 'academic') {
      // Prioritize academic clubs
      clubs.forEach(club => {
        if (club.category === 'Academic' && !previousClubNames.includes(club.name)) {
          recommendations.push({
            clubName: club.name,
            category: club.category,
            reason: `This ${club.category} club focuses on academic excellence and learning.`,
            matchScore: "High"
          });
        }
      });
    } else if (intent === 'leadership') {
      // Prioritize leadership clubs
      clubs.forEach(club => {
        const clubText = `${club.name} ${club.category} ${club.description} ${club.interests.join(' ')}`.toLowerCase();
        if ((clubText.includes('leadership') || clubText.includes('student government') || 
             clubText.includes('council') || clubText.includes('president')) && 
            !previousClubNames.includes(club.name)) {
          recommendations.push({
            clubName: club.name,
            category: club.category,
            reason: `This ${club.category} club offers leadership development and organizational experience.`,
            matchScore: "High"
          });
        }
      });
    } else if (intent === 'time_adjustment') {
      // Adjust based on time commitment preference
      const targetCommitment = intentPreferences.timeCommitment || 'Medium';
      clubs.forEach(club => {
        if (club.timeCommitment === targetCommitment && !previousClubNames.includes(club.name)) {
          recommendations.push({
            clubName: club.name,
            category: club.category,
            reason: `This club has ${club.timeCommitment.toLowerCase()} time commitment, perfect for your schedule requirements.`,
            matchScore: "High"
          });
        }
      });
    } else if (intent === 'different_clubs') {
      // Suggest completely different clubs
      clubs.forEach(club => {
        if (!previousClubNames.includes(club.name)) {
          recommendations.push({
            clubName: club.name,
            category: club.category,
            reason: `This ${club.category} club offers a different experience from your previous recommendations.`,
            matchScore: "Medium"
          });
        }
      });
    } else {
      // General follow-up - suggest different clubs based on request keywords
      const requestLower = followUpRequest.toLowerCase();
      clubs.forEach(club => {
        const clubText = `${club.name} ${club.category} ${club.description} ${club.interests.join(' ')}`.toLowerCase();
        if (!previousClubNames.includes(club.name)) {
          // Check if club matches any keywords in the request
          const keywords = requestLower.split(' ').filter(word => word.length > 3);
          const hasKeywordMatch = keywords.some(keyword => clubText.includes(keyword));
          
          if (hasKeywordMatch) {
            recommendations.push({
              clubName: club.name,
              category: club.category,
              reason: `This ${club.category} club matches your follow-up request for different options.`,
              matchScore: "High"
            });
          } else {
            recommendations.push({
              clubName: club.name,
              category: club.category,
              reason: `Based on your follow-up request, this ${club.category} club could be a good alternative.`,
              matchScore: "Medium"
            });
          }
        }
      });
    }
  } else {
    // Initial recommendations
    const userInterests = userAnswers.interests.toLowerCase();
    
    // Find clubs that match user interests
    clubs.forEach(club => {
      const clubInterests = club.interests.join(' ').toLowerCase();
      const clubDescription = club.description.toLowerCase();
      
      if (clubInterests.includes(userInterests) || clubDescription.includes(userInterests)) {
        recommendations.push({
          clubName: club.name,
          category: club.category,
          reason: `This club matches your interest in ${userAnswers.interests} and offers ${club.description.substring(0, 100)}...`,
          matchScore: "High"
        });
      }
    });
    
    // If no direct matches, recommend based on category
    if (recommendations.length === 0) {
      clubs.slice(0, 3).forEach(club => {
        recommendations.push({
          clubName: club.name,
          category: club.category,
          reason: `This ${club.category} club at ${selectedSchool} could be a great fit for your interests and time commitment.`,
          matchScore: "Medium"
        });
      });
    }
  }
  
  // Return top 3-5 recommendations
  res.json({
    success: true,
    recommendations: recommendations.slice(0, 5)
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
