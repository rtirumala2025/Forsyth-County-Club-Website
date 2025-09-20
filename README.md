# Forsyth County Club Website

A modern web application for discovering and exploring clubs in Forsyth County schools, featuring an AI-powered chatbot for personalized club recommendations.

## Project Structure

This project is split into two separate services:

- **`frontend/`** - React-based web application
- **`backend/`** - FastAPI-based AI service

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- OpenAI API key

## Quick Start

### 1. Backend Setup (AI Service)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=your_openai_api_key_here

# Start the backend server
uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

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

The frontend communicates with the backend through HTTP API calls:

- **AI Chatbot**: The React chatbot component sends user messages to `http://localhost:8000/api/ai`
- **Health Check**: The frontend checks backend availability via `http://localhost:8000/api/health`
- **CORS**: The backend is configured to allow requests from `http://localhost:3000`

## API Endpoints

### Backend (FastAPI)

- `GET /api/health` - Health check and AI configuration status
- `POST /api/ai` - Main AI endpoint for chat responses
- `POST /api/recommend` - **Hybrid recommendation endpoint** (recommended)
- `GET /api/rules` - Club rules and guidelines (placeholder)
- `POST /api/ai-recommendations` - Legacy endpoint for compatibility

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

No environment variables required for basic functionality.

## Features

- **Club Discovery**: Browse and search through clubs by category and interest
- **Hybrid Recommendation System**: Combines rule-based matching with AI-powered suggestions
- **AI-Powered Chatbot**: Get personalized club recommendations using OpenAI
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Search**: Fast, client-side search and filtering
- **School Selection**: Filter clubs by specific schools

## Hybrid Recommendation System

The `/api/recommend` endpoint implements a two-tier recommendation system:

### 1. Rule-Based Matching (First Tier)
- **Fast Pattern Matching**: Uses keyword-based rules for common queries
- **High Confidence**: Returns immediate responses for clear matches
- **Examples**: "I love coding" → Coding Club recommendation
- **Coverage**: Coding, Business, Robotics, Debate, Art, Music, Sports, Science

### 2. AI Fallback (Second Tier)
- **OpenAI Integration**: Uses GPT-4o-mini when rules don't match
- **Contextual Understanding**: Considers user session data and conversation history
- **Flexible Responses**: Handles complex, nuanced queries
- **Personalized**: Adapts to user's grade, interests, and previous interactions

### Response Format
```json
{
  "source": "rules" | "ai",
  "reply": "Club recommendation text",
  "confidence": "high" | "medium" | "none",
  "matched_patterns": ["coding", "business"]
}
```

### Example Usage
```bash
curl -X POST "http://localhost:8000/api/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I love programming and want to learn more",
    "sessionData": {
      "grade": 9,
      "interests": ["coding"]
    }
  }'
```

**Rule Match Response:**
```json
{
  "source": "rules",
  "reply": "🎯 You should join the Coding Club! It's perfect for programming enthusiasts and offers hands-on coding projects, hackathons, and mentorship opportunities. (Perfect match based on your interests!)",
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
- FastAPI
- OpenAI API
- Python 3.8+
- Uvicorn (ASGI server)

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
- Verify CORS settings in backend
- Check browser console for network errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

MIT License - see LICENSE file for details
