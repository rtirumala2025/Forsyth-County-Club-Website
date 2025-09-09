import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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