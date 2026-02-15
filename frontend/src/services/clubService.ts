import { db } from '../config/firebaseConfig';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

// Paginated club fetching with cursor-based pagination
interface ClubFetchOptions {
  pageSize?: number;
  lastDoc?: any;
  category?: string | null;
  school?: string | null;
  gradeLevel?: string | null;
  meetingTime?: string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const fetchClubsPaginated = async (options: ClubFetchOptions = {}) => {
  const {
    pageSize = 20,
    lastDoc = null,
    category = null,
    school = null,
    gradeLevel = null,
    meetingTime = null,
    sortBy = 'name',
    sortOrder = 'asc'
  } = options;

  try {
    let q = query(collection(db, 'clubs'));

    // Apply filters
    if (category) {
      q = query(q, where('category', '==', category));
    }
    if (school) {
      q = query(q, where('school', '==', school));
    }
    if (gradeLevel) {
      q = query(q, where('gradeLevels', 'array-contains', gradeLevel));
    }
    if (meetingTime) {
      q = query(q, where('meetingTimes', 'array-contains', meetingTime));
    }

    // Apply sorting
    const sortField = sortBy === 'popularity' ? 'viewCount' : sortBy;
    q = query(q, orderBy(sortField, sortOrder));

    // Apply pagination
    q = query(q, limit(pageSize));
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const clubs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      clubs,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching clubs:', error);
    throw error;
  }
};

// Search clubs with full-text search capabilities
export const searchClubs = async (searchTerm: string, options: ClubFetchOptions = {}) => {
  const {
    pageSize = 20,
    lastDoc = null,
    category = null,
    school = null
  } = options;

  try {
    let q = query(collection(db, 'clubs'));

    // Apply filters
    if (category) {
      q = query(q, where('category', '==', category));
    }
    if (school) {
      q = query(q, where('school', '==', school));
    }

    // For now, we'll do client-side filtering for search
    // In production, consider using Algolia or Firestore's full-text search
    const snapshot = await getDocs(q);
    let clubs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Client-side search filtering
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      clubs = clubs.filter(club =>
        club.searchableName?.includes(searchLower) ||
        club.searchableDescription?.includes(searchLower) ||
        club.searchableCategory?.includes(searchLower)
      );
    }

    // Apply pagination
    const startIndex = lastDoc ? clubs.findIndex(club => club.id === lastDoc.id) + 1 : 0;
    const paginatedClubs = clubs.slice(startIndex, startIndex + pageSize);

    return {
      clubs: paginatedClubs,
      lastDoc: paginatedClubs[paginatedClubs.length - 1] || null,
      hasMore: startIndex + pageSize < clubs.length,
      totalResults: clubs.length
    };
  } catch (error) {
    console.error('Error searching clubs:', error);
    throw error;
  }
};

// Get club by ID
export const getClubById = async (clubId) => {
  try {
    const clubDoc = await getDoc(doc(db, 'clubs', clubId));
    if (clubDoc.exists()) {
      return {
        id: clubDoc.id,
        ...clubDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching club:', error);
    throw error;
  }
};

// Increment club view count
export const incrementClubViews = async (clubId) => {
  try {
    await updateDoc(doc(db, 'clubs', clubId), {
      viewCount: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
    // Don't throw error for view counting failures
  }
};

// Get popular clubs
export const getPopularClubs = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'clubs'),
      orderBy('viewCount', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching popular clubs:', error);
    throw error;
  }
};

// Get clubs by category
export const getClubsByCategory = async (category, limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'clubs'),
      where('category', '==', category),
      orderBy('viewCount', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching clubs by category:', error);
    throw error;
  }
};

// Get clubs by school
export const getClubsBySchool = async (school, limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'clubs'),
      where('school', '==', school),
      orderBy('name', 'asc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching clubs by school:', error);
    throw error;
  }
};

// Get all unique categories
export const getCategories = async () => {
  try {
    const q = query(collection(db, 'clubs'));
    const snapshot = await getDocs(q);

    const categories = new Set();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
    });

    return Array.from(categories).sort();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get all unique schools
export const getSchools = async () => {
  try {
    const q = query(collection(db, 'clubs'));
    const snapshot = await getDocs(q);

    const schools = new Set();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.school) {
        schools.add(data.school);
      }
    });

    return Array.from(schools).sort();
  } catch (error) {
    console.error('Error fetching schools:', error);
    throw error;
  }
};
