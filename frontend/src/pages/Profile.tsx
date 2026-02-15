import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../config/firebase";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, Edit3, Upload, User, X, Trash2, CheckCircle, TrendingUp,
  Bell, Award, Users, Calendar, ExternalLink, Plus, Minus, Star,
  Github, Linkedin, Globe, Mail, MapPin, Clock, Activity
} from "lucide-react";

// TODO: Migrate profile CRUD to Supabase queries
// Stubbed helpers — Firestore has been removed
const testFirestoreConnection = async () => true;

const createUserProfile = async (user: any) => {
  if (!user) return null;
  return {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User',
    email: user.email,
    bio: '',
    grade: '',
    school: '',
    clubs: [],
    skills: [],
    interests: [],
    socialLinks: { github: '', linkedin: '', website: '' },
    achievements: [],
    quizResults: null,
    profilePic: user.user_metadata?.avatar_url || '',
  };
};

// TODO: Migrate fetchUserProfile to Supabase
const fetchUserProfile = async (user: any) => {
  if (!user) return null;
  // Firestore removed — return null to trigger profile creation flow
  console.log('fetchUserProfile: TODO migrate to Supabase for user:', user.id);
  return null;
};

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [clubs, setClubs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [socialLinks, setSocialLinks] = useState({
    github: "",
    linkedin: "",
    website: ""
  });
  const [achievements, setAchievements] = useState([]);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileError, setProfileError] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const navigate = useNavigate();

  // Available schools
  const availableSchools = [
    "West Forsyth High School",
    "North Forsyth High School",
    "South Forsyth High School",
    "East Forsyth High School",
    "Forsyth Central High School",
    "Lambert High School",
    "Denmark High School",
    "Alliance Academy for Innovation"
  ];

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

  // Generate personalized club recommendations based on quiz results
  const getClubRecommendations = () => {
    if (!quizResults || !quizResults.recommendations) {
      return [];
    }
    return quizResults.recommendations.map(rec => ({
      name: rec.name,
      description: rec.description,
      members: rec.members || Math.floor(Math.random() * 50) + 20,
      match: rec.matchScore || Math.floor(Math.random() * 30) + 70
    }));
  };

  // Generate contextual club activities based on selected clubs and school
  const getClubActivities = () => {
    if (clubs.length === 0) {
      return [];
    }

    // Generate activities for selected clubs
    const activities = [];
    clubs.forEach((club, index) => {
      const activityTypes = [
        { type: "meeting", message: "New meeting scheduled for next week" },
        { type: "event", message: "Upcoming event registration is open" },
        { type: "achievement", message: "Recent competition results posted" },
        { type: "announcement", message: "Important club announcement" }
      ];

      const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const timeOptions = ["2 hours ago", "1 day ago", "3 days ago", "1 week ago"];

      activities.push({
        id: Date.now() + index,
        club: club,
        activity: randomActivity.message,
        time: timeOptions[Math.floor(Math.random() * timeOptions.length)],
        type: randomActivity.type
      });
    });

    return activities.slice(0, 4); // Limit to 4 activities
  };

  // Helper function to calculate profile completion percentage
  const calculateProfileCompletion = (profileData) => {
    if (!profileData) return 0;

    const fields = [
      (name || profileData.name) && (name || profileData.name).trim() !== "",
      (email || profileData.email) && (email || profileData.email).trim() !== "",
      bio && bio.trim() !== "",
      grade && grade.trim() !== "",
      school && school.trim() !== "",
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
    if (percentage >= 71) return "Profile complete! ";
    if (percentage >= 41) return "Almost there! Keep going! ";
    return "Let's get started! ";
  };

  // Helper function to extract grade number from grade string
  const getGradeNumber = (gradeString) => {
    if (!gradeString) return "";
    // Extract number from strings like "9th Grade" or just return the string if it's already a number
    const match = gradeString.match(/(\d+)/);
    return match ? match[1] : gradeString;
  };

  // Get progress bar color based on completion percentage
  const getProgressBarColor = (percentage) => {
    if (percentage >= 71) return "bg-green-500";
    if (percentage >= 41) return "bg-yellow-500";
    return "bg-red-500";
  };

  useEffect(() => {
    const loadProfile = async () => {
      console.log(" Profile useEffect triggered");
      console.log(" Current state:", { authLoading, user: user?.id, loading });

      if (authLoading) {
        console.log("⏳ Auth is still loading, waiting...");
        return;
      }

      if (!user) {
        console.log(" No user authenticated, clearing profile data");
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

      console.log(" Auth state changed. User:", user ? user.id : "null");
      console.log(" Auth state change details:", {
        hasUser: !!user,
        uid: user?.id,
        email: user?.email,
        displayName: user?.user_metadata?.full_name
      });

      console.log(" User is authenticated, processing profile...");
      setProfileError(null);
      setLoading(true);

      try {
        console.log(" Starting profile fetch/creation process...");
        console.log(" Testing Firestore connection...");

        // Test Firestore connection first
        const connectionTest = await testFirestoreConnection();
        if (!connectionTest) {
          throw new Error("Firestore connection test failed");
        }

        // First, try to fetch existing profile
        console.log(" Step 1: Attempting to fetch existing profile...");
        let profileData = null;
        let profileCreationError = null;

        try {
          profileData = await fetchUserProfile(user);
          console.log(" Step 1 result:", profileData ? "Profile found" : "No profile found");
        } catch (fetchError) {
          console.warn(" Step 1 failed (likely due to security rules):", fetchError.message);
          console.log(" Will attempt to create profile directly...");
        }

        // If no profile exists or fetch failed, try to create one
        if (!profileData) {
          console.log(" Step 2: No existing profile found or fetch failed, creating new one...");
          try {
            profileData = await createUserProfile(user);
            console.log(" Step 2 Complete: New profile created successfully");
          } catch (createError) {
            console.error(" Step 2 failed:", createError.message);
            profileCreationError = createError;

            // If creation also fails due to permissions, create a local profile
            if (createError.code === 'permission-denied' || createError.message.includes("permissions") || createError.message.includes("Permission denied")) {
              console.log(" Creating local profile as fallback...");
              profileData = {
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || "New User",
                email: user.email,
                bio: "",
                grade: "",
                school: "",
                clubs: [],
                skills: [],
                interests: [],
                socialLinks: {
                  github: "",
                  linkedin: "",
                  website: ""
                },
                achievements: [],
                quizResults: null,
                profilePic: "",
                createdAt: new Date().toISOString(),
                isLocalProfile: true // Flag to indicate this is a local profile
              };
              console.log(" Local profile created as fallback");
            } else {
              throw createError;
            }
          }
        } else {
          console.log(" Step 1 Complete: Existing profile found and loaded");
        }

        // Set profile data in state
        if (profileData) {
          console.log(" Step 3: Updating component state with profile data...");
          setProfile(profileData);
          setName(profileData.name || "");
          setEmail(profileData.email || "");
          setBio(profileData.bio || "");
          setGrade(getGradeNumber(profileData.grade || ""));
          setSchool(profileData.school || "");
          setProfilePic(profileData.profilePic || "");
          setClubs(profileData.clubs || []);
          setSkills(profileData.skills || []);
          setInterests(profileData.interests || []);
          setSocialLinks(profileData.socialLinks || { github: "", linkedin: "", website: "" });
          setAchievements(profileData.achievements || []);
          setQuizResults(profileData.quizResults || null);
          console.log(" Step 3 Complete: Component state updated successfully");
          console.log(" Profile loaded successfully for user:", user.id);
          console.log(" Final profile state:", {
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
        console.error(" Error handling profile for user:", user.id, error);
        console.error(" Error context:", {
          uid: user.id,
          email: user.email,
          errorCode: error.code,
          errorMessage: error.message,
          errorStack: error.stack
        });
        setProfileError(`Failed to load profile: ${error.message}`);
        setProfile(null);
      }
      setLoading(false);
      console.log(" Profile processing complete, loading state set to false");
    };

    loadProfile();
  }, [user, authLoading]);

  // Update profile completion whenever profile data changes
  useEffect(() => {
    if (profile) {
      const completion = calculateProfileCompletion(profile);
      setProfileCompletion(completion);
    }
  }, [profile, name, email, bio, grade, school, profilePic, clubs, skills, interests, socialLinks]);

  // Auto-save when profile data changes
  useEffect(() => {
    if (profile && !profile.isLocalProfile) {
      triggerAutoSave();
    }
  }, [name, email, bio, grade, school, clubs, skills, interests, socialLinks, achievements, quizResults]);

  // Set up beforeunload event to save data when user leaves the page
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Clear auto-save timeout on cleanup
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [name, email, bio, grade, school, clubs, skills, interests, socialLinks, achievements, quizResults]);

  async function handleSave() {
    if (!user) {
      console.error(" Cannot save profile: No user authenticated");
      return;
    }

    console.log(" Starting profile save process...");
    console.log(" User:", { uid: user.id, email: user.email });
    console.log(" Data to save:", { name, email, bio, grade, school, clubs, skills, interests, socialLinks, achievements, quizResults });
    console.log(" Profile type:", profile?.isLocalProfile ? "Local" : "Firestore");

    setSaving(true);
    try {
      // Always try to save to Firebase first, regardless of local profile status
      console.log(" Attempting to save to Firebase...");


      // Try to save to Firestore
      // TODO: migrate to Supabase query
      const docRef = null;
      const updateData = {
        name,
        email,
        bio,
        grade,
        school,
        clubs,
        skills,
        interests,
        socialLinks,
        achievements,
        quizResults,
        updatedAt: new Date().toISOString()
      };

      console.log(" Updating Firestore document at path:", `users/${user.id}`);
      console.log(" Update data:", updateData);

      console.log("TODO: migrate updateDoc to Supabase", updateData);

      // Also update Firebase Auth displayName if name changed
      if (name && name !== user.user_metadata?.full_name) {
        try {
          console.log("TODO: migrate displayName update to Supabase metadata");
          console.log(" Firebase Auth displayName updated to:", name);
        } catch (authError) {
          console.warn(" Failed to update Firebase Auth displayName:", authError);
          // Don't fail the whole save if auth update fails
        }
      }

      // Update local state and remove local profile flag
      setProfile(prev => ({
        ...prev,
        name,
        email,
        bio,
        grade,
        school,
        clubs,
        skills,
        interests,
        socialLinks,
        achievements,
        quizResults,
        isLocalProfile: false // Remove local profile flag since we successfully saved to Firebase
      }));

      console.log(" Profile updated successfully in Firestore");
      console.log(" Local state updated");

      alert(" Profile saved to Firebase successfully!");
    } catch (error) {
      console.error(" Error updating profile:", error);
      console.error(" Error details:", {
        code: error.code,
        message: error.message,
        uid: user.id,
        updateData: { name, email, bio, grade, school, clubs, skills, interests, socialLinks, achievements, quizResults }
      });

      // If it's a permissions error, update locally as fallback
      if (error.code === 'permission-denied' || error.message.includes("permissions") || error.message.includes("Permission denied")) {
        console.log(" Firestore save failed due to permissions, updating locally as fallback");
        setProfile(prev => ({
          ...prev,
          name,
          email,
          bio,
          grade,
          school,
          clubs,
          skills,
          interests,
          socialLinks,
          achievements,
          quizResults,
          isLocalProfile: true
        }));
        alert("Profile updated locally! (Note: Changes are not saved to server due to permissions)");
      } else if (error.code === 'not-found') {
        console.log(" Document not found, attempting to create new profile...");
        try {
          // Try to create the document if it doesn't exist
          // TODO: migrate to Supabase query
          const docRef = null;
          const createData = {
            name,
            email,
            bio,
            grade,
            school,
            clubs,
            skills,
            interests,
            socialLinks,
            achievements,
            quizResults,
            profilePic: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          // TODO: migrate profile creation to Supabase
          console.log('TODO: migrate setDoc to Supabase', createData);
          setProfile(prev => ({ ...prev, ...createData }));
          alert("Profile created and updated successfully!");
        } catch (createError) {
          console.error(" Failed to create profile:", createError);
          alert("Failed to create profile. Please try again.");
        }
      } else {
        console.error(" Unexpected error:", error);
        alert(`Failed to update profile: ${error.message}`);
      }
    } finally {
      setSaving(false);
      console.log(" Profile save process complete");
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
      await signOut();
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Auto-save function that saves data after a delay
  const triggerAutoSave = () => {
    if (!user || !profile) return;

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new timeout for auto-save (2 seconds after user stops typing)
    const timeout = setTimeout(async () => {
      console.log(" Auto-saving profile data...");
      try {
        // TODO: migrate to Supabase query
        const docRef = null;
        const updateData = {
          name,
          email,
          bio,
          grade,
          school,
          clubs,
          skills,
          interests,
          socialLinks,
          achievements,
          quizResults,
          updatedAt: new Date().toISOString()
        };

        console.log("TODO: migrate updateDoc to Supabase", updateData);

        // Also update Firebase Auth displayName if name changed
        if (name && name !== user.user_metadata?.full_name) {
          try {
            console.log("TODO: migrate displayName update to Supabase metadata");
            console.log(" Firebase Auth displayName updated to:", name);
          } catch (authError) {
            console.warn(" Failed to update Firebase Auth displayName:", authError);
            // Don't fail the whole save if auth update fails
          }
        }

        setLastSaved(new Date().toLocaleTimeString());
        console.log(" Auto-save completed at:", new Date().toLocaleTimeString());
      } catch (error) {
        console.error(" Auto-save failed:", error);
        // Don't show alert for auto-save failures to avoid annoying the user
      }
    }, 2000); // 2 second delay

    setAutoSaveTimeout(timeout);
  };

  // Save data when user navigates away or closes the page
  const handleBeforeUnload = async (e) => {
    if (!user || !profile) return;

    // Save data synchronously before page unload
    try {
      // TODO: migrate to Supabase query
      const docRef = null;
      const updateData = {
        name,
        email,
        bio,
        grade,
        school,
        clubs,
        skills,
        interests,
        socialLinks,
        achievements,
        quizResults,
        updatedAt: new Date().toISOString()
      };

      // Use sendBeacon for reliable data sending on page unload
      const data = JSON.stringify(updateData);
      navigator.sendBeacon(`/api/save-profile/${user.id}`, data);

      console.log(" Data saved before page unload");
    } catch (error) {
      console.error(" Failed to save data before page unload:", error);
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
          {import.meta.env.DEV && (
            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Info:</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>User:</strong> {user ? `${user.email} (${user.id})` : 'Not authenticated'}</p>
                <p><strong>Profile:</strong> {profile ? 'Loaded' : 'Not loaded'}</p>
                <p><strong>Error:</strong> {profileError || 'None'}</p>
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => {
                console.log(" User clicked refresh page button");
                window.location.reload();
              }}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300"
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                console.log(" User clicked go home button");
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
                  <div className={`flex items-center space-x-1 ${(name || profile?.name) ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${(name || profile?.name) ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>Name</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${(email || profile?.email) ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${(email || profile?.email) ? 'bg-green-500' : 'bg-gray-300'}`} />
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
                  <div className={`flex items-center space-x-1 ${school ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${school ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>School</span>
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

                <h1 className="text-3xl font-bold text-blue-900 mb-2">
                  Welcome, {name || profile.name}
                </h1>
                <p className="text-gray-600 mb-4">Email: {profile.email}</p>
                {lastSaved && (
                  <p className="text-sm text-green-600 mb-2">
                    Last saved: {lastSaved}
                  </p>
                )}
                {profile.grade && (
                  <p className="text-blue-600 font-medium">Grade: {getGradeNumber(profile.grade)}</p>
                )}
                {profile.isLocalProfile && (
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg mb-4">
                    <p className="text-sm">
                      <strong> Local Mode:</strong> Profile data is stored locally only.
                      To enable cloud storage, please configure Firestore security rules.
                    </p>
                  </div>
                )}
              </div>

              {/* Name Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-yellow-800 mb-2">
                  <Edit3 size={16} className="inline mr-1" />
                  Name
                </label>
                <input
                  type="text"
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-gray-900 bg-white"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    // Auto-save will be triggered by useEffect
                  }}
                  placeholder="Enter your name..."
                />
              </div>

              {/* Email Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-yellow-800 mb-2">
                  <Edit3 size={16} className="inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-gray-900 bg-white"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Auto-save will be triggered by useEffect
                  }}
                  placeholder="Enter your email..."
                />
              </div>

              {/* Bio Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-yellow-800 mb-2">
                  <Edit3 size={16} className="inline mr-1" />
                  Bio
                </label>
                <textarea
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-gray-900 bg-white resize-none"
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
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 bg-white"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  <option value="">Select your grade</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
              </div>

              {/* School Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-yellow-800 mb-2">
                  School
                </label>
                <select
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 bg-white"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                >
                  <option value="">Select your school</option>
                  {availableSchools.map((schoolName) => (
                    <option key={schoolName} value={schoolName}>{schoolName}</option>
                  ))}
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
                    className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
                    className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
                      onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                      placeholder="GitHub profile URL"
                      className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Linkedin size={20} className="text-blue-600" />
                    <input
                      type="url"
                      value={socialLinks.linkedin}
                      onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                      placeholder="LinkedIn profile URL"
                      className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe size={20} className="text-green-600" />
                    <input
                      type="url"
                      value={socialLinks.website}
                      onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                      placeholder="Personal website URL"
                      className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Clubs Section */}
              <div className="mb-6" data-clubs-section>
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

              {/* Auto-save indicator */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm text-blue-700">Auto-save enabled</span>
                  </div>
                  {lastSaved && (
                    <span className="text-xs text-blue-600">Last saved: {lastSaved}</span>
                  )}
                </div>
              </div>




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
                {clubs.length === 0 ? (
                  <div className="text-center py-6">
                    <Users size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-3">No clubs selected yet</p>
                    <p className="text-xs text-gray-500 mb-4">Select clubs to see personalized activity updates</p>
                    <button
                      onClick={() => {
                        // Scroll to clubs section
                        const clubsSection = document.querySelector('[data-clubs-section]');
                        if (clubsSection) {
                          clubsSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    >
                      Select Clubs
                    </button>
                  </div>
                ) : (
                  getClubActivities().map((activity) => (
                    <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'meeting' ? 'bg-blue-500' :
                          activity.type === 'event' ? 'bg-green-500' :
                            activity.type === 'achievement' ? 'bg-yellow-500' : 'bg-purple-500'
                          }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{activity.club}</p>
                          <p className="text-xs text-gray-600">{activity.activity}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                {getClubRecommendations().length === 0 ? (
                  <div className="text-center py-6">
                    <Award size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-3">No recommendations yet</p>
                    <p className="text-xs text-gray-500 mb-4">Take the club quiz to get personalized recommendations</p>
                    <button
                      onClick={() => navigate('/club-quiz')}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
                    >
                      Take Club Quiz
                    </button>
                  </div>
                ) : (
                  getClubRecommendations().map((club, index) => (
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
                  ))
                )}
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
                  className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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