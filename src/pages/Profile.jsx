import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Edit3, Upload, User, X, Trash2, CheckCircle, TrendingUp } from "lucide-react";

// Helper function to create user profile in Firestore
const createUserProfile = async (user) => {
  if (!user) {
    console.error("❌ No user provided to createUserProfile");
    return null;
  }

  const firestorePath = `users/${user.uid}`;
  console.log("📝 Creating profile for UID:", user.uid, "at path:", firestorePath);
  console.log("👤 Current user object:", {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified
  });

  try {
    const docRef = doc(db, "users", user.uid);
    const defaultProfile = {
      name: user.displayName || user.email?.split('@')[0] || "New User",
      email: user.email,
      bio: "",
      grade: "",
      clubs: [],
      profilePic: "",
      createdAt: serverTimestamp(),
    };

    console.log("💾 Writing default profile to Firestore:", defaultProfile);
    await setDoc(docRef, defaultProfile);
    console.log("✅ Profile created successfully for UID:", user.uid);
    console.log("📊 Profile data written:", defaultProfile);
    return defaultProfile;
  } catch (error) {
    console.error("❌ Error creating profile for UID:", user.uid, error);
    console.error("🔍 Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Helper function to fetch user profile from Firestore
const fetchUserProfile = async (user) => {
  if (!user) {
    console.error("❌ No user provided to fetchUserProfile");
    return null;
  }

  const firestorePath = `users/${user.uid}`;
  console.log("🔍 Fetching profile for UID:", user.uid, "at path:", firestorePath);
  console.log("👤 Current user object:", {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified
  });

  try {
    const docRef = doc(db, "users", user.uid);
    console.log("📄 Executing getDoc for path:", firestorePath);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const profileData = docSnap.data();
      console.log("✅ Profile exists and fetched successfully for UID:", user.uid);
      console.log("📊 Profile data retrieved:", profileData);
      return profileData;
    } else {
      console.log("⚠️ No profile document found for UID:", user.uid, "at path:", firestorePath);
      console.log("📝 Profile document does not exist - will need to create one");
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching profile for UID:", user.uid, error);
    console.error("🔍 Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [grade, setGrade] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileError, setProfileError] = useState(null);
  const navigate = useNavigate();

  // Available clubs for selection
  const availableClubs = [
    "Robotics Club",
    "Debate Team", 
    "Art Club",
    "Chess Club",
    "Environmental Club",
    "Computer Science Club",
    "Music Club",
    "Sports Club",
    "Photography Club",
    "Drama Club"
  ];

  // Helper function to calculate profile completion percentage
  const calculateProfileCompletion = (profileData) => {
    if (!profileData) return 0;
    
    const fields = [
      profileData.name && profileData.name.trim() !== "",
      profileData.email && profileData.email.trim() !== "",
      bio && bio.trim() !== "",
      grade && grade.trim() !== "",
      profilePic && profilePic.trim() !== "",
      clubs && clubs.length > 0
    ];
    
    const completedFields = fields.filter(Boolean).length;
    const totalFields = fields.length;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  // Get motivational message based on completion percentage
  const getMotivationalMessage = (percentage) => {
    if (percentage >= 71) return "Profile complete! 🎉";
    if (percentage >= 41) return "Almost there! Keep going! 💪";
    return "Let's get started! 🚀";
  };

  // Get progress bar color based on completion percentage
  const getProgressBarColor = (percentage) => {
    if (percentage >= 71) return "bg-green-500";
    if (percentage >= 41) return "bg-yellow-500";
    return "bg-red-500";
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔄 Auth state changed. User:", firebaseUser ? firebaseUser.uid : "null");
      console.log("🔍 Auth state change details:", {
        hasUser: !!firebaseUser,
        uid: firebaseUser?.uid,
        email: firebaseUser?.email,
        displayName: firebaseUser?.displayName
      });
      
      if (firebaseUser) {
        console.log("👤 User is authenticated, processing profile...");
        setUser(firebaseUser);
        setProfileError(null);
        setLoading(true);
        
        try {
          console.log("📋 Starting profile fetch/creation process...");
          
          // First, try to fetch existing profile
          console.log("🔍 Step 1: Attempting to fetch existing profile...");
          let profileData = await fetchUserProfile(firebaseUser);
          
          // If no profile exists, create one
          if (!profileData) {
            console.log("📝 Step 2: No existing profile found, creating new one...");
            profileData = await createUserProfile(firebaseUser);
            console.log("✅ Step 2 Complete: New profile created successfully");
          } else {
            console.log("✅ Step 1 Complete: Existing profile found and loaded");
          }
          
          // Set profile data in state
          if (profileData) {
            console.log("🔄 Step 3: Updating component state with profile data...");
            setProfile(profileData);
            setBio(profileData.bio || "");
            setGrade(profileData.grade || "");
            setProfilePic(profileData.profilePic || "");
            setClubs(profileData.clubs || []);
            console.log("✅ Step 3 Complete: Component state updated successfully");
            console.log("🎉 Profile loaded successfully for user:", firebaseUser.uid);
            console.log("📊 Final profile state:", {
              name: profileData.name,
              email: profileData.email,
              bio: profileData.bio,
              grade: profileData.grade,
              clubsCount: profileData.clubs?.length || 0,
              hasProfilePic: !!profileData.profilePic,
              createdAt: profileData.createdAt
            });
          } else {
            throw new Error("Failed to create or fetch profile - no data returned");
          }
        } catch (error) {
          console.error("❌ Error handling profile for user:", firebaseUser.uid, error);
          console.error("🔍 Error context:", {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            errorCode: error.code,
            errorMessage: error.message,
            errorStack: error.stack
          });
          setProfileError("Failed to load profile. Please try refreshing the page.");
          setProfile(null);
        }
      } else {
        console.log("👤 User signed out, clearing profile data");
        console.log("🧹 Clearing all profile-related state...");
        setUser(null);
        setProfile(null);
        setProfileError(null);
        setBio("");
        setGrade("");
        setProfilePic("");
        setClubs([]);
        setProfileCompletion(0);
        console.log("✅ Profile state cleared successfully");
      }
      setLoading(false);
      console.log("🏁 Profile processing complete, loading state set to false");
    });

    return () => {
      console.log("🔌 Unsubscribing from auth state changes");
      unsubscribe();
    };
  }, []);

  // Update profile completion whenever profile data changes
  useEffect(() => {
    if (profile) {
      const completion = calculateProfileCompletion(profile);
      setProfileCompletion(completion);
    }
  }, [profile, bio, grade, profilePic, clubs]);

  async function handleSave() {
    if (!user) {
      console.error("❌ Cannot save profile: No user authenticated");
      return;
    }
    
    console.log("💾 Starting profile save process...");
    console.log("👤 User:", { uid: user.uid, email: user.email });
    console.log("📝 Data to save:", { bio, grade, clubs });
    
    setSaving(true);
    try {
      const docRef = doc(db, "users", user.uid);
      const updateData = { bio, grade, clubs };
      
      console.log("🔄 Updating Firestore document at path:", `users/${user.uid}`);
      console.log("📊 Update data:", updateData);
      
      await updateDoc(docRef, updateData);
      
      // Update local state
      setProfile(prev => ({ ...prev, bio, grade, clubs }));
      
      console.log("✅ Profile updated successfully in Firestore");
      console.log("🔄 Local state updated");
      
      alert("Profile updated!");
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      console.error("🔍 Error details:", {
        code: error.code,
        message: error.message,
        uid: user.uid,
        updateData: { bio, grade, clubs }
      });
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
      console.log("🏁 Profile save process complete");
    }
  }

  async function handleUpload() {
    if (!file || !user) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const fileRef = ref(storage, `profilePics/${user.uid}.jpg`);
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          alert("Failed to upload profile picture. Please try again.");
          setUploading(false);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, { profilePic: url });
            setProfilePic(url);
            setProfile(prev => ({ ...prev, profilePic: url }));
            alert("Profile picture updated!");
          } catch (error) {
            console.error("Error saving profile picture URL:", error);
            alert("Failed to save profile picture. Please try again.");
          } finally {
            setUploading(false);
            setUploadProgress(0);
          }
        }
      );
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
      setUploading(false);
    }
  }

  async function handleRemoveProfilePic() {
    if (!user || !profilePic) return;
    
    try {
      // Delete from Firebase Storage
      const fileRef = ref(storage, `profilePics/${user.uid}.jpg`);
      await deleteObject(fileRef);
      
      // Remove from Firestore
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { profilePic: "" });
      
      // Update local state
      setProfilePic("");
      setProfile(prev => ({ ...prev, profilePic: "" }));
      alert("Profile picture removed!");
    } catch (error) {
      console.error("Error removing profile picture:", error);
      alert("Failed to remove profile picture. Please try again.");
    }
  }

  const handleClubToggle = (clubName) => {
    setClubs(prev => 
      prev.includes(clubName) 
        ? prev.filter(club => club !== clubName)
        : [...prev, clubName]
    );
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Loading profile...</p>
          <p className="text-sm text-gray-500">
            {user ? `Fetching profile for ${user.email}` : 'Checking authentication...'}
          </p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white p-4">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 p-10 max-w-md w-full text-center"
        >
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Please sign in to view your profile</h2>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center bg-white border-2 border-blue-400 text-blue-700 font-bold py-3 px-6 rounded-xl shadow-md hover:bg-blue-50 hover:border-blue-500 transition-all duration-300"
          >
            Sign in
          </button>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 p-8 max-w-md w-full text-center"
        >
          <div className="text-red-500 mb-4">
            <User size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Issue</h2>
          <p className="text-gray-600 mb-4">
            {profileError || "No profile found. Please try refreshing the page."}
          </p>
          
          {/* Debug information for developers */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Info:</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>User:</strong> {user ? `${user.email} (${user.uid})` : 'Not authenticated'}</p>
                <p><strong>Profile:</strong> {profile ? 'Loaded' : 'Not loaded'}</p>
                <p><strong>Error:</strong> {profileError || 'None'}</p>
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => {
                console.log("🔄 User clicked refresh page button");
                window.location.reload();
              }}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300"
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                console.log("🏠 User clicked go home button");
                navigate('/');
              }}
              className="w-full bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
            >
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white p-4">
      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="max-w-2xl mx-auto"
      >
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6 w-fit"
        >
          <ArrowLeft size={22} className="mr-2" /> Back
        </button>

        {/* Profile Completion Progress Bar */}
        {profile && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/50 p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Profile Completion
                </h3>
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {profileCompletion}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <motion.div 
                className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(profileCompletion)}`}
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            
            {/* Motivational Message */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {getMotivationalMessage(profileCompletion)}
              </p>
              {profileCompletion === 100 && (
                <CheckCircle size={20} className="text-green-500" />
              )}
            </div>
            
            {/* Field Completion Indicators */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className={`flex items-center space-x-1 ${profile?.name ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${profile?.name ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Name</span>
              </div>
              <div className={`flex items-center space-x-1 ${profile?.email ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${profile?.email ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Email</span>
              </div>
              <div className={`flex items-center space-x-1 ${bio ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${bio ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Bio</span>
              </div>
              <div className={`flex items-center space-x-1 ${grade ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${grade ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Grade</span>
              </div>
              <div className={`flex items-center space-x-1 ${profilePic ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${profilePic ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Photo</span>
              </div>
              <div className={`flex items-center space-x-1 ${clubs.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${clubs.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Clubs</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 p-8">
          <div className="text-center mb-8">
            {/* Profile Picture Section */}
            <div className="mb-6">
              <div className="relative inline-block">
                {profilePic ? (
                  <img 
                    src={profilePic} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-200 shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-200 shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <User size={40} className="text-blue-600" />
                  </div>
                )}
                {profilePic && (
                  <button
                    onClick={handleRemoveProfilePic}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                    title="Remove profile picture"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              {/* File Upload */}
              <div className="space-y-3">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="profile-pic-upload"
                  disabled={uploading}
                />
                <label 
                  htmlFor="profile-pic-upload"
                  className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    uploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  <Upload size={16} className="mr-2" />
                  {uploading ? 'Uploading...' : 'Choose Photo'}
                </label>
                
                {/* Upload Progress */}
                {uploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
                
                {file && !uploading && (
                  <button
                    onClick={handleUpload}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300"
                  >
                    Upload Profile Picture
                  </button>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-yellow-800 mb-2">
              Welcome, {profile.name}
            </h1>
            <p className="text-gray-600 mb-4">Email: {profile.email}</p>
            {profile.grade && (
              <p className="text-blue-600 font-medium">Grade: {profile.grade}</p>
            )}
          </div>

          {/* Bio Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-yellow-800 mb-2">
              <Edit3 size={16} className="inline mr-1" />
              Bio
            </label>
            <textarea
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-black resize-none"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Grade Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-yellow-800 mb-2">
              Grade
            </label>
            <select
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-black"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="">Select your grade</option>
              <option value="9th Grade">9th Grade</option>
              <option value="10th Grade">10th Grade</option>
              <option value="11th Grade">11th Grade</option>
              <option value="12th Grade">12th Grade</option>
            </select>
          </div>

          {/* Clubs Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-yellow-800 mb-3">
              Select Your Clubs
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {availableClubs.map((club) => (
                <label key={club} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={clubs.includes(club)}
                    onChange={() => handleClubToggle(club)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{club}</span>
                </label>
              ))}
            </div>
            {clubs.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-yellow-800 mb-2">Selected Clubs:</p>
                <div className="flex flex-wrap gap-2">
                  {clubs.map((club, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {club}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-500 hover:to-blue-600 focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Save size={20} className="mr-2" />
                Save Profile
              </div>
            )}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full mt-4 bg-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-600 transition-all duration-300"
          >
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile; 