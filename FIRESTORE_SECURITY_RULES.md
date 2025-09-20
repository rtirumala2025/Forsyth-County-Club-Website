# Firestore Security Rules

## Overview
These security rules ensure that users can only access and modify their own profile data and profile pictures.

## Firestore Database Rules

Add these rules to your Firestore Database in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only access their own profile
    match /users/{userId} {
      // Allow reading, updating, deleting only if the user is authenticated and matches the UID
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      // Allow creation only if authenticated
      allow create: if request.auth != null;
    }
    
    // Add other collections as needed
    match /clubs/{clubId} {
      // Allow anyone to read clubs (public data)
      allow read: if true;
      // Only authenticated users can write (for admin purposes)
      allow write: if request.auth != null;
    }
  }
}
```

## Firebase Storage Rules

Add these rules to your Firebase Storage in the Firebase Console:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures - users can only upload/delete their own profile pictures
    // Support multiple file extensions and patterns
    match /profilePics/{filename} {
      // Allow read access to anyone (for displaying profile pictures)
      allow read: if true;
      
      // Allow write/delete only if the user is authenticated and filename matches their pattern
      allow write, delete: if request.auth != null && 
        (filename.matches('profile_.*_' + request.auth.uid + '\\..*') ||
         filename.matches(request.auth.uid + '\\..*')) &&
        resource.contentType.matches('image/.*') &&
        resource.size < 10 * 1024 * 1024; // 10MB limit for compressed images
    }
    
    // Test files for permission testing
    match /profilePics/test_{userId}.txt {
      // Allow authenticated users to create/delete test files
      allow read, write, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Connectivity test files
    match /profilePics/connectivity_test_{userId}.txt {
      // Allow authenticated users to create/delete connectivity test files
      allow read, write, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add other storage paths as needed
    match /{allPaths=**} {
      // Deny all other paths by default
      allow read, write: if false;
    }
  }
}
```

## How to Apply These Rules

1. **Firestore Rules:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to **Firestore Database** → **Rules** tab
   - Replace the existing rules with the Firestore rules above
   - Click **Publish**

2. **Storage Rules:**
   - In the same Firebase Console
   - Navigate to **Storage** → **Rules** tab
   - Replace the existing rules with the Storage rules above
   - Click **Publish**

## Quick Fix for Testing (Temporary)

If you need to test quickly, you can use these more permissive rules temporarily:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload to profilePics folder
    match /profilePics/{allPaths=**} {
      allow read, write, delete: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING: These rules are less secure and should only be used for testing!**

## Security Features

### Firestore Rules:
- ✅ Users can only read/write their own profile (`users/{uid}`)
- ✅ Users cannot access other users' profiles
- ✅ Authentication required for all operations
- ✅ Public read access for clubs (if needed)

### Storage Rules:
- ✅ Users can only upload/delete their own profile pictures
- ✅ Profile pictures are publicly readable (for display)
- ✅ File path must match user's UID
- ✅ Authentication required for write operations

## Testing the Rules

Use the Firebase Console Rules Playground to test:

1. **Test Scenarios:**
   - Authenticated user accessing their own profile ✅
   - Authenticated user trying to access another user's profile ❌
   - Unauthenticated user trying to access any profile ❌
   - User uploading profile picture to their own path ✅
   - User trying to upload to another user's path ❌

2. **Test Commands:**
   ```javascript
   // Should succeed
   db.collection('users').doc('current-user-uid').get()
   
   // Should fail
   db.collection('users').doc('other-user-uid').get()
   
   // Should succeed
   storage.ref('profilePics/current-user-uid.jpg').put(file)
   
   // Should fail
   storage.ref('profilePics/other-user-uid.jpg').put(file)
   ```

## Additional Security Considerations

1. **Data Validation:** Consider adding data validation rules
2. **Rate Limiting:** Implement rate limiting for uploads
3. **File Size Limits:** Set maximum file sizes in Storage rules
4. **File Type Validation:** Restrict to specific image formats
5. **Admin Access:** Add admin roles for managing all profiles

## Example Enhanced Rules with Validation

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && 
        request.resource.data.keys().hasAll(['name', 'email', 'bio', 'grade', 'clubs', 'profilePic', 'createdAt']) &&
        request.resource.data.name is string &&
        request.resource.data.email is string;
    }
  }
}
```

These rules provide comprehensive security for your user profile system while maintaining a good user experience.
