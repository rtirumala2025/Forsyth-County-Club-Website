import React from 'react';
import ErrorBoundary from './ErrorBoundary';

// Global error boundary for the entire application
const GlobalErrorBoundary = ({ children }) => {
  const handleError = (error, errorInfo) => {
    // Log error to external service
    console.error('Global error caught:', error, errorInfo);
    
    // You could send to Sentry, LogRocket, or other error tracking services here
    // Example:
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack
    //     }
    //   }
    // });
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default GlobalErrorBoundary;
