'use client';

import { useEffect } from 'react';
import { useApiKey } from './use-api-key';

// Global variable to store the API key
let globalApiKey: string | undefined;

// Component to sync API key from client-side to server
export function ApiKeySync() {
  const { apiKey } = useApiKey();
  
  useEffect(() => {
    // Store API key in global variable
    globalApiKey = apiKey;
  }, [apiKey]);
  
  return null;
}

// Function to get the current API key - usable in server components
export function getApiKey() {
  return globalApiKey;
}
