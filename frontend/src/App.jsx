import React from 'react';
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
  ClubQuiz
} from './components/lazy/LazyPages';
import AdminDashboard from './pages/AdminDashboard';

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

  return user ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Router>
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
          element={<Navigate to="/home" replace />} 
        />
        <Route 
          path="/home" 
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return <AppRoutes />;
};

export default App;
