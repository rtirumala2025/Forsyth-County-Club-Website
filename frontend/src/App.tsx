// Step 1: Convert App into a stateful component so we can control the Chatbot's visibility
// Also, ensure we import React hooks and the Chatbot component
import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './config/firebase';
import AuthGuard from './components/auth/AuthGuard';
import {
  ClubsWebsite,
  Login,
  Compare,
  Events,
  CreateAccount,
  About,
  Profile,
  Calendar,
  ClubQuiz,
  ProfileSetup,
  ParentVerify,
  LandingPage,
} from './components/lazy/LazyPages';
import AdminDashboard from './pages/AdminDashboard';
import Chatbot from './components/Chatbot'; // Step 2: Import the Chatbot component
import ChatbotPage from './pages/ChatbotPage';

// Removed test components for security

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to home if already authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Navigate to="/app" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Removed insecure bypass routes for security */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={<LandingPage />}
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <ClubsWebsite />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={<Navigate to="/app" replace />}
      />
      <Route
        path="/clubs/:schoolSlug/:clubSlug"
        element={<ClubsWebsite />}
      />
      <Route
        path="/compare"
        element={
          <AuthGuard>
            <Compare />
          </AuthGuard>
        }
      />
      <Route
        path="/events"
        element={
          <AuthGuard>
            <Events />
          </AuthGuard>
        }
      />
      <Route
        path="/create-account"
        element={
          <PublicRoute>
            <CreateAccount />
          </PublicRoute>
        }
      />
      <Route
        path="/about"
        element={
          <AuthGuard>
            <About />
          </AuthGuard>
        }
      />
      <Route
        path="/profile"
        element={
          <AuthGuard>
            <Profile />
          </AuthGuard>
        }
      />
      <Route
        path="/calendar"
        element={
          <AuthGuard>
            <Calendar />
          </AuthGuard>
        }
      />
      <Route
        path="/club-quiz"
        element={
          <AuthGuard>
            <ClubQuiz />
          </AuthGuard>
        }
      />
      <Route
        path="/admin"
        element={
          <AuthGuard requiredRole="admin">
            <AdminDashboard />
          </AuthGuard>
        }
      />
      <Route
        path="/profile-setup"
        element={
          <AuthGuard>
            <ProfileSetup />
          </AuthGuard>
        }
      />
      <Route
        path="/verify/:signatureId"
        element={<ParentVerify />}
      />
      {/* Full-page Chatbot route: uses same component with fullPage layout */}
      <Route
        path="/chatbot"
        element={<ChatbotPage />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  // Step 3: Add local state to control Chatbot open/close
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Step 4: Toggle handler passed down to Chatbot via onToggle
  const handleToggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  // Step 7: Listen for global events so existing page buttons can open/toggle the Chatbot
  // Any component can trigger: window.dispatchEvent(new Event('open-chatbot'))
  // or: window.dispatchEvent(new Event('toggle-chatbot'))
  useEffect(() => {
    const openHandler = () => setIsChatOpen(true);
    const toggleHandler = () => setIsChatOpen((prev) => !prev);
    window.addEventListener('open-chatbot', openHandler);
    window.addEventListener('toggle-chatbot', toggleHandler);
    return () => {
      window.removeEventListener('open-chatbot', openHandler);
      window.removeEventListener('toggle-chatbot', toggleHandler);
    };
  }, []);

  return (
    <Router>
      {/* App routes render the main application */}
      <AppRoutes />

      {/* Step 5: Floating toggle button (bottom-right) accessible via keyboard */}
      <button
        type="button"
        onClick={handleToggleChat}
        aria-label={isChatOpen ? 'Close chat' : 'Open chat'}
        title={isChatOpen ? 'Close chat' : 'Open chat'}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        {/* Simple, distinctive chat icon as requested */}
        <span role="img" aria-hidden="true" className="text-xl"></span>
      </button>

      {/* Step 6: Render Chatbot and wire up visibility control via isOpen/onToggle */}
      {/* Chatbot internally uses REACT_APP_API_URL (defaults to http://localhost:8000/api) to call the backend */}
      <Chatbot isOpen={isChatOpen} onToggle={handleToggleChat} />
    </Router>
  );
}
  ;

export default App;
