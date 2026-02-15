/**
 * Club Service — Stubbed
 *
 * Firebase Firestore has been removed. Club data now comes from
 * Supabase. These exports are kept as stubs so existing imports
 * don't break at compile time.
 */

import { supabase } from '../lib/supabase';

// Paginated club fetching — TODO: migrate to Supabase
interface ClubFetchOptions {
  pageSize?: number;
  category?: string;
  school?: string;
  searchQuery?: string;
}

export const fetchClubs = async (_options: ClubFetchOptions = {}) => {
  console.warn('clubService.fetchClubs: TODO migrate to Supabase');
  return { clubs: [], lastDoc: null, hasMore: false };
};

export const fetchClubsPaginated = async (_options: any = {}) => {
  console.warn('clubService.fetchClubsPaginated: TODO migrate to Supabase');
  return { clubs: [], lastDoc: null, hasMore: false };
};

export const searchClubs = async (_query: string, _options?: any) => {
  console.warn('clubService.searchClubs: TODO migrate to Supabase');
  return [];
};

export const fetchClubById = async (_clubId: string) => {
  console.warn('clubService.fetchClubById: TODO migrate to Supabase');
  return null;
};

export const getClubById = async (_clubId: string) => {
  console.warn('clubService.getClubById: TODO migrate to Supabase');
  return null;
};

export const incrementClubViews = async (_clubId: string) => {
  console.warn('clubService.incrementClubViews: TODO migrate to Supabase');
};

export const getPopularClubs = async (_limit?: number) => {
  console.warn('clubService.getPopularClubs: TODO migrate to Supabase');
  return [];
};

export const getClubsByCategory = async (_category: string, _limit?: number) => {
  console.warn('clubService.getClubsByCategory: TODO migrate to Supabase');
  return [];
};

export const getClubsBySchool = async (_school: string, _limit?: number) => {
  console.warn('clubService.getClubsBySchool: TODO migrate to Supabase');
  return [];
};

export const getCategories = async () => {
  console.warn('clubService.getCategories: TODO migrate to Supabase');
  return [];
};

export const getSchools = async () => {
  console.warn('clubService.getSchools: TODO migrate to Supabase');
  return [];
};

export const joinClub = async (_clubId: string, _userId: string) => {
  console.warn('clubService.joinClub: TODO migrate to Supabase');
};

export const leaveClub = async (_clubId: string, _userId: string) => {
  console.warn('clubService.leaveClub: TODO migrate to Supabase');
};
