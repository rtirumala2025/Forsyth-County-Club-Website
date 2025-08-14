// Category color mappings for consistent styling across the app
export const CategoryColors = {
  'Academic': 'bg-blue-100 text-blue-800',
  'Arts': 'bg-purple-100 text-purple-800',
  'Business': 'bg-green-100 text-green-800',
  'Career': 'bg-orange-100 text-orange-800',
  'Cultural': 'bg-pink-100 text-pink-800',
  'Recreation': 'bg-yellow-100 text-yellow-800',
  'Religious': 'bg-indigo-100 text-indigo-800',
  'Service': 'bg-red-100 text-red-800',
  'Sports': 'bg-teal-100 text-teal-800',
  'STEM': 'bg-cyan-100 text-cyan-800',
  'Support': 'bg-gray-100 text-gray-800',
  'Leadership': 'bg-emerald-100 text-emerald-800',
  'Awareness': 'bg-violet-100 text-violet-800'
};

// Default category for clubs without a specified category
export const DEFAULT_CATEGORY = 'Other';

// Search configuration
export const SEARCH_CONFIG = {
  minSearchLength: 1,
  searchFields: ['name', 'description', 'sponsor'],
  debounceDelay: 300
};

// UI Constants
export const UI_CONFIG = {
  maxClubsPreview: 4, // Maximum number of clubs to show in category preview
  sidebarWidth: 'w-80',
  breakpoints: {
    mobile: 'lg:hidden',
    desktop: 'lg:block'
  }
};

// Club status options
export const CLUB_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  RECRUITING: 'recruiting'
};

// Meeting frequency options
export const MEETING_FREQUENCY = {
  WEEKLY: 'weekly',
  BIWEEKLY: 'bi-weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  AS_NEEDED: 'as-needed'
};

// Contact methods
export const CONTACT_METHODS = {
  EMAIL: 'email',
  PHONE: 'phone',
  CLASSROOM: 'classroom',
  INSTAGRAM: 'instagram'
};