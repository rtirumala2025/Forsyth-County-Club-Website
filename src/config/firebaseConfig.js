import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCIFI83oD_B0zF_H72qMODRDpw1UfT4hzQ",
  authDomain: "wfhs-club-webapp.firebaseapp.com",
  projectId: "wfhs-club-webapp",
  storageBucket: "wfhs-club-webapp.firebasestorage.app",
  messagingSenderId: "599643093665",
  appId: "1:599643093665:web:a906f4edc33823badc4ee0",
  measurementId: "G-N66D9HT1G4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export const provider = new GoogleAuthProvider();
export const signInWithGooglePopup = () => signInWithPopup(auth, provider); 