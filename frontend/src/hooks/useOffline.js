import { useState, useEffect } from 'react';

// Hook for detecting online/offline status
export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
};

// Hook for offline queue management
export const useOfflineQueue = () => {
  const [queue, setQueue] = useState([]);
  const isOffline = useOffline();

  // Add action to queue when offline
  const addToQueue = (action) => {
    if (isOffline) {
      setQueue(prev => [...prev, { ...action, id: Date.now() }]);
    }
  };

  // Process queue when back online
  useEffect(() => {
    if (!isOffline && queue.length > 0) {
      processQueue();
    }
  }, [isOffline, queue.length]);

  const processQueue = async () => {
    const actions = [...queue];
    setQueue([]);

    for (const action of actions) {
      try {
        await action.execute();
      } catch (error) {
        console.error('Failed to process queued action:', error);
        // Re-add failed actions to queue
        setQueue(prev => [...prev, action]);
      }
    }
  };

  return {
    queue,
    addToQueue,
    isOffline
  };
};

// Hook for offline data storage
export const useOfflineStorage = () => {
  const [storage, setStorage] = useState({});

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('offline-club-data');
      if (savedData) {
        setStorage(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }, []);

  // Save data to localStorage
  const saveData = (key, data) => {
    try {
      const newStorage = { ...storage, [key]: data };
      setStorage(newStorage);
      localStorage.setItem('offline-club-data', JSON.stringify(newStorage));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  };

  // Get data from storage
  const getData = (key) => {
    return storage[key];
  };

  // Clear all offline data
  const clearData = () => {
    setStorage({});
    localStorage.removeItem('offline-club-data');
  };

  return {
    saveData,
    getData,
    clearData,
    storage
  };
};
