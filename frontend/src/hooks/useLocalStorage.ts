// src/hooks/useLocalStorage.ts

import { useState, useEffect } from 'react';

/**
 * A hook that persists state in localStorage
 * @param key The key to store the value under in localStorage
 * @param initialValue The initial value if no value is found in localStorage
 * @returns A tuple containing the stored value and a setter function
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      
      if (item === null) {
        return initialValue;
      }

      try {
        // Parse stored JSON
        const parsed = JSON.parse(item);
        
        // Handle FileSystemDirectoryHandle specially
        if (parsed && parsed.handle && parsed.handle.kind === 'directory') {
          return {
            ...parsed,
            handle: parsed.handle
          };
        }
        
        return parsed;
      } catch {
        // If JSON parsing fails, return initial value
        return initialValue;
      }
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (valueToStore === null) {
        window.localStorage.removeItem(key);
      } else {
        // Convert FileSystemDirectoryHandle to a serializable format
        const serializedValue = JSON.stringify(valueToStore, (key, value) => {
          if (value && typeof value === 'object' && 'kind' in value) {
            // For FileSystemDirectoryHandle objects
            return {
              ...value,
              kind: value.kind,
            };
          }
          return value;
        });
        
        window.localStorage.setItem(key, serializedValue);
      }
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  };

  // Subscribe to changes across windows/tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Error parsing storage change for key "${key}":`, error);
        }
      } else if (e.key === key) {
        // If newValue is null, the key was removed
        setStoredValue(initialValue);
      }
    };

    // Listen for storage changes across windows/tabs
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue] as const;
}