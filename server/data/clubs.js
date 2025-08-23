/**
 * Club data for AI recommendations
 * This file exports the club data in the format expected by the backend services
 */

// Import the original club data and transform it
import { allClubData } from '../../src/data/clubData.js';

/**
 * Transform club data to the format expected by the backend services
 */
function transformClubData() {
  const transformedClubs = [];
  
  allClubData.forEach(schoolData => {
    if (schoolData.clubs && Array.isArray(schoolData.clubs)) {
      schoolData.clubs.forEach(club => {
        // Extract interests from club data
        const interests = [];
        
        // Add category as primary interest
        if (club.category) {
          interests.push(club.category);
        }
        
        // Add activities as interests (limit to first 3)
        if (club.activities && Array.isArray(club.activities)) {
          interests.push(...club.activities.slice(0, 3));
        }
        
        // Add benefits as interests (limit to first 2)
        if (club.benefits && Array.isArray(club.benefits)) {
          interests.push(...club.benefits.slice(0, 2));
        }
        
        // Map commitment level
        let timeCommitment = 'Medium';
        if (club.commitment) {
          const commitmentStr = club.commitment.toLowerCase();
          if (commitmentStr.includes('low')) timeCommitment = 'Low';
          else if (commitmentStr.includes('high')) timeCommitment = 'High';
        }
        
        // Map club type based on category
        let type = 'Social';
        const typeMap = {
          'Academic': 'Academic',
          'Arts': 'Creative',
          'STEM': 'Competitive',
          'Sports': 'Competitive',
          'Leadership': 'Leadership',
          'Cultural': 'Social',
          'Community Service': 'Social',
          'Religious': 'Social',
          'Support': 'Social',
          'Recreational': 'Social',
          'Business': 'Competitive',
          'Technology': 'Competitive'
        };
        type = typeMap[club.category] || 'Social';
        
        transformedClubs.push({
          name: club.name,
          category: club.category,
          school: schoolData.school,
          type: type,
          timeCommitment: timeCommitment,
          interests: interests.length > 0 ? interests : [club.category || 'General'],
          description: club.description,
          activities: club.activities || [],
          benefits: club.benefits || [],
          gradeLevels: ["9", "10", "11", "12"], // Default to all grades
          sponsor: club.sponsor,
          meetingFrequency: club.meetingFrequency,
          meetingDay: club.meetingDay,
          requirements: club.requirements
        });
      });
    }
  });
  
  return transformedClubs;
}

// Export the transformed club data
export const clubs = transformClubData();

// Export individual functions for testing
export function getClubsBySchool(school) {
  return clubs.filter(club => 
    club.school.toLowerCase() === school.toLowerCase()
  );
}

export function getAvailableSchools() {
  return [...new Set(clubs.map(club => club.school))];
}

export function getClubsByCategory(category) {
  return clubs.filter(club => 
    club.category.toLowerCase() === category.toLowerCase()
  );
}

// Default export
export default clubs;
