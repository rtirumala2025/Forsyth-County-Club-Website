import { db } from '../config/firebaseConfig';
import { collection, addDoc, batch, writeBatch } from 'firebase/firestore';
import { allClubData } from '../data/clubData';

// Migration script to move static club data to Firestore
export const migrateClubDataToFirestore = async () => {
  try {
    console.log('Starting club data migration to Firestore...');
    
    // Create a batch for efficient writes
    const batch = writeBatch(db);
    const clubsCollection = collection(db, 'clubs');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process clubs in batches of 500 (Firestore limit)
    const batchSize = 500;
    const totalClubs = allClubData.length;
    
    for (let i = 0; i < totalClubs; i += batchSize) {
      const batchClubs = allClubData.slice(i, i + batchSize);
      
      // Add each club to the batch
      batchClubs.forEach((club, index) => {
        try {
          const clubRef = doc(clubsCollection);
          batch.set(clubRef, {
            ...club,
            // Add metadata
            migratedAt: new Date().toISOString(),
            source: 'static_data_migration',
            // Add searchable fields
            searchableName: club.name.toLowerCase(),
            searchableDescription: club.description?.toLowerCase() || '',
            searchableCategory: club.category?.toLowerCase() || '',
            // Add indexes for filtering
            gradeLevels: club.gradeLevels || [],
            meetingTimes: club.meetingTimes || [],
            prerequisites: club.prerequisites || [],
            // Add popularity metrics
            viewCount: 0,
            joinCount: 0,
            rating: 0,
            reviewCount: 0
          });
          successCount++;
        } catch (error) {
          console.error(`Error preparing club ${i + index}:`, error);
          errorCount++;
        }
      });
      
      // Commit this batch
      await batch.commit();
      console.log(`Migrated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(totalClubs / batchSize)}`);
    }
    
    console.log(`Migration completed! Success: ${successCount}, Errors: ${errorCount}`);
    return { successCount, errorCount };
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Create Firestore indexes for optimal querying
export const createFirestoreIndexes = async () => {
  // Note: Firestore indexes are typically created through the Firebase Console
  // or firebase.json configuration. This function documents the required indexes.
  
  const requiredIndexes = [
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
        { field: 'meetingTimes', order: 'ASCENDING' },
        { field: 'school', order: 'ASCENDING' }
      ]
    },
    {
      collection: 'clubs',
      fields: [
        { field: 'viewCount', order: 'DESCENDING' },
        { field: 'category', order: 'ASCENDING' }
      ]
    }
  ];
  
  console.log('Required Firestore indexes:', requiredIndexes);
  return requiredIndexes;
};

// Verify migration success
export const verifyMigration = async () => {
  try {
    const { getDocs, collection, query, limit } = await import('firebase/firestore');
    const clubsSnapshot = await getDocs(query(collection(db, 'clubs'), limit(10)));
    
    console.log(`Found ${clubsSnapshot.size} clubs in Firestore`);
    
    if (clubsSnapshot.size > 0) {
      const firstClub = clubsSnapshot.docs[0].data();
      console.log('Sample club data:', firstClub);
    }
    
    return clubsSnapshot.size;
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
};
