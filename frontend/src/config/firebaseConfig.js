import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Secure Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCIFI83oD_B0zF_H72qMODRDpw1UfT4hzQ",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "wfhs-club-webapp.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "wfhs-club-webapp",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "wfhs-club-webapp.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "599643093665",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:599643093665:web:a906f4edc33823badc4ee0",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-N66D9HT1G4"
};

// Validate required environment variables (only in production)
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Environment validation
const isDevelopment = process.env.REACT_APP_ENVIRONMENT === 'development';
const isProduction = process.env.REACT_APP_ENVIRONMENT === 'production';

if (!isDevelopment && !isProduction) {
  console.warn('REACT_APP_ENVIRONMENT not set, defaulting to development');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export const provider = new GoogleAuthProvider();
export const signInWithGooglePopup = () => signInWithPopup(auth, provider);

// Helper function to fetch user profile from Firestore
export async function getUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;

  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No profile found!");
    return null;
  }
}

// Helper function to update user profile in Firestore
export async function updateUserProfile(updates) {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  await updateDoc(userRef, updates);
}

// Helper function to upload profile picture to Firebase Storage
export async function uploadProfilePic(file) {
  const user = auth.currentUser;
  if (!user) return;

  const fileRef = ref(storage, `profilePics/${user.uid}.jpg`);
  await uploadBytes(fileRef, file);

  const url = await getDownloadURL(fileRef);
  await updateDoc(doc(db, "users", user.uid), { profilePic: url });

  return url;
} 