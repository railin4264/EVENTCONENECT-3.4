'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import EventCard from '@/components/events/EventCard'
import { useWatchlist } from '@/components/providers/WatchlistProvider'
import { eventsAPI } from '@/services/api'

export default function SavedPage() {
  const { watchlist } = useWatchlist()
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data: any = await eventsAPI.getAll()
        const list = (data && (data.events || data)) || []
        setEvents(Array.isArray(list) ? list : [])
      } catch {
        setEvents([])
      }
    }
    fetchAll()
  }, [])

  const savedEvents = useMemo(() => {
    return events.filter(e => watchlist.has(e.id))
  }, [events, watchlist])

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Guardados</h1>
        <Link href="/events" className="text-primary-600 hover:underline">Volver a eventos</Link>
      </div>
      {savedEvents.length === 0 ? (
        <div className="text-gray-600">No tienes eventos guardados todavía.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedEvents.map(ev => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      )}
    </section>
  )
}

