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
  const [hasProfile, setHasProfile] = useState<boolean | null>(null); // null = not checked yet
  const [error, setError] = useState<Error | null>(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkAuthAndProfile = async () => {
      try {
        // 1. Get Session & User
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const currentUser = session?.user ?? null;

        if (currentUser) {
          // 2. Check Profile Existence
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('firebase_uid', currentUser.id)
            .maybeSingle();

          if (profileError) {
            console.error("AuthGuard profile check error:", profileError);
            // In case of error (e.g. network), we might want to fail safe or block. 
            // For now, let's assume no profile to be safe and force check again or let error boundary catch.
            // But to prevent blocking valid users on network blip, we might retry.
            // Here we just set hasProfile false to force setup if strictly needed, or maybe handle error.
            // Simplest: treat error as "no profile found" for safety? Or throw?
            // Let's set user but keep hasProfile null if error? No, let's set hasProfile false.
            if (mounted) setHasProfile(false);
          } else {
            if (mounted) setHasProfile(!!data);
          }
        }

        if (mounted) {
          setUser(currentUser);
          setLoading(false);
        }

      } catch (err: any) {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    checkAuthAndProfile();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Re-run check on auth change implies possible user change
        // For simplicity, we can just reload logic or set user directly. 
        // But profile check is async. 
        // Best to rely on the functional update or separate effect if user changes.
        // Since this is a simple guard, full re-check is safer.
        if (mounted) {
          setLoading(true); // Reset loading to force wait for profile check
          checkAuthAndProfile();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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

  // ── PROFILE GATEKEEPER ─────────────────────────────────────────
  // If user is logged in but has no profile, force redirect to Profile Setup.
  // Exception: If they are ALREADY on /profile-setup, allow access (prevent loop).
  if (hasProfile === false && location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }
  // ───────────────────────────────────────────────────────────────

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
