# 🤖 AI Club Chatbot with Real Club Data

## Overview
The enhanced AI Club Chatbot now uses your real club data from `src/data/clubData.js` and includes school selection functionality. It provides accurate, school-specific recommendations based on comprehensive user profiling.

## ✨ Key Features

### 🏫 **School Selection**
- **Dynamic School List**: Automatically extracts available schools from your club data
- **School-Specific Filtering**: Only recommends clubs from the selected school
- **Interactive Selection**: Click-to-select school buttons for easy navigation

### 📊 **Real Club Data Integration**
- **Uses Actual Data**: No more placeholder clubs - only real clubs from your data file
- **Smart Data Transformation**: Converts your club data structure to AI-friendly format
- **Comprehensive Analysis**: Considers all club attributes (activities, benefits, commitment, etc.)

### 🎯 **Enhanced Recommendation Algorithm**
- **Exact Interest Matching**: Prioritizes clubs that match user's specific interests
- **Time Commitment Alignment**: Ensures clubs fit the user's schedule
- **Club Type Preference**: Matches preferred club environment
- **Grade Level Appropriateness**: Considers age-appropriate recommendations
- **Skill Development Focus**: Prioritizes clubs that build desired skills

## 📋 Component Props

```jsx
<AIClubChatbot 
  allClubData={allClubData}    // Array of school data objects from clubData.js
/>
```

## 🏗️ Expected Data Structure

The component expects the `allClubData` array from your `clubData.js` file:

```javascript
// From src/data/clubData.js
export const allClubData = [
  {
    school: 'East Forsyth High School',
    clubs: [
      {
        id: 'asl-club',
        name: 'American Sign Language Club',
        description: 'A student group that teaches and practices American Sign Language...',
        sponsor: 'Not listed on EFHS site...',
        category: 'Cultural',
        meetingFrequency: 'Weekly',
        meetingDay: 'Fridays at lunch...',
        requirements: 'Open to all students...',
        activities: ['Beginner & intermediate sign lessons', 'Deaf culture workshops', ...],
        commitment: 'Low–Medium — weekly practice plus occasional weekend outreach events',
        benefits: ['Basic ASL fluency', 'Cultural competency', ...]
      },
      // ... more clubs
    ]
  },
  {
    school: 'West Forsyth High School',
    clubs: [
      // ... clubs for West Forsyth
    ]
  }
  // ... more schools
];
```

## 🎯 Enhanced Questions Flow

The chatbot now asks 7 comprehensive questions:

1. **School Selection**: "Which school do you attend?" (with clickable buttons)
2. **Interests**: "What are your main interests?"
3. **Time Commitment**: "How much time can you commit weekly?"
4. **Club Type**: "What kind of club experience are you looking for?"
5. **Skills/Goals**: "What skills or goals do you want to develop?"
6. **Grade Level**: "What grade are you in?"
7. **Previous Experience**: "Have you been involved in clubs before?"

## 🔍 Data Transformation Logic

### Interest Extraction
```javascript
// Extracts interests from club data
const extractInterestsFromClub = (club) => {
  const interests = [];
  
  // Add category as an interest
  if (club.category) {
    interests.push(club.category);
  }
  
  // Add activities as interests (first 3)
  if (club.activities && Array.isArray(club.activities)) {
    interests.push(...club.activities.slice(0, 3));
  }
  
  // Add benefits as interests (first 2)
  if (club.benefits && Array.isArray(club.benefits)) {
    interests.push(...club.benefits.slice(0, 2));
  }
  
  return interests.length > 0 ? interests : [club.category || 'General'];
};
```

### Commitment Level Mapping
```javascript
// Maps commitment descriptions to standardized levels
const mapCommitmentLevel = (commitment) => {
  if (!commitment) return 'Medium';
  
  const commitmentStr = commitment.toLowerCase();
  if (commitmentStr.includes('low')) return 'Low';
  if (commitmentStr.includes('high')) return 'High';
  return 'Medium';
};
```

### Club Type Mapping
```javascript
// Maps categories to club types
const typeMap = {
  'Academic': 'Academic',
  'Arts': 'Creative',
  'STEM': 'Competitive',
  'Sports': 'Competitive',
  'Leadership': 'Leadership',
  'Cultural': 'Social',
  'Community Service': 'Social',
  'Religious': 'Social',
  'Support': 'Social',
  'Recreational': 'Social'
};
```

## 💻 Usage Examples

### Basic Implementation
```jsx
import { allClubData } from '../data/clubData';
import AIClubChatbot from '../components/AIClubChatbot';

function ClubsPage() {
  return (
    <div>
      {/* Your existing clubs page content */}
      
      {/* AI Chatbot with real club data */}
      <AIClubChatbot allClubData={allClubData} />
    </div>
  );
}
```

### With Existing Club Data Import
```jsx
// In your ClubsWebsite.jsx or similar component
import { allClubData, CategoryColors, getClubsBySchool, getAvailableSchools } from '../data/clubData';
import AIClubChatbot from '../components/AIClubChatbot';

function ClubsWebsite() {
  // Your existing state and logic
  
  return (
    <div>
      {/* Your existing clubs display */}
      
      {/* AI Chatbot */}
      <AIClubChatbot allClubData={allClubData} />
    </div>
  );
}
```

## 🔧 Backend API Enhancement

The backend now receives transformed club data:

```javascript
// Request body structure
{
  "userAnswers": {
    "school": "East Forsyth High School",
    "interests": "STEM, Robotics, Programming",
    "timeCommitment": "Medium", 
    "clubType": "Competitive",
    "skills": "Leadership, Technical skills",
    "gradeLevel": "11th grade",
    "previousExperience": "Some coding experience"
  },
  "clubs": [
    {
      "name": "ESports",
      "category": "STEM",
      "school": "East Forsyth High School",
      "interests": ["STEM", "Team practices", "Online scrimmages & ladder matches"],
      "timeCommitment": "Medium",
      "type": "Competitive",
      "gradeLevels": ["9", "10", "11", "12"],
      "mentors": ["Not listed on EFHS site..."],
      "description": "Student-run esports club that organizes varsity and club-level gaming teams..."
    }
    // ... more transformed clubs
  ],
  "selectedSchool": "East Forsyth High School"
}
```

## 🎨 UI Features

### School Selection Interface
- **Clickable Buttons**: Easy school selection with visual feedback
- **Dynamic List**: Automatically populated from your club data
- **Visual Feedback**: Selected school displayed in chat header

### Enhanced Chat Experience
- **Conversational Flow**: Natural responses between questions
- **School Context**: All messages reference the selected school
- **Error Handling**: Graceful handling of missing data or errors

## 🔒 Security & Performance

### Data Safety
- ✅ **No Data Modification**: Original club data remains unchanged
- ✅ **Local Processing**: School filtering happens client-side
- ✅ **Secure API Calls**: Only transformed data sent to backend
- ✅ **Error Handling**: Graceful fallbacks for missing data

### Performance Optimizations
- ✅ **Efficient Filtering**: School filtering with useEffect
- ✅ **Memoized Transformations**: Club data transformed once per school selection
- ✅ **Lazy Loading**: School list populated on demand

## 🚀 Getting Started

### 1. Import Club Data
```jsx
import { allClubData } from '../data/clubData';
```

### 2. Use the Component
```jsx
<AIClubChatbot allClubData={allClubData} />
```

### 3. Start the Backend Server
```bash
npm run server
```

## 🎯 Example Conversation Flow

```
Bot: Hi there! 👋 I'm your personal AI club advisor, and I'm here to help you discover amazing clubs at your school!

[School selection buttons appear]

User: [Clicks "East Forsyth High School"]

Bot: Perfect! I'm excited to help you discover clubs at East Forsyth High School!

Bot: Now, what are your main interests?

User: I'm interested in STEM and programming.

Bot: That sounds fascinating! I love how diverse your interests are.

Bot: How much time can you realistically commit each week?

User: About 3-5 hours.

Bot: Perfect! It's great that you're being realistic about your time commitment.

[Continues through all questions...]

Bot: 🤔 Let me analyze your preferences and find the perfect clubs for you at East Forsyth High School...

Bot: 🎉 Perfect! Based on your answers, here are my top recommendations for clubs at East Forsyth High School:

[Real club recommendations displayed]
```

## 🔧 Customization

### Modify School Selection
Edit the `handleSchoolSelection` function to customize school selection behavior.

### Adjust Data Transformation
Modify the helper functions (`extractInterestsFromClub`, `mapCommitmentLevel`, `mapClubType`) to change how club data is processed.

### Update Questions
Edit the `questions` array to modify the conversation flow.

## 🎉 Benefits

- **Real Data**: No more placeholder clubs - only actual clubs from your data
- **School-Specific**: Recommendations tailored to each school
- **Accurate Matching**: Better recommendations based on comprehensive data analysis
- **User-Friendly**: Easy school selection with clickable buttons
- **Maintainable**: Uses your existing club data structure
- **Scalable**: Works with any number of schools and clubs

The chatbot now provides genuinely useful, school-specific recommendations based on your real club data! 🚀
