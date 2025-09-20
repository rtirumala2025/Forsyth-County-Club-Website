"""
Rule-based club recommendation system.
This module contains simple pattern matching logic for club recommendations.
"""

from typing import Dict, List, Optional

# Smart rule mappings for club recommendations
RULE_MAPPINGS = {
    "coding": {
        "keywords": ["coding", "programming", "code", "software", "development", "python", "javascript", "java", "web dev", "computer science", "tech"],
        "response": "🎯 Perfect match! The Coding Club is ideal for you! It offers hands-on programming projects, hackathons, mentorship opportunities, and connects you with like-minded tech enthusiasts. You'll build real projects and develop skills that are valuable for college and career."
    },
    "business": {
        "keywords": ["business", "entrepreneur", "startup", "finance", "marketing", "management", "leadership", "commerce", "economics"],
        "response": "💼 Excellent choice! The Business Club (FBLA/DECA) is perfect for you! It focuses on entrepreneurship, real-world case studies, leadership development, and business competitions. Great for building skills that colleges and employers value."
    },
    "robotics": {
        "keywords": ["robotics", "robot", "engineering", "mechanical", "arduino", "sensors", "automation", "STEM", "technology"],
        "response": "🤖 Awesome! The Robotics Club is a fantastic fit! You'll work on building robots, programming microcontrollers, competing in robotics competitions, and developing engineering skills. Perfect for STEM enthusiasts!"
    },
    "debate": {
        "keywords": ["debate", "speaking", "public speaking", "argument", "persuasion", "politics", "current events", "speech", "forensics"],
        "response": "🗣️ Great match! The Debate Club is perfect for you! It develops critical thinking, public speaking, research skills, and confidence. Excellent for college applications and future leadership roles."
    },
    "art": {
        "keywords": ["art", "drawing", "painting", "creative", "design", "visual", "sketching", "digital art", "graphic design", "creative"],
        "response": "🎨 Perfect! The Art Club is ideal for creative minds! It's a supportive space to explore different mediums, techniques, and styles. Great for building a portfolio and expressing your creativity."
    },
    "music": {
        "keywords": ["music", "band", "instrument", "singing", "guitar", "piano", "orchestra", "choir", "musical", "performance"],
        "response": "🎵 Wonderful! The Music Club welcomes all musicians! Whether you play an instrument, sing, or want to learn, there's a place for you. Great for building confidence, teamwork, and musical skills."
    },
    "sports": {
        "keywords": ["sports", "athletic", "fitness", "basketball", "soccer", "tennis", "volleyball", "track", "athletics", "team"],
        "response": "🏅 Great choice! Our Sports Clubs offer opportunities for competition, fitness, and teamwork. Whether you're competitive or just want to stay active, there's a sport for everyone!"
    },
    "science": {
        "keywords": ["science", "research", "experiment", "chemistry", "biology", "physics", "lab", "scientific", "STEM", "research"],
        "response": "🔬 Excellent! The Science Club is perfect for curious minds! You'll conduct experiments, attend science fairs, explore cutting-edge research, and develop critical thinking skills. Great for STEM careers!"
    }
}

def match_club(message: str, session_data: Dict) -> Optional[str]:
    """
    Match user message against rule-based patterns to find club recommendations.
    
    Args:
        message: User's input message
        session_data: Dictionary containing user session information
        
    Returns:
        String with club recommendation if match found, None otherwise
    """
    if not message:
        return None
    
    message_lower = message.lower()
    
    # Check for direct keyword matches
    for club_type, rule_data in RULE_MAPPINGS.items():
        keywords = rule_data["keywords"]
        
        # Check if any keyword appears in the message
        if any(keyword in message_lower for keyword in keywords):
            # Check if user's interests align with this club type
            user_interests = session_data.get("interests", [])
            if club_type in [interest.lower() for interest in user_interests]:
                # Strong match - user explicitly mentioned this interest
                return f"{rule_data['response']} (Perfect match based on your interests!)"
            else:
                # Good match - keyword found but not in user's stated interests
                return f"{rule_data['response']} (This might interest you based on your message!)"
    
    # Check for grade-specific recommendations
    grade = session_data.get("grade")
    if grade:
        if grade <= 9:
            # Freshman/sophomore recommendations
            if any(word in message_lower for word in ["new", "beginner", "start", "learn", "explore"]):
                return "🌟 As a newer student, I recommend starting with clubs that match your interests. The Coding Club, Art Club, or Science Club are great for exploring new passions and making friends!"
        elif grade >= 11:
            # Junior/senior recommendations
            if any(word in message_lower for word in ["leadership", "lead", "mentor", "college", "career"]):
                return "🎓 As an upperclassman, consider leadership roles in clubs! The Business Club, Debate Club, or becoming a mentor in Coding Club could be great for college applications and personal growth."
    
    # Check for specific question patterns
    if any(word in message_lower for word in ["what", "which", "recommend", "suggest", "help"]):
        if "club" in message_lower:
            return "🤔 I'd be happy to help you find the right club! What are your main interests or hobbies? I can suggest clubs that match your passions and goals."
    
    # Check for experience level indicators
    if any(word in message_lower for word in ["experienced", "advanced", "expert", "pro"]):
        return "🚀 For experienced students, consider taking on leadership roles or starting new initiatives in clubs that match your expertise! You could mentor others and make a real impact."
    
    if any(word in message_lower for word in ["beginner", "new", "learning", "start"]):
        return "🌱 Great! Many clubs welcome beginners and offer mentorship programs. Consider joining clubs that align with your interests - it's a great way to learn and meet new people!"
    
    # No specific match found
    return None

def get_rule_based_recommendations(message: str, session_data: Dict) -> Dict:
    """
    Get rule-based recommendations with metadata.
    
    Args:
        message: User's input message
        session_data: Dictionary containing user session information
        
    Returns:
        Dictionary with recommendation data
    """
    recommendation = match_club(message, session_data)
    
    if recommendation:
        return {
            "source": "rules",
            "reply": recommendation,
            "confidence": "high" if "🎯" in recommendation else "medium",
            "matched_patterns": _extract_matched_patterns(message)
        }
    
    return {
        "source": "rules",
        "reply": None,
        "confidence": "none",
        "matched_patterns": []
    }

def _extract_matched_patterns(message: str) -> List[str]:
    """Extract which patterns matched in the message."""
    message_lower = message.lower()
    matched = []
    
    for club_type, rule_data in RULE_MAPPINGS.items():
        keywords = rule_data["keywords"]
        if any(keyword in message_lower for keyword in keywords):
            matched.append(club_type)
    
    return matched

def get_available_clubs() -> List[str]:
    """Get list of available club types for reference."""
    return list(RULE_MAPPINGS.keys())

def add_custom_rule(club_type: str, keywords: List[str], response: str) -> bool:
    """
    Add a custom rule for club matching.
    
    Args:
        club_type: Name of the club type
        keywords: List of keywords to match
        response: Response text for this club type
        
    Returns:
        True if successfully added, False otherwise
    """
    try:
        RULE_MAPPINGS[club_type.lower()] = {
            "keywords": [kw.lower() for kw in keywords],
            "response": response
        }
        return True
    except Exception:
        return False
