# Forsyth County Club Website

A modern web application for discovering and exploring clubs in Forsyth County schools, featuring an AI-powered chatbot for personalized club recommendations.

## Project Structure

This project is split into two separate services:

- **`frontend/`** - React-based web application
- **`backend/`** - Node.js/Express AI service (OpenAI integration). A legacy Python FastAPI service still exists but is no longer required for the chatbot.

## Prerequisites

- Node.js (v16 or higher)
- OpenAI API key

## Quick Start

### 1. Backend Setup (AI Service - Node.js)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy env template and set your OpenAI key
cp .env.example .env
# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=your_openai_api_key_here
# Optional: OPENAI_MODEL=gpt-4o (or gpt-5 when available)

# Start the backend server
npm run dev
```

The backend will be available at `http://localhost:8000`.

### 2. Frontend Setup (React App)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at `http://localhost:3000`

## How They Connect

The frontend communicates with the Node backend through HTTP API calls:

- **AI Chatbot**: The React chatbot component posts to `http://localhost:8000/api/chat`
- **Health Check**: `GET http://localhost:8000/health` and `GET http://localhost:8000/api/chat/health`
- **Suggestions**: `GET http://localhost:8000/api/chat/suggestions`
- **CORS**: The backend allows `http://localhost:3000` by default (configurable via `FRONTEND_URL`).

## API Endpoints

### Backend (Node.js / Express)

- `GET /health` - Service health
- `GET /api/chat/health` - OpenAI connectivity and endpoints listing
- `GET /api/chat/suggestions` - Conversation starters
- `POST /api/chat` - Main AI endpoint for chat responses
  - Request body:
    - `userQuery: string`
    - `sessionData: { grade?: number, interests?: string[], experience_types?: string[], clubs_viewed?: string[], query_history?: string[] }`
  - Response body:
    - `success: boolean`
    - `message: string` (AI or fallback text)
    - `recommendations: { name: string, category: string, confidence: number, reasoning: string, source: string }[]`
    - `confidence: number (0100)`
    - `source: 'ai' | 'ai(cache)' | 'rule-based'`
    - `degraded?: boolean` (when served from fallback)
    - `sessionData: object` (updated with recent query)
    - `usage?: { prompt_tokens, completion_tokens, total_tokens }`

### Frontend (React)

- `http://localhost:3000` - Main application
- All React routes are handled client-side

## Development Workflow

1. **Start Backend**: Run `uvicorn main:app --reload --port 8000` in the `backend/` directory
2. **Start Frontend**: Run `npm start` in the `frontend/` directory
3. **Access Application**: Open `http://localhost:3000` in your browser

## Environment Variables

### Backend (.env)

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Frontend

Create `frontend/.env` (optional):

```
REACT_APP_API_URL=http://localhost:8000/api
```

## Features

- **Club Discovery**: Browse and search through clubs by category and interest
- **Hybrid Recommendation System**: Combines rule-based matching with AI-powered suggestions
- **AI-Powered Chatbot**: Get personalized club recommendations using OpenAI
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Search**: Fast, client-side search and filtering
- **School Selection**: Filter clubs by specific schools

## Recommendation Algorithm (Backend)

Implemented in `backend/services/aiRecommendationService.js`:

- **Dynamic weighting** across session features:
  - Interests matched to club tags (20 points per tag; multiple interests compound)
  - Experience types mapped to heuristic keywords (+10)
  - Grade suitability (+10)
  - Query keyword match (+15)
  - Previously viewed clubs (-10)
- **AI + Rule merge**:
  - Parse clubs from AI response; score them and merge with rule-based results
  - Boost for multiple interest overlaps (+15)
  - Sorted top 5 with `confidence` 0100
- **Overall confidence (0100)** combines average rec confidence with session richness and reply length
- **Caching**: In-memory LRU cache (200 entries, 5 min TTL) keyed by normalized query + session
- **Fallbacks**: If OpenAI fails or returns empty, serve popular/rule-based recommendations and set `source: 'rule-based'` with `degraded: true` in route layer

### Example Usage
```
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "userQuery": "I love programming and want to learn more",
    "sessionData": { "grade": 9, "interests": ["coding", "robotics"] }
  }'
```

**Rule Match Response:**
```json
{
  "source": "rules",
  "reply": " You should join the Coding Club! It's perfect for programming enthusiasts and offers hands-on coding projects, hackathons, and mentorship opportunities. (Perfect match based on your interests!)",
  "confidence": "high",
  "matched_patterns": ["coding"]
}
```

**AI Fallback Response:**
```json
{
  "source": "ai",
  "reply": "Based on your interests in programming, you might enjoy Coding Club, Robotics, or Web Development Club. Each offers unique opportunities to develop your technical skills!",
  "confidence": "medium"
}
```

## Technology Stack

### Frontend
- React 18
- Tailwind CSS
- Lucide React (icons)
- React Router
- Firebase (for data)

### Backend
- Node.js / Express
- OpenAI SDK
- Helmet, CORS, compression, rate limiting, morgan

## Chatbot UI & Accessibility

Implemented in `frontend/src/components/Chatbot.jsx`:

- **Confidence badges** with color scale (0100)
- **Animated recommendation list** with hover micro-interactions
- **Loading indicator** and degraded-mode warning banner
- **Scrollable history**, sticky input, keyboard Enter to send
- **ARIA labels** for input, send button, suggestions, badges
- **No AI branding**; presents as a Smart Club Recommender

## Troubleshooting

### Backend Issues
- Ensure Python virtual environment is activated
- Check that OpenAI API key is correctly set in `.env`
- Verify port 8000 is not in use by another service

### Frontend Issues
- Ensure Node.js dependencies are installed (`npm install`)
- Check that port 3000 is not in use
- Verify backend is running on port 8000

### Connection Issues
- Check that both services are running
- Verify CORS settings in backend (`FRONTEND_URL`)
- Check browser console for network errors

## Testing

### Backend Tests

```
cd backend
npm test
```

Coverage includes structured response schema, fallbacks, and basic parsing/merging.

### Frontend Tests

```
cd frontend
npm test -- Chatbot
```

Integration test renders the chatbot, sends a message, and verifies recommendations and confidence badges.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

MIT License - see LICENSE file for details
