// Category color mappings for consistent styling across the app
export const CategoryColors = {
  'Academic': 'bg-blue-400 text-white border-blue-500',
  'Arts': 'bg-purple-400 text-white border-purple-500',
  'Business': 'bg-green-400 text-white border-green-500',
  'Career': 'bg-orange-400 text-white border-orange-500',
  'Cultural': 'bg-pink-400 text-white border-pink-500',
  'Recreation': 'bg-yellow-400 text-black border-yellow-500',
  'Recreational': 'bg-yellow-400 text-black border-yellow-500',
  'Religious': 'bg-indigo-400 text-white border-indigo-500',
  'Faith-Based': 'bg-indigo-400 text-white border-indigo-500',
  'Service': 'bg-red-400 text-white border-red-500',
  'Sports': 'bg-teal-400 text-white border-teal-500',
  'Athletics': 'bg-teal-400 text-white border-teal-500',
  'STEM': 'bg-cyan-400 text-white border-cyan-500',
  'Support': 'bg-gray-400 text-white border-gray-500',
  'Leadership': 'bg-emerald-400 text-white border-emerald-500',
  'Civic Engagement': 'bg-amber-400 text-black border-amber-500',
  'CTAE': 'bg-slate-400 text-white border-slate-500',
  'Healthcare': 'bg-rose-400 text-white border-rose-500',
  'Honor Society': 'bg-violet-400 text-white border-violet-500',
  'Literary': 'bg-fuchsia-400 text-white border-fuchsia-500',
  'Inclusion': 'bg-sky-400 text-white border-sky-500',
  'Wellness': 'bg-lime-400 text-black border-lime-500',
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

// API endpoints
export const API_ENDPOINTS = {
  RECOMMENDATIONS: '/api/recommend',
  FOLLOW_UP: '/api/follow-up',
  CLUBS: '/api/clubs',
  SCHOOLS: '/api/schools'
};

// Time commitment levels
export const TIME_COMMITMENT = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

// Club types
export const CLUB_TYPES = {
  COMPETITIVE: 'Competitive',
  SOCIAL: 'Social',
  ACADEMIC: 'Academic',
  CREATIVE: 'Creative',
  LEADERSHIP: 'Leadership',
  SERVICE: 'Service'
};
