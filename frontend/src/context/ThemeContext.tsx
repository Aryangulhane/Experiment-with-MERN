// src/context/ThemeContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the structure for a theme mode. It's now much simpler.
type Theme = {
  mode: 'light' | 'dark';
};

type ThemeContextType = {
  theme: Theme;
  setTheme: (mode: Theme['mode']) => void;
  isTransitioning: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// No color math here anymore — colors are defined in CSS (globals.css)
// We only toggle between 'light' and 'dark' by setting data-theme on <html>.

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage or prefers-color-scheme
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return { mode: 'dark' };
    const saved = (window.localStorage.getItem('theme') as Theme['mode']) || null;
    if (saved === 'light' || saved === 'dark') return { mode: saved };
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return { mode: prefersDark ? 'dark' : 'light' };
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Keep in sync if system theme changes and user hasn't chosen explicitly
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const saved = window.localStorage.getItem('theme') as Theme['mode'] | null;
      if (!saved) setThemeState({ mode: mq.matches ? 'dark' : 'light' });
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Theme switching logic with smooth transitions
  const setTheme = (mode: Theme['mode']) => {
    if (theme.mode === mode || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setThemeState({ mode });
      window.localStorage.setItem('theme', mode);
      setTimeout(() => setIsTransitioning(false), 400); // Match CSS transition
    }, 400);
  };

  // Apply theme to <html> via data-theme and transition flag
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.mode);
    root.setAttribute('data-transitioning', isTransitioning ? 'true' : 'false');

    // Optionally update the browser theme-color meta for nicer mobile chrome UI
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const cs = getComputedStyle(document.documentElement);
      meta.setAttribute('content', cs.getPropertyValue('--background').trim() || '#000');
    }
  }, [theme, isTransitioning]);

  const value = { theme, setTheme, isTransitioning };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}