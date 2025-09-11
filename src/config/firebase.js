import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, signInWithGooglePopup } from './firebaseConfig';
import { storage } from './firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { auth, db, storage };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        console.log("Auth state changed:", firebaseUser); // Debug log
        if (firebaseUser) {
          console.log("User is authenticated:", firebaseUser.email);
        } else {
          console.log("User is not authenticated");
        }
        setUser(firebaseUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase auth error:", error);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    return auth.signInWithEmailAndPassword(email, password);
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };

  const signInWithGoogle = async () => {
    return signInWithGooglePopup();
  };

  const value = {
    user,
    login,
    logout,
    signInWithGoogle,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 