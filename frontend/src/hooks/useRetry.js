import { useState, useCallback } from 'react';

// Custom hook for retry logic
export const useRetry = (maxRetries = 3, delay = 1000) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async (fn, ...args) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);
        setIsRetrying(attempt > 0);
        
        const result = await fn(...args);
        
        // Reset retry state on success
        setRetryCount(0);
        setIsRetrying(false);
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          setRetryCount(0);
          setIsRetrying(false);
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
    
    throw lastError;
  }, [maxRetries, delay]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    retryCount,
    isRetrying,
    reset
  };
};

// Hook for exponential backoff retry
export const useExponentialBackoff = (maxRetries = 3, baseDelay = 1000) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async (fn, ...args) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);
        setIsRetrying(attempt > 0);
        
        const result = await fn(...args);
        
        // Reset retry state on success
        setRetryCount(0);
        setIsRetrying(false);
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          setRetryCount(0);
          setIsRetrying(false);
          throw error;
        }
        
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }, [maxRetries, baseDelay]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    retryCount,
    isRetrying,
    reset
  };
};

// Hook for retry with different strategies
export const useRetryStrategy = (strategy = 'exponential') => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const getDelay = useCallback((attempt, baseDelay = 1000) => {
    switch (strategy) {
      case 'linear':
        return baseDelay * (attempt + 1);
      case 'exponential':
        return baseDelay * Math.pow(2, attempt);
      case 'fixed':
        return baseDelay;
      default:
        return baseDelay * Math.pow(2, attempt);
    }
  }, [strategy]);

  const retry = useCallback(async (fn, ...args) => {
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);
        setIsRetrying(attempt > 0);
        
        const result = await fn(...args);
        
        // Reset retry state on success
        setRetryCount(0);
        setIsRetrying(false);
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          setRetryCount(0);
          setIsRetrying(false);
          throw error;
        }
        
        // Wait before retrying
        const delay = getDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }, [getDelay]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    retryCount,
    isRetrying,
    reset
  };
};
