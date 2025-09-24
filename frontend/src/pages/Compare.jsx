import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Users, Calendar, MapPin, Star, X, ChevronDown, Filter, Grid, List, ArrowRight } from 'lucide-react';
import { allClubData, getClubsBySchool, getAvailableSchools } from '../data/clubData';
import { CategoryColors } from '../utils/constants';

const Compare = () => {
  const navigate = useNavigate();
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('West Forsyth High School');
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [showComparison, setShowComparison] = useState(false);

  // Available schools
  const availableSchools = getAvailableSchools() || [];

  // Filter clubs by selected school
  const filteredClubsData = useMemo(() => {
    return getClubsBySchool(selectedSchool) || [];
  }, [selectedSchool]);

  const clubsData = filteredClubsData || [];
  const categories = ['All', ...Object.keys(CategoryColors)];

  const filteredClubs = useMemo(() => {
    return clubsData.filter(club => {
      const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           club.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, clubsData]);

  const addClubToCompare = (club) => {
    if (selectedClubs.length < 3 && !selectedClubs.find(c => c.id === club.id)) {
      setSelectedClubs([...selectedClubs, club]);
    }
  };

  const removeClubFromCompare = (clubId) => {
    setSelectedClubs(selectedClubs.filter(club => club.id !== clubId));
    if (selectedClubs.length <= 2) {
      setShowComparison(false);
    }
  };

  const clearAll = () => {
    setSelectedClubs([]);
    setShowComparison(false);
  };

  const handleCompare = () => {
    if (selectedClubs.length >= 2) {
      setShowComparison(true);
    }
  };

  // If comparison is active, show the comparison view
  if (showComparison && selectedClubs.length >= 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowComparison(false)}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft size={20} className="mr-1" />
                  Back to Selection
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Club Comparison</h1>
              </div>
              <div className="text-sm text-gray-600">
                Comparing {selectedClubs.length} clubs
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Club Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {selectedClubs.map((club, index) => (
              <div key={club.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${CategoryColors[club.category] || 'bg-gray-100 text-gray-800'}`}>
                    {club.category}
                  </span>
                  <button
                    onClick={() => removeClubFromCompare(club.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{club.name}</h2>
                <p className="text-gray-600 text-sm mb-4">{club.description}</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users size={16} className="mr-2" />
                    <span>Sponsor: {club.sponsor}</span>
                  </div>
                  {club.meetingFrequency && (
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      <span>{club.meetingFrequency}</span>
                    </div>
                  )}
                  {club.meetingDay && (
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      <span>Day: {club.meetingDay}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Comparison Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Detailed Comparison</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 border-r border-gray-200">
                      Features
                    </th>
                    {selectedClubs.map(club => (
                      <th key={club.id} className="px-6 py-4 text-left text-sm font-medium text-gray-900 border-r border-gray-200">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${CategoryColors[club.category]}`}>
                            {club.category}
                          </span>
                          <span className="font-semibold">{club.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Description</td>
                    {selectedClubs.map(club => (
                      <td key={club.id} className="px-6 py-4 text-sm text-gray-600 border-r border-gray-200">
                        {club.description}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Sponsor</td>
                    {selectedClubs.map(club => (
                      <td key={club.id} className="px-6 py-4 text-sm text-gray-600 border-r border-gray-200">
                        {club.sponsor}
                      </td>
                    ))}
                  </tr>
                  {selectedClubs.some(club => club.meetingFrequency) && (
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Meeting Frequency</td>
                      {selectedClubs.map(club => (
                        <td key={club.id} className="px-6 py-4 text-sm text-gray-600 border-r border-gray-200">
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2 text-gray-400" />
                            {club.meetingFrequency || 'Not specified'}
                          </div>
                        </td>
                      ))}
                    </tr>
                  )}
                  {selectedClubs.some(club => club.meetingDay) && (
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Meeting Day</td>
                      {selectedClubs.map(club => (
                        <td key={club.id} className="px-6 py-4 text-sm text-gray-600 border-r border-gray-200">
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2 text-gray-400" />
                            {club.meetingDay || 'Not specified'}
                          </div>
                        </td>
                      ))}
                    </tr>
                  )}
                  {selectedClubs.some(club => club.requirements) && (
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Requirements</td>
                      {selectedClubs.map(club => (
                        <td key={club.id} className="px-6 py-4 text-sm text-gray-600 border-r border-gray-200">
                          {club.requirements || 'Not specified'}
                        </td>
                      ))}
                    </tr>
                  )}
                  {selectedClubs.some(club => club.commitment) && (
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Commitment Level</td>
                      {selectedClubs.map(club => (
                        <td key={club.id} className="px-6 py-4 text-sm text-gray-600 border-r border-gray-200">
                          {club.commitment || 'Not specified'}
                        </td>
                      ))}
                    </tr>
                  )}
                  {selectedClubs.some(club => club.activities && club.activities.length > 0) && (
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Activities</td>
                      {selectedClubs.map(club => (
                        <td key={club.id} className="px-6 py-4 text-sm text-gray-600 border-r border-gray-200">
                          {club.activities && club.activities.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                              {club.activities.slice(0, 3).map((activity, index) => (
                                <li key={index} className="text-xs">{activity}</li>
                              ))}
                              {club.activities.length > 3 && (
                                <li className="text-xs text-gray-500">+{club.activities.length - 3} more</li>
                              )}
                            </ul>
                          ) : (
                            'Not specified'
                          )}
                        </td>
                      ))}
                    </tr>
                  )}
                  {selectedClubs.some(club => club.benefits && club.benefits.length > 0) && (
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">Benefits</td>
                      {selectedClubs.map(club => (
                        <td key={club.id} className="px-6 py-4 text-sm text-gray-600 border-r border-gray-200">
                          {club.benefits && club.benefits.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                              {club.benefits.slice(0, 3).map((benefit, index) => (
                                <li key={index} className="text-xs">{benefit}</li>
                              ))}
                              {club.benefits.length > 3 && (
                                <li className="text-xs text-gray-500">+{club.benefits.length - 3} more</li>
                              )}
                            </ul>
                          ) : (
                            'Not specified'
                          )}
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default club selection view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft size={20} className="mr-1" />
                Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Compare Clubs</h1>
            </div>
            
            {/* School Selection */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDropdownPosition({
                      top: rect.bottom + 8,
                      left: rect.left
                    });
                    setSchoolDropdownOpen(!schoolDropdownOpen);
                  }}
                  className="flex items-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 text-sm font-medium text-gray-700"
                >
                  <span className="mr-2">{selectedSchool}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${schoolDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {schoolDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                    {availableSchools.map(school => (
                      <button
                        key={school}
                        onClick={() => {
                          setSelectedSchool(school);
                          setSchoolDropdownOpen(false);
                          setSelectedClubs([]);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                          selectedSchool === school ? 'bg-blue-50 text-blue-800' : ''
                        }`}
                      >
                        {school}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-96 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Clubs</h2>
                
                <div className="relative mb-4">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clubs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Clubs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Selected Clubs</h2>
                  {selectedClubs.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  {selectedClubs.length}/3 selected
                </div>

                {selectedClubs.length >= 2 && (
                  <div className="mb-4">
                    <button
                      onClick={handleCompare}
                      className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                    >
                      <span>Compare Selected Clubs</span>
                      <ArrowRight size={20} className="ml-2" />
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {selectedClubs.map(club => (
                    <div
                      key={club.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${CategoryColors[club.category] || 'bg-gray-100 text-gray-800'}`}>
                            {club.category}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 truncate">{club.name}</div>
                      </div>
                      <button
                        onClick={() => removeClubFromCompare(club.id)}
                        className="ml-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {selectedClubs.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <Star size={24} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No clubs selected</p>
                    <p className="text-xs">Select up to 3 clubs to compare</p>
                  </div>
                )}
              </div>

              {/* View Options */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">View Options</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Grid size={16} className="mr-3" />
                    Grid View
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <List size={16} className="mr-3" />
                    List View
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Club Selection Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Clubs</h2>
              
              {viewMode === 'list' ? (
                // List View
                <div className="space-y-3">
                  {filteredClubs.map(club => {
                    const isSelected = selectedClubs.find(c => c.id === club.id);
                    const canAdd = selectedClubs.length < 3 && !isSelected;
                    
                    return (
                      <div
                        key={club.id}
                        className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300'
                            : canAdd
                            ? 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => canAdd && addClubToCompare(club)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{club.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${CategoryColors[club.category] || 'bg-gray-100 text-gray-800'}`}>
                                {club.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{club.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Users size={12} className="mr-1" />
                                {club.sponsor}
                              </span>
                              {club.meetingFrequency && (
                                <span className="flex items-center">
                                  <Calendar size={12} className="mr-1" />
                                  {club.meetingFrequency}
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Grid View
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredClubs.map(club => {
                    const isSelected = selectedClubs.find(c => c.id === club.id);
                    const canAdd = selectedClubs.length < 3 && !isSelected;
                    
                    return (
                      <div
                        key={club.id}
                        className={`relative p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300'
                            : canAdd
                            ? 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => canAdd && addClubToCompare(club)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm">{club.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${CategoryColors[club.category] || 'bg-gray-100 text-gray-800'}`}>
                            {club.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{club.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center">
                            <Users size={12} className="mr-1" />
                            {club.sponsor}
                          </span>
                          {club.meetingFrequency && (
                            <span className="flex items-center">
                              <Calendar size={12} className="mr-1" />
                              {club.meetingFrequency}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredClubs.length === 0 && (
                <div className="text-center py-12">
                  <Search size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No clubs found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            {selectedClubs.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full mb-4">
                  <Star size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs selected</h3>
                <p className="text-gray-600">Select up to 3 clubs from the list above to compare their features.</p>
              </div>
            )}

            {selectedClubs.length > 0 && selectedClubs.length < 2 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full mb-4">
                  <Star size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Almost there!</h3>
                <p className="text-gray-600">Select at least 2 clubs to enable comparison.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Compare;