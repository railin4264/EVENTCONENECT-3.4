'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Radar, MapPin, Users, Calendar, Star, Filter, Search, Plus } from 'lucide-react'
import { EventRadar } from '@/components/EventRadar'
import { EventCard } from '@/components/EventCard'
import { TribeCard } from '@/components/TribeCard'
import { FilterPanel } from '@/components/FilterPanel'
import { SearchBar } from '@/components/SearchBar'
import { useEvents } from '@/hooks/useEvents'
import { useTribes } from '@/hooks/useTribes'
import { useLocation } from '@/hooks/useLocation'

export default function HomePage() {
  const [view, setView] = useState<'radar' | 'list'>('radar')
  const [filters, setFilters] = useState({
    category: 'all',
    distance: 10,
    popularity: 'all'
  })
  const [searchQuery, setSearchQuery] = useState('')
  
  const { userLocation } = useLocation()
  const { events, isLoading: eventsLoading } = useEvents(userLocation, filters)
  const { tribes, isLoading: tribesLoading } = useTribes(userLocation, filters)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Section */}
      <motion.header 
        className="container-responsive py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center space-y-4">
          <motion.h1 
            className="text-4xl md:text-6xl font-display font-bold bg-gradient-to-r from-primary via-tribe-500 to-pulse-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            EventConnect AI
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Descubre eventos, actividades y comunidades cercanas con recomendaciones inteligentes
          </motion.p>
          
          {/* View Toggle */}
          <motion.div 
            className="flex justify-center space-x-2 bg-muted/50 rounded-full p-1 max-w-xs mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <button
              onClick={() => setView('radar')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                view === 'radar' 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Radar className="w-4 h-4 inline mr-2" />
              Radar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                view === 'list' 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Lista
            </button>
          </motion.div>
        </div>
      </motion.header>

      {/* Search and Filters */}
      <motion.section 
        className="container-responsive mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar eventos, tribus o actividades..."
            className="flex-1 max-w-md"
          />
          <FilterPanel 
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      </motion.section>

      {/* Main Content */}
      <main className="container-responsive pb-16">
        {view === 'radar' ? (
          /* Radar View - Interactive Map */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <EventRadar 
                events={events}
                tribes={tribes}
                userLocation={userLocation}
                isLoading={eventsLoading || tribesLoading}
              />
            </motion.div>
            
            {/* Quick Stats */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">{events?.length || 0}</h3>
                <p className="text-muted-foreground">Eventos Cercanos</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Users className="w-8 h-8 text-tribe-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">{tribes?.length || 0}</h3>
                <p className="text-muted-foreground">Tribus Activas</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <MapPin className="w-8 h-8 text-pulse-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">
                  {userLocation ? `${filters.distance}km` : '--'}
                </h3>
                <p className="text-muted-foreground">Radio de Búsqueda</p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* List View - Grid Layout */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {/* Events Section */}
            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-display font-bold text-foreground">
                  Eventos Cercanos
                </h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4" />
                  <span>Recomendados por IA</span>
                </div>
              </div>
              
              {eventsLoading ? (
                <div className="events-grid">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="event-card animate-pulse">
                      <div className="h-48 bg-muted rounded-lg mb-4" />
                      <div className="h-4 bg-muted rounded mb-2" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : events?.length > 0 ? (
                <div className="events-grid">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-muted-foreground mb-2">
                    No hay eventos cercanos
                  </h3>
                  <p className="text-muted-foreground">
                    Intenta ajustar los filtros o expandir el radio de búsqueda
                  </p>
                </div>
              )}
            </motion.section>

            {/* Tribes Section */}
            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-display font-bold text-foreground">
                  Tribus y Comunidades
                </h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Conecta con personas afines</span>
                </div>
              </div>
              
              {tribesLoading ? (
                <div className="tribes-grid">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="tribe-card animate-pulse">
                      <div className="h-32 bg-muted rounded-lg mb-4" />
                      <div className="h-5 bg-muted rounded mb-2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : tribes?.length > 0 ? (
                <div className="tribes-grid">
                  {tribes.map((tribe) => (
                    <TribeCard key={tribe.id} tribe={tribe} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-muted-foreground mb-2">
                    No hay tribus cercanas
                  </h3>
                  <p className="text-muted-foreground">
                    ¡Sé el primero en crear una tribu en tu área!
                  </p>
                </div>
              )}
            </motion.section>
          </motion.div>
        )}
      </main>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  )
}
