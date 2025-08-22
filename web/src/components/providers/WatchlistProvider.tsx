'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type WatchlistItem = { id: string; updatedAt: string };

type WatchlistContextType = {
  watchlist: Set<string>;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  sync: () => Promise<void>;
};

const WatchlistContext = createContext<WatchlistContextType | undefined>(
  undefined
);

export const WatchlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const lastSyncRef = useRef<string>('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('watchlist');
      const updatedAt = localStorage.getItem('watchlistUpdatedAt');
      if (raw) setWatchlist(new Set(JSON.parse(raw)));
      if (updatedAt) lastSyncRef.current = updatedAt;
    } catch {}
    // attempt initial sync
    void sync();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('watchlist', JSON.stringify(Array.from(watchlist)));
      localStorage.setItem('watchlistUpdatedAt', new Date().toISOString());
    } catch {}
  }, [watchlist]);

  const sync = async () => {
    try {
      const items: WatchlistItem[] = Array.from(watchlist).map(id => ({
        id,
        updatedAt: new Date().toISOString(),
      }));
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/watchlist/sync`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            items,
            updatedAt: lastSyncRef.current || new Date(0).toISOString(),
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const serverItems: WatchlistItem[] =
          data?.data?.items || data?.items || [];
        lastSyncRef.current =
          data?.data?.updatedAt || data?.updatedAt || new Date().toISOString();
        setWatchlist(new Set(serverItems.map(i => i.id)));
        localStorage.setItem(
          'watchlist',
          JSON.stringify(serverItems.map(i => i.id))
        );
        localStorage.setItem('watchlistUpdatedAt', lastSyncRef.current);
      }
    } catch {}
  };

  const value = useMemo<WatchlistContextType>(
    () => ({
      watchlist,
      toggle: (id: string) =>
        setWatchlist(prev => {
          const next = new Set(prev);
          next.has(id) ? next.delete(id) : next.add(id);
          return next;
        }),
      has: (id: string) => watchlist.has(id),
      sync,
    }),
    [watchlist]
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const ctx = useContext(WatchlistContext);
  if (!ctx)
    throw new Error('useWatchlist must be used within WatchlistProvider');
  return ctx;
};
