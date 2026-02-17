import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../config/firebase';
import { BookOpen, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, user, loading } = useAuth();
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!loading && user) {
      navigate('/app', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      setError('');
      await signInWithGoogle();
      // OAuth redirect happens automatically — no need to navigate
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fcs-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 bg-noise relative px-4">
      {/* Back to Home - Absolute Positioned */}
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-fcs-blue transition-colors px-3 py-2 rounded-md hover:bg-stone-200/50 z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="w-full h-full min-h-screen flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-sm pointer-events-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-fcs-blue rounded-md flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-heading font-bold text-fcs-blue text-2xl tracking-tight">
              FCS ClubConnect
            </h1>
            <p className="text-stone-500 text-sm mt-1 font-medium">
              Forsyth County Schools District
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-md p-6">
            <h2 className="font-heading font-bold text-fcs-blue text-lg mb-2">
              Student Login
            </h2>
            <p className="text-stone-500 text-sm mb-6">
              Sign in with your school Google account to access ClubConnect.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-stone-300 rounded-md hover:bg-stone-50 hover:border-stone-400 transition-all text-sm font-semibold text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Google "G" icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {signingIn ? 'Redirecting...' : 'Continue with Google'}
            </button>

            <p className="text-center text-stone-400 text-[11px] mt-4">
              Use your @forsyth.k12.ga.us account for best experience.
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-stone-400 text-[11px] mt-6">
            &copy; {new Date().getFullYear()} ClubConnect &mdash; Forsyth County Schools
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;