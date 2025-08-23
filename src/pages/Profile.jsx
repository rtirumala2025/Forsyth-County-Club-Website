import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timestamp, doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db } from '../config/firebase';
import { useAuth } from '../config/firebase';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ProfileHeader from '../components/profile/ProfileHeader';
import UserClubs from '../components/profile/UserClubs';
import UserEvents from '../components/profile/UserEvents';
import { allClubData } from '../data/clubData';

const allClubs = allClubData.flatMap(school => school.clubs || school.club || []);
const allEvents = [
  { id: 'event-id-1', title: 'Robotics Competition', clubId: 'robotics-club' },
  { id: 'event-id-2', title: 'Debate Tournament', clubId: 'debate-club' },
  { id: 'event-id-3', title: 'Art Show', clubId: 'art-club' },
  { id: 'event-id-4', title: 'Chess Championship', clubId: 'chess-club' },
  { id: 'event-id-5', title: 'Eco Cleanup', clubId: 'environmental-club' },
  { id: 'event-id-6', title: 'Hackathon', clubId: 'computer-science-club' },
];

const Profile = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [optimisticProfile, setOptimisticProfile] = useState(null);
  const [editLoading, setEditLoading] = useState({ name: false, photo: false });
  const [nameError, setNameError] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameEditCancelled, setNameEditCancelled] = useState(false);
  const navigate = useNavigate();

  // 1. Show UI instantly using Auth data
  const joinDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : '';

  // Compose the profile to show: prefer Firestore, fallback to Auth
  const displayProfile = {
    uid: user?.uid,
    name: optimisticProfile?.name || profile?.name || user?.displayName || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    photoURL: optimisticProfile?.photoURL || profile?.photoURL || user?.photoURL || '',
    dateJoined: profile?.createdAt instanceof Timestamp
      ? profile.createdAt.toDate().toLocaleDateString()
      : joinDate,
    clubsJoined: profile?.clubsJoined || [],
  };

  // 2. Fetch Firestore profile in the background
  const loadProfile = useCallback(async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        const newProfile = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
          clubsJoined: [],
          eventsRSVPed: [],
          bookmarks: [],
        };
        await setDoc(ref, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadProfile();
  }, [user, loadProfile]);

  useEffect(() => {
    setNameInput(displayProfile.name || '');
  }, [displayProfile.name]);

  useEffect(() => {
    if (isEditingName && nameInput.trim() && displayProfile.name === nameInput.trim()) {
      setIsEditingName(false);
    }
  }, [displayProfile.name, nameInput, isEditingName]);

  const handleEditName = () => setIsEditingName(true);
  const handleCancelEditName = () => {
    setNameInput(displayProfile.name || '');
    setIsEditingName(false);
    setEditLoading((l) => ({ ...l, name: false }));
    setNameEditCancelled(true);
  };

  const handleNameInputChange = (e) => setNameInput(e.target.value);

  const handleNameUpdate = async (newName) => {
    if (!user) return;
    if (!newName.trim()) {
      alert('Name cannot be empty.');
      return;
    }
    setEditLoading((l) => ({ ...l, name: true }));
    setOptimisticProfile((prev) => ({ ...prev, name: newName.trim() }));
    setNameError("");
    let errorOccurred = false;
    let timeoutId;
    try {
      // Update Firestore
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, { name: newName.trim() });
      // Update backend with timeout
      await Promise.race([
        fetch('/api/users', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken || (user.stsTokenManager && user.stsTokenManager.accessToken) || ''}`
          },
          body: JSON.stringify({ name: newName.trim(), uid: user.uid, email: user.email })
        }),
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Request timed out')), 10000);
        })
      ]);
      await loadProfile();
      setOptimisticProfile(null);
    } catch (error) {
      errorOccurred = true;
      setNameError(error.message || 'Failed to save name.');
    } finally {
      clearTimeout(timeoutId);
      setEditLoading((l) => ({ ...l, name: false }));
      if (errorOccurred) {
        setOptimisticProfile((prev) => ({ ...prev, name: profile?.name || user.displayName || user.email?.split('@')[0] || 'User' }));
      }
    }
  };

  // 4. Optimistic update for photo
  const handleImageUpload = async (file) => {
    if (!user) return;
    setEditLoading((l) => ({ ...l, photo: true }));
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `profile-images/${user.uid}/${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setOptimisticProfile((prev) => ({ ...prev, photoURL: downloadURL }));
      const refDoc = doc(db, 'users', user.uid);
      await updateDoc(refDoc, { photoURL: downloadURL });
      await loadProfile();
    } catch (error) {
      // revert optimistic update on error
      setOptimisticProfile((prev) => ({ ...prev, photoURL: profile?.photoURL || user.photoURL || '' }));
    } finally {
      setEditLoading((l) => ({ ...l, photo: false }));
    }
  };

  // Preload clubsJoined for UserClubs
  useEffect(() => {
    if (profile && Array.isArray(profile.clubsJoined)) {
      setSelectedClubs(allClubs.filter(club => profile.clubsJoined.includes(club.id)));
    } else {
      setSelectedClubs([]);
    }
  }, [profile]);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const handleEdit = () => setEditMode(true);
  const handleDone = async (newClubs) => {
    setSelectedClubs(newClubs);
    setEditMode(false);
    if (user && profile) {
      const clubIds = newClubs.map(club => club.id);
      setProfile((prev) => ({ ...prev, clubsJoined: clubIds })); // optimistic
      const refDoc = doc(db, 'users', user.uid);
      await updateDoc(refDoc, { clubsJoined: clubIds });
      await loadProfile();
    }
  };

  const handleNameEditDone = () => {
    setEditLoading((l) => ({ ...l, name: false }));
  };

  // Filter events to only those related to selected clubs
  const filteredEvents = allEvents.filter(event =>
    selectedClubs.some(club => club.id === event.clubId)
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white p-4">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 p-10 max-w-md w-full text-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white p-4 flex flex-col">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-5xl mx-auto flex flex-col flex-1 w-full h-full">
        {/* Back button in top left */}
        <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4 w-fit">
          <ArrowLeft size={22} className="mr-2" /> Back
        </button>
        <ProfileHeader
          user={displayProfile}
          onSignOut={handleSignOut}
          onImageUpload={handleImageUpload}
          onNameUpdate={handleNameUpdate}
          editLoading={editLoading}
          nameError={nameError}
        />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 flex-1 min-h-0">
          <div className="flex flex-col h-full min-h-[300px]">
            <UserClubs
              allClubs={allClubs}
              selectedClubs={selectedClubs}
              editMode={editMode}
              onEdit={handleEdit}
              onDone={handleDone}
            />
          </div>
          <div className="flex flex-col h-full min-h-[300px]">
            <UserEvents events={filteredEvents} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile; 