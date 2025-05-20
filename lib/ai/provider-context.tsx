'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createProvider } from './providers.client';
import { useApiKey } from '@/hooks/use-api-key';

// Define the context type
interface ProviderContextType {
  provider: ReturnType<typeof createProvider>;
}

// Create the context
const ProviderContext = createContext<ProviderContextType | null>(null);

// Create a provider component
export function ProviderContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { apiKey } = useApiKey();
  const [provider, setProvider] = useState(() => createProvider());

  // Update provider when API key changes
  useEffect(() => {
    setProvider(createProvider(apiKey || undefined));
  }, [apiKey]);

  return (
    <ProviderContext.Provider value={{ provider }}>
      {children}
    </ProviderContext.Provider>
  );
}

// Create a hook to use the provider context
export function useProviderContext() {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error(
      'useProviderContext must be used within a ProviderContextProvider',
    );
  }
  return context;
}
