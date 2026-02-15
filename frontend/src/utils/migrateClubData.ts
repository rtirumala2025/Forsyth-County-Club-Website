import { db } from '../config/firebaseConfig';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { allClubData } from '../data/clubData';

// Migration script to move static club data to Firestore
export const migrateClubDataToFirestore = async () => {
  try {
    console.log('Starting club data migration to Firestore...');

    const clubsCollection = collection(db, 'clubs');
    let batch = writeBatch(db);
    let opCount = 0;
    let totalSuccess = 0;
    let totalErrors = 0;

    for (const schoolData of allClubData) {
      if (!schoolData.school) continue;

      // Handle both .clubs (new) and .club (legacy) properties
      const clubs = schoolData.clubs || (schoolData as any).club || [];

      for (const club of clubs) {
        if (!club.name) continue;

        try {
          const clubRef = doc(clubsCollection);
          batch.set(clubRef, {
            ...club,
            school: schoolData.school,
            searchableName: club.name.toLowerCase(),
            searchableDescription: (club.description || '').toLowerCase(),
            searchableCategory: (club.category || '').toLowerCase(),
            createdAt: new Date().toISOString(),
            viewCount: 0,
            joinCount: 0,
            rating: 0,
            reviewCount: 0,
            gradeLevels: club.gradeLevels || [],
            meetingTimes: club.meetingTimes || [],
            prerequisites: club.prerequisites || []
          });

          opCount++;
          totalSuccess++;

          if (opCount >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            opCount = 0;
            console.log(`Committed batch of 450 clubs...`);
          }
        } catch (error) {
          console.error(`Error processing club ${club.name}:`, error);
          totalErrors++;
        }
      }
    }

    if (opCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${opCount} clubs.`);
    }

    console.log(`Migration completed! Success: ${totalSuccess}, Errors: ${totalErrors}`);
    return { successCount: totalSuccess, errorCount: totalErrors };

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
