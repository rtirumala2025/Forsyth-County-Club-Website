/**
 * Admin Utilities — Stubbed
 *
 * Firebase Firestore removed. These functions will be migrated to
 * Supabase RLS + server-side role checks. Stubs kept for compile.
 */

import { supabase } from '../lib/supabase';

export const isAdmin = async (_userId: string) => {
  console.warn('adminUtils.isAdmin: TODO migrate to Supabase');
  return false;
};

export const getCurrentUserRole = async () => {
  console.warn('adminUtils.getCurrentUserRole: TODO migrate to Supabase');
  return 'user';
};

export const promoteToAdmin = async (_userId: string) => {
  throw new Error('adminUtils.promoteToAdmin: TODO migrate to Supabase');
};

export const logAdminAction = async (_action: string, _details = {}) => {
  console.warn('adminUtils.logAdminAction: TODO migrate to Supabase');
};

export const getAdminDashboardData = async () => {
  console.warn('adminUtils.getAdminDashboardData: TODO migrate to Supabase');
  return { totalUsers: 0, totalClubs: 0, totalEvents: 0, recentActivity: [] };
};
