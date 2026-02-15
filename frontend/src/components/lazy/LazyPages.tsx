import React, { Suspense, lazy } from 'react';

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-300">Loading...</p>
    </div>
  </div>
);

// Lazy load all page components
const LazyClubsWebsite = lazy(() => import('../../pages/ClubsWebsite'));
const LazyLogin = lazy(() => import('../../pages/Login'));
const LazyCompare = lazy(() => import('../../pages/Compare'));
const LazyEvents = lazy(() => import('../../pages/Events'));
const LazyCreateAccount = lazy(() => import('../../pages/CreateAccount'));
const LazyAbout = lazy(() => import('../../pages/About'));
const LazyProfile = lazy(() => import('../../pages/Profile'));
const LazyCalendar = lazy(() => import('../../pages/Calendar'));
const LazyClubQuiz = lazy(() => import('../../pages/ClubQuiz'));
const LazyProfileSetup = lazy(() => import('../../pages/ProfileSetup'));
const LazyParentVerify = lazy(() => import('../../pages/ParentVerify'));

// Wrapped components with Suspense
export const ClubsWebsite = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyClubsWebsite {...props} />
  </Suspense>
);

export const Login = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyLogin {...props} />
  </Suspense>
);

export const Compare = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyCompare {...props} />
  </Suspense>
);

export const Events = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyEvents {...props} />
  </Suspense>
);

export const CreateAccount = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyCreateAccount {...props} />
  </Suspense>
);

export const About = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyAbout {...props} />
  </Suspense>
);

export const Profile = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyProfile {...props} />
  </Suspense>
);

export const Calendar = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyCalendar {...props} />
  </Suspense>
);

export const ClubQuiz = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyClubQuiz {...props} />
  </Suspense>
);

export const ProfileSetup = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyProfileSetup {...props} />
  </Suspense>
);

export const ParentVerify = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyParentVerify {...props} />
  </Suspense>
);
