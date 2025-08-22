'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// ===== INTERFACES =====
interface WatchlistContextType {
  watchlist: string[];
  has: (eventId: string) => boolean;
  add: (eventId: string) => void;
  remove: (eventId: string) => void;
  toggle: (eventId: string) => void;
  clear: () => void;
}

// ===== CONTEXTO =====
const WatchlistContext = createContext<WatchlistContextType | null>(null);

// ===== PROVIDER =====
export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Cargar watchlist del localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem('eventconnect_watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading watchlist:', error);
      }
    }
  }, []);

  // Guardar watchlist en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('eventconnect_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const has = (eventId: string): boolean => {
    return watchlist.includes(eventId);
  };

  const add = (eventId: string): void => {
    setWatchlist(prev => prev.includes(eventId) ? prev : [...prev, eventId]);
  };

  const remove = (eventId: string): void => {
    setWatchlist(prev => prev.filter(id => id !== eventId));
  };

  const toggle = (eventId: string): void => {
    if (has(eventId)) {
      remove(eventId);
    } else {
      add(eventId);
    }
  };

  const clear = (): void => {
    setWatchlist([]);
  };

  const value: WatchlistContextType = {
    watchlist,
    has,
    add,
    remove,
    toggle,
    clear
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};

// ===== HOOK =====
export const useWatchlist = (): WatchlistContextType => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist debe usarse dentro de WatchlistProvider');
  }
  return context;
};

