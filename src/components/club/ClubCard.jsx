import React from 'react';
import { ChevronRight, User } from 'lucide-react';

const ClubCard = ({ club, onSelectClub, CategoryColors }) => {
  if (!club) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const handleLearnMoreClick = () => {
    console.log('Learn More clicked for:', club.name);
    if (onSelectClub && club.id) {
      console.log('Selecting club:', club.id);
      onSelectClub(club.id);
    } else {
      alert(`${club.name}\n\nCategory: ${club.category}\nSponsor: ${club.sponsor}\n\nDescription: ${club.description}\n\nMeeting Details: ${club.meetingTime || 'TBA'}\nLocation: ${club.location || 'TBA'}`);
    }
  };

  // Use class name or fallback to bg color code
  const categoryClassOrColor =
    CategoryColors?.[club.category] ||
    'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      {/* Header section */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex-1 mr-2 leading-tight">
          {club.name || 'Unknown Club'}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${categoryClassOrColor}`}>
          {club.category || 'Unknown'}
        </span>
      </div>

      {/* Description */}
      <div className="flex-1 mb-4">
        <p className="text-gray-600 text-sm leading-relaxed">
          {club.description || 'No description available'}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center text-gray-500 text-sm flex-1 mr-4">
          <User size={14} className="mr-1 flex-shrink-0" />
          <span className="truncate">{club.sponsor || 'Unknown Sponsor'}</span>
        </div>

        <button
          onClick={handleLearnMoreClick}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm hover:bg-blue-50 px-3 py-2 rounded-md transition-colors flex-shrink-0"
        >
          Learn More
          <ChevronRight size={14} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export { ClubCard }; // Enables named import
export default ClubCard; // Keeps default import support