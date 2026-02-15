import React, { useState, useMemo } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { createAccessibleField, createAccessibleButton } from '../../utils/accessibility';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void;
  categories?: string[];
  schools?: string[];
  gradeLevels?: string[];
  meetingTimes?: string[];
  initialFilters?: any;
}

const AdvancedFilters = ({
  onFiltersChange,
  categories = [],
  schools = [],
  gradeLevels = [],
  meetingTimes = [],
  initialFilters = {}
}: AdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    school: initialFilters.school || '',
    gradeLevel: initialFilters.gradeLevel || '',
    meetingTime: initialFilters.meetingTime || '',
    hasPrerequisites: initialFilters.hasPrerequisites || false,
    isActive: initialFilters.isActive || true
  });

  // Memoize filter options to prevent unnecessary re-renders
  const filterOptions = useMemo(() => ({
    categories: categories.sort(),
    schools: schools.sort(),
    gradeLevels: gradeLevels.sort(),
    meetingTimes: meetingTimes.sort()
  }), [categories, schools, gradeLevels, meetingTimes]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      school: '',
      gradeLevel: '',
      meetingTime: '',
      hasPrerequisites: false,
      isActive: true
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value =>
      value !== '' && value !== false && value !== true
    ).length;
  }, [filters]);

  // Check if any filters are active
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              {...createAccessibleButton('Clear all filters')}
            >
              <X size={16} />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            {...createAccessibleButton(`${isExpanded ? 'Collapse' : 'Expand'} filters`)}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span>{isExpanded ? 'Less' : 'More'}</span>
          </button>
        </div>
      </div>

      {/* Basic Filters (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Category Filter */}
        <div>
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...createAccessibleField('Category filter')}
          >
            <option value="">All Categories</option>
            {filterOptions.categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* School Filter */}
        <div>
          <label htmlFor="school-filter" className="block text-sm font-medium text-gray-700 mb-1">
            School
          </label>
          <select
            id="school-filter"
            value={filters.school}
            onChange={(e) => handleFilterChange('school', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...createAccessibleField('School filter')}
          >
            <option value="">All Schools</option>
            {filterOptions.schools.map(school => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>
        </div>

        {/* Grade Level Filter */}
        <div>
          <label htmlFor="grade-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Grade Level
          </label>
          <select
            id="grade-filter"
            value={filters.gradeLevel}
            onChange={(e) => handleFilterChange('gradeLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...createAccessibleField('Grade level filter')}
          >
            <option value="">All Grades</option>
            {filterOptions.gradeLevels.map(grade => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        {/* Meeting Time Filter */}
        <div>
          <label htmlFor="time-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Time
          </label>
          <select
            id="time-filter"
            value={filters.meetingTime}
            onChange={(e) => handleFilterChange('meetingTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...createAccessibleField('Meeting time filter')}
          >
            <option value="">Any Time</option>
            {filterOptions.meetingTimes.map(time => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters (Collapsible) */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prerequisites Filter */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="prerequisites-filter"
                checked={filters.hasPrerequisites}
                onChange={(e) => handleFilterChange('hasPrerequisites', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...createAccessibleField('Has prerequisites filter')}
              />
              <label htmlFor="prerequisites-filter" className="text-sm font-medium text-gray-700">
                Has Prerequisites
              </label>
            </div>

            {/* Active Status Filter */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="active-filter"
                checked={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...createAccessibleField('Active clubs filter')}
              />
              <label htmlFor="active-filter" className="text-sm font-medium text-gray-700">
                Active Clubs Only
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
