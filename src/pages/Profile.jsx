import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../config/firebase";
import { db, storage } from "../config/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Save, Edit3, Upload, User, X, Trash2, CheckCircle, TrendingUp, 
  Bell, Award, Users, Calendar, ExternalLink, Plus, Minus, Star, 
  Github, Linkedin, Globe, Mail, Phone, MapPin, Clock, Activity
} from "lucide-react";

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
    console.log("📝 Document reference for creation:", docRef);
    console.log("📝 Database instance for creation:", db);
    
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
    console.log("💾 About to call setDoc...");
    
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
    console.error("🔍 User object:", user);
    console.error("🔍 Database object:", db);
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
    console.log("📄 Document reference:", docRef);
    console.log("📄 Database instance:", db);
    
    const docSnap = await getDoc(docRef);
    console.log("📄 Document snapshot received:", docSnap);
    console.log("📄 Document exists:", docSnap.exists());

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
    console.error("🔍 User object:", user);
    console.error("🔍 Database object:", db);
    throw error;
  }
};

const Profile = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [grade, setGrade] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [clubs, setClubs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [socialLinks, setSocialLinks] = useState({
    github: "",
    linkedin: "",
    website: "",
    phone: ""
  });
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileError, setProfileError] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
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
    "Drama Club",
    "Math Club",
    "Science Olympiad",
    "Model UN",
    "Key Club",
    "National Honor Society",
    "Student Government",
    "Yearbook",
    "Newspaper",
    "Band",
    "Choir"
  ];

  // Available skills
  const availableSkills = [
    "Programming", "Graphic Design", "Public Speaking", "Leadership", "Writing",
    "Photography", "Video Editing", "Music", "Art", "Sports", "Math", "Science",
    "Languages", "Teaching", "Organization", "Communication", "Problem Solving",
    "Teamwork", "Creativity", "Time Management"
  ];

  // Available interests
  const availableInterests = [
    "Technology", "Science", "Art", "Music", "Sports", "Reading", "Gaming",
    "Travel", "Cooking", "Fashion", "Photography", "Writing", "Dancing",
    "Acting", "Volunteering", "Environment", "Politics", "History", "Languages"
  ];

  // Mock club activities data
  const clubActivities = [
    { id: 1, club: "Robotics Club", activity: "New meeting scheduled for next Friday", time: "2 hours ago", type: "meeting" },
    { id: 2, club: "Debate Team", activity: "Tournament registration is now open", time: "1 day ago", type: "event" },
    { id: 3, club: "Art Club", activity: "Gallery exhibition next month", time: "3 days ago", type: "event" },
    { id: 4, club: "Computer Science Club", activity: "Coding competition results posted", time: "1 week ago", type: "achievement" }
  ];

  // Mock club recommendations
  const clubRecommendations = [
    { name: "Math Club", description: "Perfect for students interested in mathematics and problem-solving", members: 45, match: 95 },
    { name: "Science Olympiad", description: "Competitive science team for students passionate about STEM", members: 32, match: 88 },
    { name: "Model UN", description: "Simulate United Nations debates and global diplomacy", members: 28, match: 82 }
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
      clubs && clubs.length > 0,
      skills && skills.length > 0,
      interests && interests.length > 0,
      socialLinks.github || socialLinks.linkedin || socialLinks.website
    ];
    
    const completedFields = fields.filter(Boolean).length;
    const totalFields = fields.length;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  // Helper functions for managing skills, interests, and achievements
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (interestToRemove) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setAchievements([...achievements, { id: Date.now(), text: newAchievement.trim(), date: new Date().toISOString() }]);
      setNewAchievement("");
    }
  };

  const removeAchievement = (achievementId) => {
    setAchievements(achievements.filter(achievement => achievement.id !== achievementId));
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
    const loadProfile = async () => {
      console.log("🚀 Profile useEffect triggered");
      console.log("📊 Current state:", { authLoading, user: user?.uid, loading });
      
      if (authLoading) {
        console.log("⏳ Auth is still loading, waiting...");
        return;
      }

      if (!user) {
        console.log("👤 No user authenticated, clearing profile data");
        setProfile(null);
        setProfileError(null);
        setBio("");
        setGrade("");
        setProfilePic("");
        setClubs([]);
        setProfileCompletion(0);
        setLoading(false);
        return;
      }

      console.log("🔄 Auth state changed. User:", user ? user.uid : "null");
      console.log("🔍 Auth state change details:", {
        hasUser: !!user,
        uid: user?.uid,
        email: user?.email,
        displayName: user?.displayName
      });
      
      console.log("👤 User is authenticated, processing profile...");
      setProfileError(null);
      setLoading(true);
      
      try {
        console.log("📋 Starting profile fetch/creation process...");
        console.log("🔧 Testing Firestore connection...");
        
        // Test Firestore connection first
        try {
          const testDoc = doc(db, "test", "connection");
          console.log("🔧 Firestore test doc created:", testDoc);
          console.log("🔧 Firestore database instance:", db);
          console.log("🔧 Firestore app:", db.app);
        } catch (connectionError) {
          console.error("❌ Firestore connection test failed:", connectionError);
          throw new Error(`Firestore connection failed: ${connectionError.message}`);
        }
        
        // First, try to fetch existing profile
        console.log("🔍 Step 1: Attempting to fetch existing profile...");
        let profileData = null;
        let profileCreationError = null;
        
        try {
          profileData = await fetchUserProfile(user);
          console.log("🔍 Step 1 result:", profileData ? "Profile found" : "No profile found");
        } catch (fetchError) {
          console.warn("⚠️ Step 1 failed (likely due to security rules):", fetchError.message);
          console.log("🔄 Will attempt to create profile directly...");
        }
        
        // If no profile exists or fetch failed, try to create one
        if (!profileData) {
          console.log("📝 Step 2: No existing profile found or fetch failed, creating new one...");
          try {
            profileData = await createUserProfile(user);
            console.log("✅ Step 2 Complete: New profile created successfully");
          } catch (createError) {
            console.error("❌ Step 2 failed:", createError.message);
            profileCreationError = createError;
            
            // If creation also fails due to permissions, create a local profile
            if (createError.message.includes("permissions")) {
              console.log("🔄 Creating local profile as fallback...");
              profileData = {
                name: user.displayName || user.email?.split('@')[0] || "New User",
                email: user.email,
                bio: "",
                grade: "",
                clubs: [],
                profilePic: "",
                createdAt: new Date().toISOString(),
                isLocalProfile: true // Flag to indicate this is a local profile
              };
              console.log("✅ Local profile created as fallback");
            } else {
              throw createError;
            }
          }
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
          setSkills(profileData.skills || []);
          setInterests(profileData.interests || []);
          setSocialLinks(profileData.socialLinks || { github: "", linkedin: "", website: "", phone: "" });
          setAchievements(profileData.achievements || []);
          console.log("✅ Step 3 Complete: Component state updated successfully");
          console.log("🎉 Profile loaded successfully for user:", user.uid);
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
        console.error("❌ Error handling profile for user:", user.uid, error);
        console.error("🔍 Error context:", {
          uid: user.uid,
          email: user.email,
          errorCode: error.code,
          errorMessage: error.message,
          errorStack: error.stack
        });
        setProfileError(`Failed to load profile: ${error.message}`);
        setProfile(null);
      }
      setLoading(false);
      console.log("🏁 Profile processing complete, loading state set to false");
    };

    loadProfile();
  }, [user, authLoading]);

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
    console.log("🔍 Profile type:", profile?.isLocalProfile ? "Local" : "Firestore");
    
    setSaving(true);
    try {
      // If this is a local profile, just update local state
      if (profile?.isLocalProfile) {
        console.log("🔄 Updating local profile (Firestore not available)");
        setProfile(prev => ({ ...prev, bio, grade, clubs }));
        console.log("✅ Local profile updated successfully");
        alert("Profile updated locally! (Note: Changes are not saved to server due to permissions)");
        return;
      }
      
      // Try to save to Firestore
      const docRef = doc(db, "users", user.uid);
      const updateData = { 
        bio, 
        grade, 
        clubs, 
        skills, 
        interests, 
        socialLinks, 
        achievements 
      };
      
      console.log("🔄 Updating Firestore document at path:", `users/${user.uid}`);
      console.log("📊 Update data:", updateData);
      
      await updateDoc(docRef, updateData);
      
      // Update local state
      setProfile(prev => ({ 
        ...prev, 
        bio, 
        grade, 
        clubs, 
        skills, 
        interests, 
        socialLinks, 
        achievements 
      }));
      
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
      
      // If it's a permissions error, update locally as fallback
      if (error.message.includes("permissions")) {
        console.log("🔄 Firestore save failed due to permissions, updating locally as fallback");
        setProfile(prev => ({ 
          ...prev, 
          bio, 
          grade, 
          clubs, 
          skills, 
          interests, 
          socialLinks, 
          achievements, 
          isLocalProfile: true 
        }));
        alert("Profile updated locally! (Note: Changes are not saved to server due to permissions)");
      } else {
        alert("Failed to update profile. Please try again.");
      }
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
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (authLoading || loading) {
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
        className="max-w-7xl mx-auto"
      >
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6 w-fit"
        >
          <ArrowLeft size={22} className="mr-2" /> Back
        </button>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Completion Progress Bar */}
            {profile && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/50 p-6"
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
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
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
                  <div className={`flex items-center space-x-1 ${skills.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${skills.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>Skills</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${interests.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${interests.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>Interests</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${socialLinks.github || socialLinks.linkedin || socialLinks.website ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${socialLinks.github || socialLinks.linkedin || socialLinks.website ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>Social</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Main Profile Card */}
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
                {profile.isLocalProfile && (
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg mb-4">
                    <p className="text-sm">
                      <strong>⚠️ Local Mode:</strong> Profile data is stored locally only. 
                      To enable cloud storage, please configure Firestore security rules.
                    </p>
                  </div>
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

              {/* Skills Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-yellow-800 mb-2">
                  Skills
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <button
                    onClick={addSkill}
                    className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-yellow-800 mb-2">
                  Interests
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest..."
                    className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  />
                  <button
                    onClick={addInterest}
                    className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Links Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-yellow-800 mb-3">
                  Social Links
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <Github size={20} className="text-gray-600" />
                    <input
                      type="url"
                      value={socialLinks.github}
                      onChange={(e) => setSocialLinks({...socialLinks, github: e.target.value})}
                      placeholder="GitHub profile URL"
                      className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Linkedin size={20} className="text-blue-600" />
                    <input
                      type="url"
                      value={socialLinks.linkedin}
                      onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                      placeholder="LinkedIn profile URL"
                      className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe size={20} className="text-green-600" />
                    <input
                      type="url"
                      value={socialLinks.website}
                      onChange={(e) => setSocialLinks({...socialLinks, website: e.target.value})}
                      placeholder="Personal website URL"
                      className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-orange-600" />
                    <input
                      type="tel"
                      value={socialLinks.phone}
                      onChange={(e) => setSocialLinks({...socialLinks, phone: e.target.value})}
                      placeholder="Phone number (optional)"
                      className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
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
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Club Activity Feed */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/50 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Bell size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Club Activity</h3>
              </div>
              <div className="space-y-3">
                {clubActivities.map((activity) => (
                  <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'meeting' ? 'bg-blue-500' :
                        activity.type === 'event' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{activity.club}</p>
                        <p className="text-xs text-gray-600">{activity.activity}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Club Recommendations */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/50 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users size={20} className="text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">Recommended Clubs</h3>
              </div>
              <div className="space-y-3">
                {clubRecommendations.map((club, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{club.name}</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {club.match}% match
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{club.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{club.members} members</span>
                      <button className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors">
                        Learn More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Achievements Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/50 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Award size={20} className="text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-800">Achievements</h3>
              </div>
              
              {/* Add Achievement */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  placeholder="Add an achievement..."
                  className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
                />
                <button
                  onClick={addAchievement}
                  className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Achievements List */}
              <div className="space-y-2">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-yellow-500" />
                      <span className="text-sm text-gray-800">{achievement.text}</span>
                    </div>
                    <button
                      onClick={() => removeAchievement(achievement.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No achievements yet. Add some!</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile; 