'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type WatchlistContextType = {
  watchlist: Set<string>
  toggle: (id: string) => void
  has: (id: string) => boolean
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

export const WatchlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem('watchlist')
      if (raw) setWatchlist(new Set(JSON.parse(raw)))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('watchlist', JSON.stringify(Array.from(watchlist)))
    } catch {}
  }, [watchlist])

  const value = useMemo<WatchlistContextType>(() => ({
    watchlist,
    toggle: (id: string) => setWatchlist(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    }),
    has: (id: string) => watchlist.has(id)
  }), [watchlist])

  return (
    <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
  )
}

export const useWatchlist = () => {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider')
  return ctx
}

