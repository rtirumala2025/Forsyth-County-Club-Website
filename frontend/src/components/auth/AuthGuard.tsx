import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';

const AuthGuard = ({ children, requiredRole = null, fallback = null }: {
  children: React.ReactNode;
  requiredRole?: string | null;
  fallback?: React.ReactNode | null;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      setError(err);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="w-8 h-8 border-2 border-fcs-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Handle authentication error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-stone-600 mb-4">There was an error with authentication.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-fcs-blue hover:bg-fcs-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access (stubbed — roles will come from Supabase profiles later)
  if (requiredRole && requiredRole !== 'user') {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-stone-600 mb-4">You don't have permission to access this page.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
