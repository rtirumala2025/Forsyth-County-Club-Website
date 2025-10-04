# Forsyth County Club Website

A modern web application for discovering and joining high school clubs in Forsyth County, featuring an AI-powered recommendation system.

##  Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start the development server
npm start

# Start the backend server (in a separate terminal)
npm run server
```

##  Project Structure

```
forsyth-county-club-website/
├──  docs/                          # Documentation files
│   ├── AI_CHATBOT_SETUP.md
│   ├── ENHANCED_CHATBOT_USAGE.md
│   ├── ENHANCED_INTENT_ANALYSIS_DOCUMENTATION.md
│   ├── FOLLOW_UP_CHATBOT_DOCUMENTATION.md
│   ├── REAL_CLUB_DATA_USAGE.md
│   ├── REVAMPED_SYSTEM_SUMMARY.md
│   └── SECURITY_SETUP.md
│
├──  public/                        # Static assets
│   ├── default-avatar.svg
│   ├── favicon.ico
│   └── index.html
│
├──  src/                           # Frontend React application
│   ├──  components/                # React components
│   │   ├──  auth/                  # Authentication components
│   │   ├──  chatbot/               # AI chatbot components
│   │   │   ├── AIClubChatbot.jsx
│   │   │   ├── AIClubChatbotExample.jsx
│   │   │   └── AIClubChatbot.test.jsx
│   │   ├──  club/                  # Club-related components
│   │   ├──  common/                # Shared/common components
│   │   ├──  layout/                # Layout components
│   │   ├──  profile/               # User profile components
│   │   └──  ui/                    # UI utility components
│   │       └── CategoryColors.js
│   ├──  config/                    # Configuration files
│   │   ├── api.js
│   │   ├── firebase.js
│   │   └── firebaseConfig.js
│   ├──  data/                      # Static data files
│   ├──  hooks/                     # Custom React hooks
│   ├──  pages/                     # Page components
│   ├──  utils/                     # Utility functions
│   ├── App.jsx                       # Main App component
│   ├── App.css                       # App styles
│   └── index.js                      # Entry point
│
├──  server/                        # Backend server
│   ├──  backups/                   # Backup server files
│   │   ├── simple-server.js
│   │   ├── working-server.js
│   │   └── node-v18.20.2.pkg
│   ├──  config/                    # Server configuration
│   ├──  controllers/               # Route controllers
│   ├──  data/                      # Server data files
│   ├──  routes/                    # API routes
│   ├──  services/                  # Business logic services
│   ├──  utils/                     # Server utilities
│   └── server.js                     # Main server file
│
├──  backend/                       # Legacy backend (if any)
├──  club-website/                  # Legacy frontend (if any)
├── package.json                      # Project dependencies
├── package-lock.json                 # Locked dependencies
├── postcss.config.js                 # PostCSS configuration
└── README.md                         # This file
```

##  Available Scripts

- `npm start` - Start the React development server
- `npm run build` - Build the production version
- `npm test` - Run tests
- `npm run server` - Start the backend server
- `npm run dev` - Start both frontend and backend concurrently
- `npm run server:dev` - Start backend with nodemon for development

##  Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# OpenAI API (for AI recommendations)
OPENAI_API_KEY=your_openai_api_key_here

# Firebase (for authentication)
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Server configuration
PORT=5001
NODE_ENV=development
```

##  Features

- **AI-Powered Recommendations**: Intelligent club matching based on user preferences
- **Real-time Chatbot**: Interactive AI assistant for club discovery
- **User Authentication**: Secure login and registration
- **Club Management**: Browse, search, and join clubs
- **Responsive Design**: Works on desktop and mobile devices
- **Follow-up Recommendations**: Context-aware follow-up suggestions

##  AI Recommendation System

The application uses a sophisticated recommendation algorithm that considers:
- User interests and preferences
- Time commitment availability
- Club type preferences (competitive, social, academic, etc.)
- Grade level appropriateness
- Previous recommendations and follow-up requests

##  Documentation

Detailed documentation is available in the `docs/` folder:
- AI Chatbot Setup and Usage
- Enhanced Intent Analysis
- Follow-up Recommendation System
- Security Setup Guidelines
- Real Club Data Integration

##  Deployment

### Frontend (React)
```bash
npm run build
# Deploy the build/ folder to your hosting service
```

### Backend (Node.js)
```bash
# Set NODE_ENV=production
npm start
# Deploy to your server or cloud platform
```

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

##  License

This project is licensed under the MIT License.
