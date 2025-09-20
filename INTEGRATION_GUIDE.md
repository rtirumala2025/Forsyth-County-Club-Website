# Smart Club Recommender - Integration Guide

## Quick Start

To integrate the improved Smart Club Recommender into your existing Forsyth County Club Website:

### 1. Replace the Old Chatbot Component

**In your main app component (e.g., `App.jsx` or `ClubsWebsite.jsx`):**

```javascript
// OLD
import AIClubChatbotFixed from './components/chatbot/AIClubChatbotFixed';

// NEW
import SmartClubRecommender from './components/chatbot/SmartClubRecommender';

// Replace in JSX
<SmartClubRecommender 
  allClubData={allClubData} 
  isOpen={isChatbotOpen} 
  onClose={() => setIsChatbotOpen(false)} 
  selectedSchool={selectedSchool}
/>
```

### 2. Update Service Imports

**In any component using the old service:**

```javascript
// OLD
import { 
  processUserInputEnhanced, 
  generateBotResponse,
  enhancedConversationState 
} from '../services/enhancedClubRecommendationService';

// NEW
import { 
  processUserInputSmart, 
  generateSmartBotResponse,
  smartConversationState 
} from '../services/smartClubRecommendationService';
```

### 3. Backend Configuration

**Ensure your backend is running with the updated endpoints:**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Verify the hybrid endpoint is working:**
```bash
curl -X POST "http://localhost:8000/api/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I love coding",
    "sessionData": {
      "grade": 10,
      "interests": ["coding"]
    }
  }'
```

### 4. Environment Setup

**Backend (.env file):**
```
OPENAI_API_KEY="your_openai_api_key_here"
```

**Frontend (no changes needed):**
- The service automatically uses `http://localhost:8000`
- For production, update the API_BASE_URL in the service file

## Key Differences

### Old vs New API Calls

**Old (AI-only):**
```javascript
const response = await fetch('http://localhost:8000/api/ai', {
  method: 'POST',
  body: JSON.stringify({
    message: userQuery,
    sessionData: conversationContext
  })
});
```

**New (Hybrid):**
```javascript
const response = await fetch('http://localhost:8000/api/recommend', {
  method: 'POST',
  body: JSON.stringify({
    message: userQuery,
    sessionData: conversationContext
  })
});

// Response includes source and confidence
const data = await response.json();
// data.source: "rules" | "ai"
// data.confidence: "high" | "medium" | "low"
// data.matched_patterns: ["coding", "business"]
```

### UI Changes

**Old:**
- "AI Assistant Response"
- "AI" badges
- Generic error messages

**New:**
- "Smart Club Recommender"
- "Smart Match" / "Personalized" badges
- Confidence indicators ("Highly Recommended", "Recommended", "Suggested")
- Service status indicator

## Testing the Integration

### 1. Test Rule-Based Recommendations
```javascript
// Send: "I love coding"
// Expected: Fast response with "Perfect match!" and high confidence
```

### 2. Test AI Fallback
```javascript
// Send: "I'm interested in both science and art"
// Expected: Personalized response with medium confidence
```

### 3. Test Error Handling
```javascript
// Stop backend service
// Send: "I love coding"
// Expected: Fallback recommendations with low confidence
```

## Troubleshooting

### Common Issues

**1. Service Not Available**
- Check if backend is running on port 8000
- Verify API key is configured
- Check browser console for errors

**2. No Recommendations**
- Verify club data is loaded
- Check network requests in browser dev tools
- Ensure session data is being passed correctly

**3. Slow Responses**
- Check if caching is working
- Verify network connection
- Monitor backend performance

### Debug Mode

**Enable detailed logging:**
```javascript
// In browser console
localStorage.setItem('debug', 'smart-club-recommender');
```

**Check service status:**
```javascript
// In browser console
fetch('http://localhost:8000/api/health')
  .then(r => r.json())
  .then(console.log);
```

## Performance Optimization

### Caching
The new service automatically caches recommendations for 5 minutes. To clear cache:

```javascript
import { clearRecommendationCache } from '../services/smartClubRecommendationService';
clearRecommendationCache();
```

### Monitoring
Check cache statistics:

```javascript
import { getCacheStats } from '../services/smartClubRecommendationService';
console.log(getCacheStats());
```

## Production Deployment

### Frontend
```bash
cd frontend
npm run build
# Deploy build/ folder to your hosting service
```

### Backend
```bash
cd backend
pip install -r requirements.txt
# Deploy with your preferred method (Docker, cloud service, etc.)
```

### Environment Variables
- Set `OPENAI_API_KEY` in production
- Update CORS origins for production domain
- Configure logging and monitoring

## Support

If you encounter any issues:

1. **Check the logs** in browser console and backend terminal
2. **Verify the API** is responding at `/api/health`
3. **Test with curl** to isolate frontend vs backend issues
4. **Check the test suite** for expected behavior

The Smart Club Recommender is designed to be a drop-in replacement for the old chatbot with significant improvements in reliability, personalization, and user experience.
