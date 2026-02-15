import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../config/firebase';

/**
 * CreateAccount now redirects to Login.
 * Google OAuth handles account creation automatically —
 * if the user doesn't have an account, one is created on first sign-in.
 */
const CreateAccount = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/app', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-fcs-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default CreateAccount;