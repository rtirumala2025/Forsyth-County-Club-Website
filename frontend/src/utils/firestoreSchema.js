// Firestore schema design and validation utilities

// Collection schemas
export const FIRESTORE_SCHEMAS = {
  // Users collection
  users: {
    fields: {
      uid: 'string', // Firebase Auth UID
      email: 'string',
      displayName: 'string',
      photoURL: 'string',
      role: 'string', // 'user', 'admin', 'moderator'
      gradeLevel: 'string',
      school: 'string',
      interests: 'array', // Array of category strings
      joinedClubs: 'array', // Array of club IDs
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      lastLoginAt: 'timestamp',
      profileComplete: 'boolean',
      notifications: 'object', // Notification preferences
      preferences: 'object' // User preferences
    },
    indexes: [
      ['role', 'createdAt'],
      ['school', 'gradeLevel'],
      ['interests', 'school']
    ]
  },

  // Clubs collection
  clubs: {
    fields: {
      name: 'string',
      description: 'string',
      category: 'string',
      school: 'string',
      sponsor: 'string',
      meetingTime: 'string',
      meetingLocation: 'string',
      gradeLevels: 'array', // Array of grade level strings
      prerequisites: 'array', // Array of prerequisite strings
      requirements: 'string',
      contactInfo: 'object', // Contact information
      socialMedia: 'object', // Social media links
      images: 'array', // Array of image URLs
      isActive: 'boolean',
      isPublic: 'boolean',
      memberCount: 'number',
      maxMembers: 'number',
      viewCount: 'number',
      rating: 'number',
      reviewCount: 'number',
      tags: 'array', // Array of tag strings
      searchableName: 'string', // Lowercase for search
      searchableDescription: 'string', // Lowercase for search
      searchableCategory: 'string', // Lowercase for search
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      createdBy: 'string', // User UID
      approvedBy: 'string', // Admin UID
      approvedAt: 'timestamp'
    },
    indexes: [
      ['category', 'school'],
      ['school', 'isActive'],
      ['gradeLevels', 'category'],
      ['isActive', 'createdAt'],
      ['viewCount', 'category'],
      ['rating', 'reviewCount'],
      ['tags', 'isActive']
    ]
  },

  // Events collection
  events: {
    fields: {
      title: 'string',
      description: 'string',
      clubId: 'string', // Reference to club
      clubName: 'string', // Denormalized for performance
      school: 'string',
      startDate: 'timestamp',
      endDate: 'timestamp',
      location: 'string',
      isVirtual: 'boolean',
      meetingLink: 'string',
      maxAttendees: 'number',
      currentAttendees: 'number',
      attendees: 'array', // Array of user UIDs
      isPublic: 'boolean',
      requiresApproval: 'boolean',
      tags: 'array',
      images: 'array',
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      createdBy: 'string'
    },
    indexes: [
      ['clubId', 'startDate'],
      ['school', 'startDate'],
      ['startDate', 'isPublic'],
      ['tags', 'startDate']
    ]
  },

  // Schools collection
  schools: {
    fields: {
      name: 'string',
      address: 'string',
      contactInfo: 'object',
      principal: 'string',
      website: 'string',
      isActive: 'boolean',
      clubCount: 'number',
      studentCount: 'number',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    },
    indexes: [
      ['isActive', 'name'],
      ['clubCount', 'isActive']
    ]
  },

  // Categories collection
  categories: {
    fields: {
      name: 'string',
      description: 'string',
      icon: 'string', // Icon name or URL
      color: 'string', // Hex color code
      isActive: 'boolean',
      clubCount: 'number',
      sortOrder: 'number',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    },
    indexes: [
      ['isActive', 'sortOrder'],
      ['clubCount', 'isActive']
    ]
  },

  // Reviews collection
  reviews: {
    fields: {
      clubId: 'string',
      userId: 'string',
      userName: 'string', // Denormalized for performance
      rating: 'number', // 1-5
      comment: 'string',
      isVerified: 'boolean',
      isPublic: 'boolean',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    },
    indexes: [
      ['clubId', 'createdAt'],
      ['userId', 'createdAt'],
      ['rating', 'isPublic']
    ]
  },

  // Audit logs collection
  audit_logs: {
    fields: {
      action: 'string',
      details: 'object',
      userId: 'string',
      userEmail: 'string',
      timestamp: 'timestamp',
      ipAddress: 'string',
      userAgent: 'string'
    },
    indexes: [
      ['userId', 'timestamp'],
      ['action', 'timestamp'],
      ['timestamp', 'action']
    ]
  }
};

// Data validation functions
export const validateClubData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Club name is required');
  }
  
  if (!data.category || data.category.trim().length === 0) {
    errors.push('Category is required');
  }
  
  if (!data.school || data.school.trim().length === 0) {
    errors.push('School is required');
  }
  
  if (!data.sponsor || data.sponsor.trim().length === 0) {
    errors.push('Sponsor is required');
  }
  
  if (data.gradeLevels && !Array.isArray(data.gradeLevels)) {
    errors.push('Grade levels must be an array');
  }
  
  if (data.memberCount && (typeof data.memberCount !== 'number' || data.memberCount < 0)) {
    errors.push('Member count must be a non-negative number');
  }
  
  if (data.maxMembers && (typeof data.maxMembers !== 'number' || data.maxMembers < 0)) {
    errors.push('Max members must be a non-negative number');
  }
  
  if (data.rating && (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5)) {
    errors.push('Rating must be between 1 and 5');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUserData = (data) => {
  const errors = [];
  
  if (!data.email || !data.email.includes('@')) {
    errors.push('Valid email is required');
  }
  
  if (!data.displayName || data.displayName.trim().length === 0) {
    errors.push('Display name is required');
  }
  
  if (data.role && !['user', 'admin', 'moderator'].includes(data.role)) {
    errors.push('Invalid role');
  }
  
  if (data.gradeLevel && !['9', '10', '11', '12'].includes(data.gradeLevel)) {
    errors.push('Invalid grade level');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEventData = (data) => {
  const errors = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Event title is required');
  }
  
  if (!data.clubId || data.clubId.trim().length === 0) {
    errors.push('Club ID is required');
  }
  
  if (!data.startDate) {
    errors.push('Start date is required');
  }
  
  if (data.endDate && data.endDate < data.startDate) {
    errors.push('End date must be after start date');
  }
  
  if (data.maxAttendees && (typeof data.maxAttendees !== 'number' || data.maxAttendees < 0)) {
    errors.push('Max attendees must be a non-negative number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Data sanitization functions
export const sanitizeClubData = (data) => {
  return {
    ...data,
    name: data.name?.trim(),
    description: data.description?.trim(),
    category: data.category?.trim(),
    school: data.school?.trim(),
    sponsor: data.sponsor?.trim(),
    meetingTime: data.meetingTime?.trim(),
    meetingLocation: data.meetingLocation?.trim(),
    requirements: data.requirements?.trim(),
    searchableName: data.name?.toLowerCase().trim(),
    searchableDescription: data.description?.toLowerCase().trim(),
    searchableCategory: data.category?.toLowerCase().trim(),
    tags: data.tags?.map(tag => tag.toLowerCase().trim()).filter(Boolean) || [],
    gradeLevels: data.gradeLevels?.filter(Boolean) || [],
    prerequisites: data.prerequisites?.filter(Boolean) || [],
    isActive: Boolean(data.isActive),
    isPublic: Boolean(data.isPublic),
    memberCount: Number(data.memberCount) || 0,
    maxMembers: Number(data.maxMembers) || 0,
    viewCount: Number(data.viewCount) || 0,
    rating: Number(data.rating) || 0,
    reviewCount: Number(data.reviewCount) || 0
  };
};

export const sanitizeUserData = (data) => {
  return {
    ...data,
    email: data.email?.toLowerCase().trim(),
    displayName: data.displayName?.trim(),
    school: data.school?.trim(),
    interests: data.interests?.filter(Boolean) || [],
    joinedClubs: data.joinedClubs?.filter(Boolean) || [],
    profileComplete: Boolean(data.profileComplete),
    role: data.role || 'user'
  };
};

// Data transformation utilities
export const transformClubForDisplay = (club) => {
  return {
    ...club,
    displayName: club.name,
    displayCategory: club.category,
    displaySchool: club.school,
    displaySponsor: club.sponsor,
    displayMeetingTime: club.meetingTime || 'TBA',
    displayLocation: club.meetingLocation || 'TBA',
    displayDescription: club.description || 'No description available',
    displayRating: club.rating ? club.rating.toFixed(1) : 'N/A',
    displayMemberCount: club.memberCount || 0,
    displayMaxMembers: club.maxMembers || 'Unlimited',
    isFull: club.maxMembers && club.memberCount >= club.maxMembers,
    hasSpots: !club.maxMembers || club.memberCount < club.maxMembers
  };
};

export const transformEventForDisplay = (event) => {
  return {
    ...event,
    displayTitle: event.title,
    displayDescription: event.description || 'No description available',
    displayLocation: event.location || 'TBA',
    displayDate: event.startDate?.toDate?.() || event.startDate,
    displayTime: event.startDate?.toDate?.() || event.startDate,
    displayAttendees: event.currentAttendees || 0,
    displayMaxAttendees: event.maxAttendees || 'Unlimited',
    isFull: event.maxAttendees && event.currentAttendees >= event.maxAttendees,
    hasSpots: !event.maxAttendees || event.currentAttendees < event.maxAttendees,
    isUpcoming: event.startDate?.toDate?.() > new Date(),
    isPast: event.endDate?.toDate?.() < new Date()
  };
};
