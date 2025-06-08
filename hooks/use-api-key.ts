'use client';

import { useState, useEffect } from 'react';

// Define the hook to manage API key
export function useApiKey() {
  // Use localStorage to persist API key between sessions
  const [apiKey, setApiKey] = useState<string>('');
  // Load the API key from localStorage on initial render
  useEffect(() => {
    try {
      // Use a consistent key for storing API keys
      const storedApiKey = localStorage.getItem('userApiKey');
      if (storedApiKey) {
        setApiKey(storedApiKey);
      }
    } catch (error) {
      // This can happen in environments where localStorage is not available (SSR)
      console.error('Error loading API key:', error);
    }
  }, []);

  // Add event listener to sync API key across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userApiKey') {
        const newValue = event.newValue;
        if (newValue !== apiKey) {
          setApiKey(newValue || '');
        }
      }
    };

    // Add event listener
    window.addEventListener('storage', handleStorageChange);

    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [apiKey]);
  // Function to update the API key
  const updateApiKey = (newApiKey: string) => {
    setApiKey(newApiKey);

    // If the key is empty, remove it from localStorage
    if (!newApiKey) {
      localStorage.removeItem('userApiKey');
      return;
    }

    // Otherwise store it
    localStorage.setItem('userApiKey', newApiKey);
  };

  return {
    apiKey,
    updateApiKey,
    hasCustomApiKey: !!apiKey,
  };
}
