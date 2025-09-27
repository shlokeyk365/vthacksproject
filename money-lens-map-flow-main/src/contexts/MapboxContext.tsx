import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MapboxContextType {
  mapboxToken: string | null;
  setMapboxToken: (token: string) => void;
  isMapboxConfigured: boolean;
  isLoading: boolean;
  error: string | null;
}

const MapboxContext = createContext<MapboxContextType | undefined>(undefined);

interface MapboxProviderProps {
  children: ReactNode;
}

export function MapboxProvider({ children }: MapboxProviderProps) {
  const [mapboxToken, setMapboxTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Mapbox token from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('mapbox_token');
      if (savedToken) {
        setMapboxTokenState(savedToken);
      } else {
        // Set default token if none is saved
        const defaultToken = 'pk.eyJ1Ijoic2hsb2tleWsiLCJhIjoiY21nMXV0dzMzMHNnNjJscHRjeWtramV0dSJ9.G_oGQ6qXclMTJz3T-BacPg';
        setMapboxTokenState(defaultToken);
        localStorage.setItem('mapbox_token', defaultToken);
      }
    } catch (err) {
      setError('Failed to load Mapbox configuration');
      console.error('Error loading Mapbox token:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setMapboxToken = (token: string) => {
    try {
      // Validate token format (basic validation)
      if (!token || token.length < 10) {
        throw new Error('Invalid Mapbox token format');
      }

      // Save to localStorage
      localStorage.setItem('mapbox_token', token);
      setMapboxTokenState(token);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save Mapbox token');
      console.error('Error saving Mapbox token:', err);
    }
  };

  const isMapboxConfigured = Boolean(mapboxToken);

  return (
    <MapboxContext.Provider
      value={{
        mapboxToken,
        setMapboxToken,
        isMapboxConfigured,
        isLoading,
        error,
      }}
    >
      {children}
    </MapboxContext.Provider>
  );
}

export function useMapbox() {
  const context = useContext(MapboxContext);
  if (context === undefined) {
    throw new Error('useMapbox must be used within a MapboxProvider');
  }
  return context;
}
