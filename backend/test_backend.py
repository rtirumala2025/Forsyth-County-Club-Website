#!/usr/bin/env python3
"""
Simple test script to verify the FastAPI backend is working correctly.
Run this after starting the backend server.
"""

import requests
import json

def test_health_endpoint():
    """Test the health check endpoint"""
    try:
        response = requests.get("http://localhost:8000/api/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ Health endpoint working")
            print(f"   Status: {data.get('status')}")
            print(f"   AI Configured: {data.get('aiConfigured')}")
            return True
        else:
            print(f"❌ Health endpoint failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False

def test_ai_endpoint():
    """Test the AI endpoint (requires OpenAI API key)"""
    try:
        test_data = {
            "message": "Hello, I'm interested in coding clubs",
            "sessionData": {
                "grade": 10,
                "interests": ["coding", "technology"],
                "experience_types": [],
                "clubs_viewed": [],
                "query_history": []
            }
        }
        
        response = requests.post(
            "http://localhost:8000/api/ai",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ AI endpoint working")
            print(f"   Response: {data.get('reply', 'No reply')[:100]}...")
            return True
        else:
            print(f"❌ AI endpoint failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ AI endpoint error: {e}")
        return False

def test_rules_endpoint():
    """Test the rules endpoint"""
    try:
        response = requests.get("http://localhost:8000/api/rules")
        if response.status_code == 200:
            data = response.json()
            print("✅ Rules endpoint working")
            print(f"   Message: {data.get('message')}")
            return True
        else:
            print(f"❌ Rules endpoint failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Rules endpoint error: {e}")
        return False

def main():
    print("🧪 Testing Forsyth County Club Backend")
    print("=" * 40)
    
    # Test all endpoints
    health_ok = test_health_endpoint()
    print()
    
    rules_ok = test_rules_endpoint()
    print()
    
    ai_ok = test_ai_endpoint()
    print()
    
    # Summary
    print("=" * 40)
    if health_ok and rules_ok:
        print("🎉 Backend is working correctly!")
        if ai_ok:
            print("🤖 AI functionality is working!")
        else:
            print("⚠️  AI functionality may need OpenAI API key configuration")
    else:
        print("❌ Backend has issues. Check the error messages above.")
    
    print("\n💡 To start the backend: uvicorn main:app --reload --port 8000")

if __name__ == "__main__":
    main()
