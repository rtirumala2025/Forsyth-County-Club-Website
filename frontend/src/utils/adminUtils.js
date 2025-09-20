import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// Admin role verification
export const isAdmin = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get current user's role
export const getCurrentUserRole = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role || 'user';
    }
    return 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user';
  }
};

// Promote user to admin (admin only)
export const promoteToAdmin = async (userId) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const isCurrentUserAdmin = await isAdmin(currentUser.uid);
  if (!isCurrentUserAdmin) throw new Error('Insufficient permissions');

  try {
    await updateDoc(doc(db, 'users', userId), {
      role: 'admin',
      promotedBy: currentUser.uid,
      promotedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    throw error;
  }
};

// Audit log for admin actions
export const logAdminAction = async (action, details = {}) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const auditLog = {
      action,
      details,
      userId: user.uid,
      userEmail: user.email,
      timestamp: new Date().toISOString(),
      ipAddress: await getClientIP()
    };

    await updateDoc(doc(db, 'audit_logs', Date.now().toString()), auditLog);
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

// Get client IP (simplified version)
const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'unknown';
  }
};

// Admin dashboard data
export const getAdminDashboardData = async () => {
  const isCurrentUserAdmin = await isAdmin(auth.currentUser?.uid);
  if (!isCurrentUserAdmin) throw new Error('Insufficient permissions');

  try {
    // This would typically involve multiple Firestore queries
    // For now, returning a placeholder structure
    return {
      totalUsers: 0,
      totalClubs: 0,
      totalEvents: 0,
      recentActivity: []
    };
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    throw error;
  }
};
