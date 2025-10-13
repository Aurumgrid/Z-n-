"use client";

import { useState, useEffect } from 'react';

// This is a simple mock authentication hook.
// In a real application, this would involve more robust token validation
// and likely a shared authentication context.

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for a token in localStorage to determine auth state.
    // The key 'authToken' is assumed for this implementation.
    // In a real app, this key should be consistent with your login logic.
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);

    // Optional: Listen for storage changes to update auth state across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'authToken') {
        setIsAuthenticated(!!event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { isAuthenticated };
}