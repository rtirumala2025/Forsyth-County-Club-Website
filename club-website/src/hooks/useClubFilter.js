import { useMemo } from 'react';
import { SEARCH_CONFIG } from '../utils/constants';

/**
 * Custom hook for filtering and grouping clubs
 * @param {Array} clubs - Array of club objects
 * @param {string} searchTerm - Search term to filter clubs
 * @param {string} selectedCategory - Category filter (optional)
 * @returns {Object} Filtered and grouped clubs data
 */
export const useClubFilter = (clubs, searchTerm = '', selectedCategory = null) => {
  // Group clubs by category
  const clubsByCategory = useMemo(() => {
    const grouped = clubs.reduce((acc, club) => {
      const category = club.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(club);
      return acc;
    }, {});
    
    // Sort categories alphabetically and clubs within each category
    const sortedCategories = Object.keys(grouped).sort();
    const result = {};
    sortedCategories.forEach(category => {
      result[category] = grouped[category].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return result;
  }, [clubs]);

  // Filter clubs based on search term and category
  const filteredClubs = useMemo(() => {
    let result = clubsByCategory;

    // Apply search filter
    if (searchTerm && searchTerm.length >= SEARCH_CONFIG.minSearchLength) {
      const searchLower = searchTerm.toLowerCase();
      const filtered = {};
      
      Object.keys(clubsByCategory).forEach(category => {
        const categoryClubs = clubsByCategory[category].filter(club => {
          return SEARCH_CONFIG.searchFields.some(field => 
            club[field] && club[field].toLowerCase().includes(searchLower)
          );
        });
        
        if (categoryClubs.length > 0) {
          filtered[category] = categoryClubs;
        }
      });
      
      result = filtered;
    }

    // Apply category filter
    if (selectedCategory && result[selectedCategory]) {
      result = { [selectedCategory]: result[selectedCategory] };
    }

    return result;
  }, [clubsByCategory, searchTerm, selectedCategory]);

  // Get all clubs as a flat array (filtered)
  const flatFilteredClubs = useMemo(() => {
    return Object.values(filteredClubs).flat();
  }, [filteredClubs]);

  // Get statistics
  const stats = useMemo(() => {
    return {
      totalClubs: clubs.length,
      totalCategories: Object.keys(clubsByCategory).length,
      filteredClubs: flatFilteredClubs.length,
      filteredCategories: Object.keys(filteredClubs).length
    };
  }, [clubs.length, clubsByCategory, flatFilteredClubs.length, filteredClubs]);

  // Get categories list
  const categories = useMemo(() => {
    return Object.keys(clubsByCategory).sort();
  }, [clubsByCategory]);

  return {
    clubsByCategory,
    filteredClubs,
    flatFilteredClubs,
    stats,
    categories
  };
};

/**
 * Hook for getting a specific club by ID
 * @param {Array} clubs - Array of club objects
 * @param {string} clubId - ID of the club to find
 * @returns {Object|null} Club object or null if not found
 */
export const useClubById = (clubs, clubId) => {
  return useMemo(() => {
    return clubs.find(club => club.id === clubId) || null;
  }, [clubs, clubId]);
};

/**
 * Hook for getting clubs by category
 * @param {Array} clubs - Array of club objects
 * @param {string} category - Category to filter by
 * @returns {Array} Array of clubs in the specified category
 */
export const useClubsByCategory = (clubs, category) => {
  return useMemo(() => {
    return clubs.filter(club => club.category === category);
  }, [clubs, category]);
};