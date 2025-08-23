import React from 'react';

const CategoryGrid = ({ clubsByCategory, CategoryColors, onSelectClub }) => {
  // Add this safety check to prevent the error
  if (!clubsByCategory || typeof clubsByCategory !== 'object') {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Object.keys(clubsByCategory).map(category => (
        <div key={category} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">{category}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${CategoryColors?.[category] || 'bg-gray-100 text-gray-800'}`}>
              {clubsByCategory[category]?.length || 0}
            </span>
          </div>
          <div className="space-y-2">
            {/* Removed .slice(0, 4) to show all clubs */}
            {(clubsByCategory[category] || []).map(club => (
              <button
                key={club.id}
                onClick={() => onSelectClub(club.id)}
                className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
              >
                {club.name}
              </button>
            ))}
            {/* Removed the "+X more clubs" section since we're showing all clubs now */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryGrid;