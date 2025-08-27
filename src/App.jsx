import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './config/firebase';
import ClubsWebsite from './pages/ClubsWebsite';
import Login from './pages/Login';
import Compare from './pages/Compare';
import Events from './pages/Events';
import CreateAccount from './pages/CreateAccount';
import About from './pages/About';
import Profile from './pages/Profile';
import Calendar from './pages/Calendar';

// Test component to debug routing
const TestComponent = () => {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">App is Loading!</h1>
        <p className="text-blue-600">If you can see this, the React app is working.</p>
      </div>
    </div>
  );
};

// Simple test component without any dependencies
const SimpleTestComponent = () => {
  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-4">Simple Test Component</h1>
        <p className="text-green-600 mb-4">This component has no dependencies and should always render.</p>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-800">If you can see this, React is working properly.</p>
          <p className="text-gray-600 text-sm mt-2">Check the browser console for any errors.</p>
        </div>
      </div>
    </div>
  );
};

// Temporary bypass component for testing
const BypassAuth = ({ children }) => {
  return children;
};

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

  return user ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/test" element={<TestComponent />} />
        <Route path="/simple" element={<SimpleTestComponent />} />
        <Route path="/bypass" element={<ClubsWebsite />} />
        <Route path="/debug" element={<ClubsWebsite />} />
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
          element={<Navigate to="/home" replace />} 
        />
        <Route 
          path="/home" 
          element={<ClubsWebsite />} 
        />
        <Route 
          path="/compare" 
          element={
            <ProtectedRoute>
              <Compare />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/events" 
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
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
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return <AppRoutes />;
};

export default App;
