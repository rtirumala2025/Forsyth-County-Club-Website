import { db } from '../config/firebaseConfig';
import { 
  collection, 
  addDoc, 
  batch, 
  writeBatch, 
  doc, 
  setDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { allClubData } from '../data/clubData';
import { 
  validateClubData, 
  sanitizeClubData, 
  transformClubForDisplay 
} from './firestoreSchema';

// Migration status tracking
const MIGRATION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Migration configuration
const MIGRATION_CONFIG = {
  BATCH_SIZE: 500, // Firestore batch limit
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

// Migration progress tracking
let migrationProgress = {
  status: MIGRATION_STATUS.NOT_STARTED,
  totalItems: 0,
  processedItems: 0,
  successfulItems: 0,
  failedItems: 0,
  errors: [],
  startTime: null,
  endTime: null
};

// Main migration function
export const migrateAllData = async () => {
  try {
    console.log('Starting comprehensive data migration...');
    migrationProgress.status = MIGRATION_STATUS.IN_PROGRESS;
    migrationProgress.startTime = new Date();
    
    // Step 1: Migrate schools
    await migrateSchools();
    
    // Step 2: Migrate categories
    await migrateCategories();
    
    // Step 3: Migrate clubs
    await migrateClubs();
    
    // Step 4: Create indexes (documentation)
    await createIndexDocumentation();
    
    migrationProgress.status = MIGRATION_STATUS.COMPLETED;
    migrationProgress.endTime = new Date();
    
    console.log('Migration completed successfully!');
    console.log('Migration summary:', migrationProgress);
    
    return migrationProgress;
    
  } catch (error) {
    console.error('Migration failed:', error);
    migrationProgress.status = MIGRATION_STATUS.FAILED;
    migrationProgress.errors.push(error.message);
    migrationProgress.endTime = new Date();
    
    throw error;
  }
};

// Migrate schools from club data
const migrateSchools = async () => {
  console.log('Migrating schools...');
  
  // Extract unique schools from club data
  const schools = new Set();
  allClubData.forEach(club => {
    if (club.school) {
      schools.add(club.school);
    }
  });
  
  const schoolData = Array.from(schools).map(schoolName => ({
    name: schoolName,
    address: '', // Would need to be populated manually
    contactInfo: {},
    principal: '',
    website: '',
    isActive: true,
    clubCount: allClubData.filter(club => club.school === schoolName).length,
    studentCount: 0, // Would need to be populated manually
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  
  // Batch write schools
  const batch = writeBatch(db);
  schoolData.forEach(school => {
    const schoolRef = doc(collection(db, 'schools'));
    batch.set(schoolRef, school);
  });
  
  await batch.commit();
  console.log(`Migrated ${schoolData.length} schools`);
};

// Migrate categories from club data
const migrateCategories = async () => {
  console.log('Migrating categories...');
  
  // Extract unique categories from club data
  const categories = new Set();
  allClubData.forEach(club => {
    if (club.category) {
      categories.add(club.category);
    }
  });
  
  const categoryData = Array.from(categories).map((categoryName, index) => ({
    name: categoryName,
    description: `Clubs related to ${categoryName.toLowerCase()}`,
    icon: getCategoryIcon(categoryName),
    color: getCategoryColor(categoryName),
    isActive: true,
    clubCount: allClubData.filter(club => club.category === categoryName).length,
    sortOrder: index,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  
  // Batch write categories
  const batch = writeBatch(db);
  categoryData.forEach(category => {
    const categoryRef = doc(collection(db, 'categories'));
    batch.set(categoryRef, category);
  });
  
  await batch.commit();
  console.log(`Migrated ${categoryData.length} categories`);
};

// Migrate clubs with validation and sanitization
const migrateClubs = async () => {
  console.log('Migrating clubs...');
  
  migrationProgress.totalItems = allClubData.length;
  migrationProgress.processedItems = 0;
  migrationProgress.successfulItems = 0;
  migrationProgress.failedItems = 0;
  
  // Process clubs in batches
  for (let i = 0; i < allClubData.length; i += MIGRATION_CONFIG.BATCH_SIZE) {
    const batchClubs = allClubData.slice(i, i + MIGRATION_CONFIG.BATCH_SIZE);
    await migrateClubBatch(batchClubs);
    
    // Update progress
    migrationProgress.processedItems = Math.min(i + MIGRATION_CONFIG.BATCH_SIZE, allClubData.length);
    console.log(`Progress: ${migrationProgress.processedItems}/${migrationProgress.totalItems}`);
  }
  
  console.log(`Migrated ${migrationProgress.successfulItems} clubs successfully`);
  if (migrationProgress.failedItems > 0) {
    console.log(`Failed to migrate ${migrationProgress.failedItems} clubs`);
  }
};

// Migrate a batch of clubs
const migrateClubBatch = async (clubs) => {
  const batch = writeBatch(db);
  
  for (const club of clubs) {
    try {
      // Validate club data
      const validation = validateClubData(club);
      if (!validation.isValid) {
        console.warn(`Validation failed for club ${club.name}:`, validation.errors);
        migrationProgress.failedItems++;
        migrationProgress.errors.push(`Validation failed for ${club.name}: ${validation.errors.join(', ')}`);
        continue;
      }
      
      // Sanitize club data
      const sanitizedClub = sanitizeClubData(club);
      
      // Add migration metadata
      const clubData = {
        ...sanitizedClub,
        migratedAt: new Date(),
        source: 'static_data_migration',
        // Add searchable fields
        searchableName: sanitizedClub.name?.toLowerCase() || '',
        searchableDescription: sanitizedClub.description?.toLowerCase() || '',
        searchableCategory: sanitizedClub.category?.toLowerCase() || '',
        // Add indexes for filtering
        gradeLevels: sanitizedClub.gradeLevels || [],
        meetingTimes: sanitizedClub.meetingTime ? [sanitizedClub.meetingTime] : [],
        prerequisites: sanitizedClub.prerequisites || [],
        // Add popularity metrics
        viewCount: 0,
        joinCount: 0,
        rating: 0,
        reviewCount: 0,
        // Add timestamps
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add to batch
      const clubRef = doc(collection(db, 'clubs'));
      batch.set(clubRef, clubData);
      
      migrationProgress.successfulItems++;
      
    } catch (error) {
      console.error(`Error processing club ${club.name}:`, error);
      migrationProgress.failedItems++;
      migrationProgress.errors.push(`Error processing ${club.name}: ${error.message}`);
    }
  }
  
  // Commit batch
  await batch.commit();
};

// Get category icon based on category name
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'Academic': 'book',
    'Arts': 'palette',
    'Athletics': 'trophy',
    'Community Service': 'heart',
    'Cultural': 'globe',
    'Environmental': 'leaf',
    'Leadership': 'crown',
    'Music': 'music',
    'Science': 'flask',
    'Technology': 'laptop',
    'Other': 'users'
  };
  
  return iconMap[categoryName] || 'users';
};

// Get category color based on category name
const getCategoryColor = (categoryName) => {
  const colorMap = {
    'Academic': '#3B82F6',
    'Arts': '#8B5CF6',
    'Athletics': '#EF4444',
    'Community Service': '#10B981',
    'Cultural': '#F59E0B',
    'Environmental': '#22C55E',
    'Leadership': '#F97316',
    'Music': '#EC4899',
    'Science': '#06B6D4',
    'Technology': '#6366F1',
    'Other': '#6B7280'
  };
  
  return colorMap[categoryName] || '#6B7280';
};

// Create index documentation
const createIndexDocumentation = async () => {
  console.log('Creating index documentation...');
  
  const indexDoc = {
    title: 'Firestore Indexes',
    description: 'Required indexes for optimal query performance',
    indexes: [
      {
        collection: 'clubs',
        fields: [
          { field: 'category', order: 'ASCENDING' },
          { field: 'school', order: 'ASCENDING' }
        ]
      },
      {
        collection: 'clubs',
        fields: [
          { field: 'gradeLevels', order: 'ASCENDING' },
          { field: 'category', order: 'ASCENDING' }
        ]
      },
      {
        collection: 'clubs',
        fields: [
          { field: 'isActive', order: 'ASCENDING' },
          { field: 'createdAt', order: 'DESCENDING' }
        ]
      },
      {
        collection: 'clubs',
        fields: [
          { field: 'viewCount', order: 'DESCENDING' },
          { field: 'category', order: 'ASCENDING' }
        ]
      },
      {
        collection: 'events',
        fields: [
          { field: 'clubId', order: 'ASCENDING' },
          { field: 'startDate', order: 'ASCENDING' }
        ]
      },
      {
        collection: 'events',
        fields: [
          { field: 'school', order: 'ASCENDING' },
          { field: 'startDate', order: 'ASCENDING' }
        ]
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await setDoc(doc(db, 'system', 'indexes'), indexDoc);
  console.log('Index documentation created');
};

// Verify migration success
export const verifyMigration = async () => {
  try {
    console.log('Verifying migration...');
    
    // Check clubs collection
    const clubsSnapshot = await getDocs(collection(db, 'clubs'));
    console.log(`Found ${clubsSnapshot.size} clubs in Firestore`);
    
    // Check schools collection
    const schoolsSnapshot = await getDocs(collection(db, 'schools'));
    console.log(`Found ${schoolsSnapshot.size} schools in Firestore`);
    
    // Check categories collection
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    console.log(`Found ${categoriesSnapshot.size} categories in Firestore`);
    
    // Sample data verification
    if (clubsSnapshot.size > 0) {
      const firstClub = clubsSnapshot.docs[0].data();
      console.log('Sample club data:', {
        name: firstClub.name,
        category: firstClub.category,
        school: firstClub.school,
        migratedAt: firstClub.migratedAt
      });
    }
    
    return {
      clubs: clubsSnapshot.size,
      schools: schoolsSnapshot.size,
      categories: categoriesSnapshot.size,
      success: true
    };
    
  } catch (error) {
    console.error('Verification failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get migration progress
export const getMigrationProgress = () => {
  return { ...migrationProgress };
};

// Reset migration progress
export const resetMigrationProgress = () => {
  migrationProgress = {
    status: MIGRATION_STATUS.NOT_STARTED,
    totalItems: 0,
    processedItems: 0,
    successfulItems: 0,
    failedItems: 0,
    errors: [],
    startTime: null,
    endTime: null
  };
};
