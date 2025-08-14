import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit2, Check, X } from 'lucide-react';

const ProfileHeader = ({ user, onSignOut, onImageUpload, onNameUpdate, editLoading, nameError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name || '');
  const fileInputRef = useRef(null);
  const prevUserNameRef = useRef(user.name);

  useEffect(() => {
    setNameInput(user.name || '');
  }, [user.name]);

  useEffect(() => {
    if (
      isEditingName &&
      user.name === nameInput &&
      user.name !== prevUserNameRef.current
    ) {
      setIsEditingName(false);
    }
    prevUserNameRef.current = user.name;
  }, [user.name, nameInput, isEditingName]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      alert('Please select a JPG or PNG image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB.');
      return;
    }
    setIsUploading(true);
    try {
      await onImageUpload(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditName = () => {
    setIsEditingName(true);
    setNameInput(user.name || '');
  };

  const handleCancelEditName = (e) => {
    e?.preventDefault?.();
    setIsEditingName(false);
    setNameInput(user.name || '');
  };

  const handleSaveName = async (e) => {
    e?.preventDefault?.();
    if (!nameInput.trim() || nameInput.trim() === user.name) {
      setIsEditingName(false);
      setNameInput(user.name || '');
      return;
    }
    await onNameUpdate(nameInput.trim());
    setIsEditingName(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-8 flex flex-col md:flex-row items-center md:items-start md:justify-between">
      <div className="flex items-center space-x-6">
        {/* Profile Image */}
        <div className="relative">
          <img
            src={user.photoURL || '/default-avatar.svg'}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-blue-200 shadow-md object-cover"
            onError={(e) => {
              e.target.src = '/default-avatar.svg';
            }}
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        {/* Name and Info Section */}
        <div className="flex flex-col space-y-2">
          {/* Name Display */}
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <button
              onClick={handleEditName}
              className="p-1 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
              title="Edit name"
            >
              <Edit2 size={16} />
            </button>
          </div>
          {/* Name Edit Form */}
          {isEditingName && (
            <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-md">
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="flex-1 text-lg font-bold text-gray-900 bg-white border-2 border-blue-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                  placeholder="Enter your name"
                  maxLength={50}
                  autoFocus
                />
              </div>
              {nameError && (
                <div className="text-red-600 text-sm mb-2">{nameError}</div>
              )}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveName}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                >
                  <Check size={14} />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancelEditName}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                >
                  <X size={14} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}
          <p className="text-gray-600 text-sm">{user.email}</p>
          {user.dateJoined && (
            <p className="text-xs text-gray-400">Joined: {user.dateJoined}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center space-y-4 mt-6 md:mt-0">
        {/* Upload Photo Button */}
        <button
          onClick={triggerFileInput}
          disabled={isUploading}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-medium shadow hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera size={16} />
          <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={onSignOut}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold shadow hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
        >
          Sign Out
        </button>
      </div>
    </motion.div>
  );
};

export default ProfileHeader; 