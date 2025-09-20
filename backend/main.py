from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import openai
import os
from dotenv import load_dotenv
import json
from rules import get_rule_based_recommendations, match_club

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Forsyth County Club AI Backend",
    description="AI-powered club recommendation service",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Pydantic models
class SessionData(BaseModel):
    grade: Optional[int] = None
    interests: List[str] = []
    experience_types: List[str] = []
    clubs_viewed: List[str] = []
    query_history: List[str] = []

class AIRequest(BaseModel):
    message: str
    sessionData: SessionData

class AIResponse(BaseModel):
    reply: str

class ErrorResponse(BaseModel):
    error: str

class HybridRecommendationResponse(BaseModel):
    source: str  # "rules" or "ai"
    reply: str
    confidence: Optional[str] = None
    matched_patterns: Optional[List[str]] = None

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "aiConfigured": bool(os.getenv("OPENAI_API_KEY")),
        "service": "Forsyth County Club AI Backend"
    }

# Rules endpoint (placeholder)
@app.get("/api/rules")
async def get_rules():
    """Get club rules and guidelines (placeholder)"""
    return {
        "message": "Rules endpoint - to be implemented",
        "rules": []
    }

# Main AI endpoint
@app.post("/api/ai", response_model=AIResponse)
async def get_ai_response(request: AIRequest):
    """Get AI-powered club recommendations and responses"""
    try:
        # Check if OpenAI API key is configured
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API key not configured"
            )
        
        # Prepare system context with session data
        session_context = ""
        if request.sessionData.grade:
            session_context += f"User is in grade {request.sessionData.grade}. "
        if request.sessionData.interests:
            session_context += f"User interests: {', '.join(request.sessionData.interests)}. "
        if request.sessionData.experience_types:
            session_context += f"Experience types: {', '.join(request.sessionData.experience_types)}. "
        if request.sessionData.clubs_viewed:
            session_context += f"Previously viewed clubs: {', '.join(request.sessionData.clubs_viewed)}. "
        if request.sessionData.query_history:
            session_context += f"Previous queries: {'; '.join(request.sessionData.query_history[-3:])}. "
        
        # Create system message
        system_message = f"""You are a helpful Smart Club Recommender for the Forsyth County Club Website. 
        Your role is to help students discover clubs that match their interests and personality.
        
        Context about the user: {session_context}
        
        Guidelines:
        - Be friendly, encouraging, and helpful
        - Focus on club recommendations and discovery
        - Ask clarifying questions when needed
        - Provide specific club suggestions when possible
        - Keep responses concise but informative
        - Use emojis appropriately to make responses engaging
        - If the user asks about specific clubs, provide detailed information
        - If the user is unsure, guide them through the discovery process
        - Never mention "AI" or "artificial intelligence" - you are a Smart Club Recommender
        - Present yourself as an intelligent recommendation system, not an AI
        
        Respond naturally to their message: "{request.message}" """
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": request.message}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        # Extract the AI response
        ai_reply = response.choices[0].message.content.strip()
        
        return AIResponse(reply=ai_reply)
        
    except openai.error.OpenAIError as e:
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI API error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Legacy endpoint for compatibility with existing frontend
@app.post("/api/ai-recommendations")
async def get_ai_recommendations(request: dict):
    """Legacy endpoint for AI recommendations (for compatibility)"""
    try:
        # Extract user query from the request
        user_query = request.get("userAnswers", {}).get("query", "")
        selected_school = request.get("selectedSchool")
        conversation_context = request.get("conversationContext", {})
        
        # Create session data from conversation context
        session_data = SessionData(
            grade=conversation_context.get("grade"),
            interests=conversation_context.get("interests", []),
            experience_types=conversation_context.get("experience_types", []),
            clubs_viewed=conversation_context.get("clubs_viewed", []),
            query_history=conversation_context.get("query_history", [])
        )
        
        # Create AI request
        ai_request = AIRequest(
            message=user_query,
            sessionData=session_data
        )
        
        # Get AI response
        ai_response = await get_ai_response(ai_request)
        
        # Return in the expected format for the frontend
        return {
            "recommendations": [],  # AI will provide text-based recommendations
            "aiResponse": ai_response.reply,
            "status": "success"
        }
        
    except Exception as e:
        return {
            "recommendations": [],
            "error": str(e),
            "status": "error"
        }

# Hybrid recommendation endpoint
@app.post("/api/recommend", response_model=HybridRecommendationResponse)
async def get_hybrid_recommendation(request: AIRequest):
    """
    Get hybrid club recommendations using rule-based matching first, then AI fallback.
    
    This endpoint:
    1. First tries rule-based pattern matching
    2. If no clear match, falls back to AI-powered recommendations
    3. Returns the source of the recommendation (rules or ai)
    """
    try:
        # Step 1: Try rule-based matching first
        rule_result = get_rule_based_recommendations(request.message, request.sessionData.dict())
        
        if rule_result["reply"]:
            # Rule-based match found
            return HybridRecommendationResponse(
                source="rules",
                reply=rule_result["reply"],
                confidence=rule_result["confidence"],
                matched_patterns=rule_result["matched_patterns"]
            )
        
        # Step 2: No rule match found, fall back to AI
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500, 
                detail="No rule-based match found and OpenAI API key not configured"
            )
        
        # Prepare system context with session data
        session_context = ""
        if request.sessionData.grade:
            session_context += f"User is in grade {request.sessionData.grade}. "
        if request.sessionData.interests:
            session_context += f"User interests: {', '.join(request.sessionData.interests)}. "
        if request.sessionData.experience_types:
            session_context += f"Experience types: {', '.join(request.sessionData.experience_types)}. "
        if request.sessionData.clubs_viewed:
            session_context += f"Previously viewed clubs: {', '.join(request.sessionData.clubs_viewed)}. "
        if request.sessionData.query_history:
            session_context += f"Previous queries: {'; '.join(request.sessionData.query_history[-3:])}. "
        
        # Create system message for smart recommendations
        system_message = f"""You are a helpful Smart Club Recommender for the Forsyth County Club Website. 
        Your role is to help students discover clubs that match their interests and personality.
        
        Context about the user: {session_context}
        
        Guidelines:
        - Be friendly, encouraging, and helpful
        - Focus on club recommendations and discovery
        - Ask clarifying questions when needed
        - Provide specific club suggestions when possible
        - Keep responses concise but informative
        - Use emojis appropriately to make responses engaging
        - If the user asks about specific clubs, provide detailed information
        - If the user is unsure, guide them through the discovery process
        - Never mention "AI" or "artificial intelligence" - you are a Smart Club Recommender
        - Present yourself as an intelligent recommendation system, not an AI
        - Provide personalized recommendations based on the user's context
        
        Note: Rule-based matching didn't find a clear match, so provide smart personalized recommendations.
        
        Respond naturally to their message: "{request.message}" """
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": request.message}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        # Extract the AI response
        ai_reply = response.choices[0].message.content.strip()
        
        return HybridRecommendationResponse(
            source="ai",
            reply=ai_reply,
            confidence="medium"
        )
        
    except openai.error.OpenAIError as e:
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI API error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
