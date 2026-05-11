// src/hooks/useLocalStorage.ts
// A simple hook: works like useState but saves to localStorage automatically.

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    // On first render, try to load from localStorage
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  // Whenever value changes, save it to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage can fail if storage is full — fail silently
    }
  }, [key, value]);

  return [value, setValue] as const;
}