# AI Club Recommendation Chatbot Setup Instructions

## Overview
This AI-powered chatbot helps high school students find clubs that match their interests and preferences. It uses OpenAI's GPT-4o-mini to analyze student responses and recommend the best clubs.

## Features
- 🤖 AI-powered club recommendations using OpenAI GPT-4o-mini
- 💬 Interactive chat interface with free-text input
- 🎯 Personalized questions about interests, time commitment, and goals
- 📱 Responsive design that works on all devices
- 🔒 Safe integration that doesn't modify existing components
- 🎨 Beautiful UI matching your site's design

## Installation Steps

### 1. Install Dependencies
```bash
npm install openai
```

### 2. Set Up OpenAI API Key
Create a `.env` file in your project root and add your OpenAI API key:

```env
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

**To get an OpenAI API key:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

### 3. Add the Component to Your Project
The `AIClubChatbot.jsx` component is already created and ready to use.

### 4. Integration Example
The chatbot is already integrated into your `ClubsWebsite.jsx` page. Here's how it's used:

```jsx
import AIClubChatbot from '../components/AIClubChatbot';

// In your component
<AIClubChatbot clubs={yourClubsData} />
```

## Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `clubs` | Array | Yes | Array of club objects with the structure shown below |

## Club Data Structure
Each club object should have this structure:

```javascript
{
  "name": "Robotics Club",
  "category": "STEM",
  "interests": ["Robotics", "Programming", "Engineering"],
  "timeCommitment": "High",
  "type": "Competitive",
  "gradeLevels": ["9","10","11","12"],
  "mentors": ["Mr. Smith"],
  "description": "Build and compete with robots."
}
```

## How It Works

### 1. User Interaction
- Students click the chat button in the bottom-right corner
- The chatbot asks 4 questions about their preferences
- Users provide free-text answers

### 2. AI Analysis
- The chatbot sends user responses to OpenAI GPT-4o-mini
- AI analyzes preferences against available clubs
- Returns 3-5 personalized recommendations

### 3. Results Display
- Recommendations are shown with club names, descriptions, and match scores
- Users can start over or close the chat

## Questions Asked by the Chatbot

1. **Interests**: "What are your main interests? (e.g., STEM, Arts, Sports, Community Service, Music, etc.)"
2. **Time Commitment**: "How much time can you commit weekly? (Low: 1-2 hours, Medium: 3-5 hours, High: 6+ hours)"
3. **Club Type**: "What type of club do you prefer? (Competitive, Social, Academic, Creative, Leadership, etc.)"
4. **Skills/Goals**: "Any specific skills or goals you want to develop? (Optional)"

## Security Notes

⚠️ **Important**: The current implementation uses `dangerouslyAllowBrowser: true` for the OpenAI client. In production, you should:

1. **Use a backend API** to handle OpenAI requests
2. **Never expose API keys** in frontend code
3. **Implement rate limiting** and user authentication
4. **Add request validation** on the server side

## Customization

### Styling
The component uses Tailwind CSS classes that match your existing design. You can customize:
- Colors by modifying the gradient classes
- Size by changing the `w-96 h-[500px]` classes
- Position by adjusting the `bottom-6 right-6` classes

### Questions
Modify the `questions` array in the component to change the questions asked.

### AI Prompt
Customize the AI prompt in the `getAIRecommendations` function to change how the AI analyzes responses.

## Troubleshooting

### Common Issues

1. **"API key not found" error**
   - Make sure your `.env` file is in the project root
   - Ensure the variable name is `REACT_APP_OPENAI_API_KEY`
   - Restart your development server after adding the `.env` file

2. **"Network error" or "Failed to fetch"**
   - Check your internet connection
   - Verify your OpenAI API key is valid
   - Ensure you have sufficient OpenAI credits

3. **Component not appearing**
   - Check that the component is properly imported
   - Verify the `clubs` prop is being passed correctly
   - Look for console errors in browser developer tools

### Error Handling
The component includes comprehensive error handling:
- Network errors are caught and displayed to users
- Invalid API responses are handled gracefully
- Loading states prevent multiple requests

## Performance Considerations

- The chatbot only loads when opened
- AI requests are debounced to prevent spam
- Error states are cached to prevent repeated failed requests
- The component is optimized for React rendering

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ❌ Internet Explorer (not supported)

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your OpenAI API key and credits
3. Ensure all dependencies are installed
4. Check that your club data structure is correct

## Future Enhancements

Potential improvements you could add:
- Save user preferences for future sessions
- Add more detailed club information in recommendations
- Implement user feedback on recommendations
- Add analytics to track popular clubs
- Create admin panel for managing club data
