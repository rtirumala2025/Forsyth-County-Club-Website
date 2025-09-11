import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Users, Sparkles } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuth } from '../config/firebase';

const CreateAccount = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log("Submitting form with:", { name, email });
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User created:", user); // ✅ this must run

      // 🔥 Save additional user info to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: user.email,
        bio: "",
        grade: "",
        clubs: [],
        createdAt: new Date(),
      });

      await syncUser(); // Sync user to backend
      navigate('/');
    } catch (err) {
      console.error("ERROR CREATING ACCOUNT:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('That email is already registered.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('Failed to create account. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      await syncUser(); // Sync user to backend
      navigate('/');
    } catch (err) {
      setError('Google sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white flex items-center justify-center p-2 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-35 animate-blob animation-delay-4000"></div>
      </div>
      <div className="max-w-lg w-full relative z-10">
        {/* Header with school colors */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full mb-3 shadow-lg">
            <Users size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-1 welcome-text">
            Welcome to the Forsyth County Club Website
          </h2>
          <p className="text-base font-medium welcome-text">Join the community!</p>
        </div>
        {/* Create Account Form with school colors */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-yellow-800 mb-1">
                Full Name
              </label>
              <div className="relative">
                <Users size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-black"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-yellow-800 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-black"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-yellow-800 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-black"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-yellow-800 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-black"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white py-3 px-6 rounded-xl font-bold text-base hover:from-blue-500 hover:to-blue-600 focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Sparkles size={18} className="mr-2" />
                  Create Account
                </div>
              )}
            </button>
          </form>

          {/* Google Sign-Up Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center bg-white border-2 border-blue-400 text-blue-700 font-semibold py-2.5 px-6 rounded-xl shadow hover:bg-blue-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.7 30.74 0 24 0 14.82 0 6.73 5.1 2.69 12.55l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.93 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.13c-1.13-3.36-1.13-6.9 0-10.26l-7.98-6.2C.99 15.1 0 19.41 0 24c0 4.59.99 8.9 2.69 12.33l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.74 0 12.68-2.22 16.85-6.05l-7.19-5.6c-2.01 1.35-4.59 2.15-7.66 2.15-6.38 0-11.87-3.63-14.33-8.88l-7.98 6.2C6.73 42.9 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
              Sign up with Google
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              disabled={loading}
              className="w-full flex items-center justify-center bg-white border-2 border-blue-400 text-blue-700 font-semibold py-2.5 px-6 rounded-xl shadow hover:bg-blue-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="w-4 h-4 mr-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </span>
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 text-center py-2 text-gray-600 text-sm bg-white border-t border-gray-200">
        Designed & Created by Ritvik Tirumala
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        /* Force welcome text to be dark blue */
        .welcome-text {
          color: #1e3a8a !important;
        }
        .welcome-subtitle {
          color: #1e40af !important;
        }
      `}</style>
    </div>
  );
};

const syncUser = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("No current user to sync.");
      return;
    }

    const token = await user.getIdToken();
    console.log("Syncing user to backend with token:", token);

    const res = await fetch('http://localhost:3001/api/sync-user', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.warn("Backend sync failed, but continuing with account creation:", await res.json());
    } else {
      console.log("User synced successfully");
    }
  } catch (error) {
    console.warn("Backend sync failed, but continuing with account creation:", error);
  }
};

export default CreateAccount; 