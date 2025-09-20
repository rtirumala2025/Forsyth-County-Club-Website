#!/usr/bin/env python3
"""
Test script for the hybrid recommendation system.
Tests both rule-based matching and AI fallback functionality.
"""

import requests
import json
import time

def test_rule_based_matching():
    """Test rule-based matching with various queries"""
    print("🧪 Testing Rule-Based Matching")
    print("=" * 40)
    
    test_cases = [
        {
            "message": "I love programming and want to learn more",
            "sessionData": {"grade": 9, "interests": ["coding"]},
            "expected_source": "rules"
        },
        {
            "message": "I'm interested in business and entrepreneurship",
            "sessionData": {"grade": 11, "interests": ["business"]},
            "expected_source": "rules"
        },
        {
            "message": "I want to join a robotics club",
            "sessionData": {"grade": 10, "interests": ["engineering"]},
            "expected_source": "rules"
        },
        {
            "message": "I enjoy drawing and painting",
            "sessionData": {"grade": 9, "interests": ["art"]},
            "expected_source": "rules"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest {i}: {test_case['message']}")
        try:
            response = requests.post(
                "http://localhost:8000/api/recommend",
                json=test_case,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Status: {response.status_code}")
                print(f"   Source: {data.get('source')}")
                print(f"   Confidence: {data.get('confidence')}")
                print(f"   Reply: {data.get('reply', '')[:100]}...")
                
                if data.get('source') == test_case['expected_source']:
                    print("   ✅ Source matches expected")
                else:
                    print(f"   ❌ Expected {test_case['expected_source']}, got {data.get('source')}")
            else:
                print(f"❌ Status: {response.status_code}")
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"❌ Error: {e}")

def test_ai_fallback():
    """Test AI fallback for complex queries"""
    print("\n\n🤖 Testing AI Fallback")
    print("=" * 40)
    
    test_cases = [
        {
            "message": "I'm not sure what clubs would be good for someone who likes both science and art",
            "sessionData": {"grade": 10, "interests": ["science", "art"]},
            "expected_source": "ai"
        },
        {
            "message": "What clubs would help me prepare for college applications?",
            "sessionData": {"grade": 11, "interests": ["leadership"]},
            "expected_source": "ai"
        },
        {
            "message": "I'm new to the school and don't know what clubs exist",
            "sessionData": {"grade": 9, "interests": []},
            "expected_source": "ai"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest {i}: {test_case['message']}")
        try:
            response = requests.post(
                "http://localhost:8000/api/recommend",
                json=test_case,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Status: {response.status_code}")
                print(f"   Source: {data.get('source')}")
                print(f"   Confidence: {data.get('confidence')}")
                print(f"   Reply: {data.get('reply', '')[:100]}...")
                
                if data.get('source') == test_case['expected_source']:
                    print("   ✅ Source matches expected")
                else:
                    print(f"   ❌ Expected {test_case['expected_source']}, got {data.get('source')}")
            else:
                print(f"❌ Status: {response.status_code}")
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"❌ Error: {e}")

def test_error_handling():
    """Test error handling"""
    print("\n\n⚠️  Testing Error Handling")
    print("=" * 40)
    
    # Test with invalid JSON
    try:
        response = requests.post(
            "http://localhost:8000/api/recommend",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        print(f"Invalid JSON - Status: {response.status_code}")
    except Exception as e:
        print(f"Invalid JSON - Error: {e}")
    
    # Test with missing fields
    try:
        response = requests.post(
            "http://localhost:8000/api/recommend",
            json={"message": "test"},
            headers={"Content-Type": "application/json"}
        )
        print(f"Missing fields - Status: {response.status_code}")
        if response.status_code != 200:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"Missing fields - Error: {e}")

def test_performance():
    """Test response times"""
    print("\n\n⏱️  Testing Performance")
    print("=" * 40)
    
    test_data = {
        "message": "I love coding",
        "sessionData": {"grade": 9, "interests": ["coding"]}
    }
    
    times = []
    for i in range(5):
        start_time = time.time()
        try:
            response = requests.post(
                "http://localhost:8000/api/recommend",
                json=test_data,
                headers={"Content-Type": "application/json"}
            )
            end_time = time.time()
            response_time = end_time - start_time
            times.append(response_time)
            print(f"Request {i+1}: {response_time:.3f}s (Status: {response.status_code})")
        except Exception as e:
            print(f"Request {i+1}: Error - {e}")
    
    if times:
        avg_time = sum(times) / len(times)
        print(f"\nAverage response time: {avg_time:.3f}s")
        print(f"Min: {min(times):.3f}s, Max: {max(times):.3f}s")

def main():
    print("🚀 Testing Hybrid Recommendation System")
    print("=" * 50)
    
    # Check if backend is running
    try:
        health_response = requests.get("http://localhost:8000/api/health")
        if health_response.status_code == 200:
            print("✅ Backend is running")
        else:
            print("❌ Backend health check failed")
            return
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        print("Make sure to start the backend with: uvicorn main:app --reload --port 8000")
        return
    
    # Run tests
    test_rule_based_matching()
    test_ai_fallback()
    test_error_handling()
    test_performance()
    
    print("\n" + "=" * 50)
    print("🎉 Testing complete!")

if __name__ == "__main__":
    main()
