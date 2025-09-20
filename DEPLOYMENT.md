# Deployment Guide - Forsyth County Club Website

## Overview

This guide provides comprehensive instructions for deploying the Forsyth County Club Website to production with proper security, performance, and monitoring.

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- GitHub repository with CI/CD configured
- Environment variables configured

## Environment Setup

### 1. Firebase Configuration

Create a `.env` file in the project root:

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Environment
REACT_APP_ENVIRONMENT=production
REACT_APP_API_BASE_URL=https://your-api-domain.com

# Security
REACT_APP_ENABLE_DEBUG=false
REACT_APP_ENABLE_BYPASS_ROUTES=false
```

### 2. Firebase Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Clubs are readable by all authenticated users
    match /clubs/{clubId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.createdBy == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Events are readable by all authenticated users
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.createdBy == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Schools and categories are readable by all
    match /schools/{schoolId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Audit logs are admin-only
    match /audit_logs/{logId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 3. Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profilePics/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /clubImages/{clubId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.metadata.createdBy == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

## Data Migration

### 1. Migrate Club Data to Firestore

```bash
# Install dependencies
npm install

# Run migration script
npm run migrate:clubs

# Verify migration
npm run verify:migration
```

### 2. Create Firestore Indexes

Create the following composite indexes in Firebase Console:

**Clubs Collection:**
- `category` (Ascending), `school` (Ascending)
- `gradeLevels` (Ascending), `category` (Ascending)
- `isActive` (Ascending), `createdAt` (Descending)
- `viewCount` (Descending), `category` (Ascending)

**Events Collection:**
- `clubId` (Ascending), `startDate` (Ascending)
- `school` (Ascending), `startDate` (Ascending)

## Deployment Process

### 1. Automated Deployment (Recommended)

The CI/CD pipeline automatically deploys when code is pushed to the main branch:

```bash
# Push to main branch
git push origin main

# The GitHub Actions workflow will:
# 1. Run tests and linting
# 2. Build the application
# 3. Run security scans
# 4. Deploy to Firebase
# 5. Run post-deployment tests
```

### 2. Manual Deployment

```bash
# Install dependencies
npm install

# Run tests
npm run test:coverage

# Build for production
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy storage rules
firebase deploy --only storage
```

## Performance Optimization

### 1. Bundle Analysis

```bash
# Analyze bundle size
npm run analyze
```

### 2. Lighthouse Performance

```bash
# Run Lighthouse audit
npm run lighthouse

# Run Lighthouse CI
npm run lighthouse:ci
```

### 3. Service Worker

The service worker is automatically registered and provides:
- Offline functionality
- Background sync
- Caching strategies

## Monitoring and Maintenance

### 1. Error Tracking

- Errors are automatically logged to the console
- In production, integrate with Sentry or similar service
- Monitor Firebase Analytics for user behavior

### 2. Performance Monitoring

- Firebase Performance Monitoring
- Lighthouse CI reports
- Core Web Vitals tracking

### 3. Security Monitoring

- Regular security audits
- Firebase Security Rules testing
- Dependency vulnerability scanning

## Rollback Procedures

### 1. Automatic Rollback

If deployment fails, the CI/CD pipeline will automatically rollback to the previous version.

### 2. Manual Rollback

```bash
# Rollback to previous version
firebase hosting:channel:deploy live --only hosting

# Rollback to specific version
firebase hosting:channel:deploy live --only hosting --target <version>
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Firebase Connection Issues**
   - Verify Firebase configuration
   - Check security rules
   - Ensure proper authentication

3. **Performance Issues**
   - Run bundle analysis
   - Check for memory leaks
   - Optimize images and assets

### Support

For deployment issues:
1. Check the GitHub Actions logs
2. Review Firebase console for errors
3. Check browser console for client-side errors
4. Contact the development team

## Security Checklist

- [ ] Environment variables are properly configured
- [ ] Firebase security rules are implemented
- [ ] HTTPS is enforced
- [ ] Authentication is required for protected routes
- [ ] Admin routes are properly secured
- [ ] API keys are not exposed in client code
- [ ] Regular security audits are performed
- [ ] Dependencies are up to date
- [ ] Error handling doesn't expose sensitive information

## Performance Checklist

- [ ] Bundle size is optimized
- [ ] Images are compressed and optimized
- [ ] Service worker is working
- [ ] Lighthouse scores are >90
- [ ] Core Web Vitals are within acceptable ranges
- [ ] Caching strategies are implemented
- [ ] Database queries are optimized
- [ ] Lazy loading is implemented

## Accessibility Checklist

- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets standards
- [ ] Alt text for all images
- [ ] ARIA labels are properly implemented
- [ ] Focus management is correct
- [ ] Error messages are accessible
