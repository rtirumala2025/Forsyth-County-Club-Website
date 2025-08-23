// src/api.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// Fetch all clubs for a user (read from backend)
export const fetchUserClubs = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/userClubs?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user clubs');
    return await response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Save or update user club selections
export const saveUserClubs = async (userId, clubs) => {
  try {
    const response = await fetch(`${API_BASE_URL}/userClubs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, clubs }),
    });
    if (!response.ok) throw new Error('Failed to save user clubs');
    return await response.json();
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};
