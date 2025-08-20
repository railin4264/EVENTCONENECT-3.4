'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MapPin, Calendar, Users, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Buscar...", 
  className,
  onSearch 
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Mock suggestions - in real app, these would come from API
  const suggestions = [
    { type: 'event', text: 'Concierto de rock', icon: Calendar, category: 'Música' },
    { type: 'event', text: 'Clase de yoga', icon: Calendar, category: 'Bienestar' },
    { type: 'tribe', text: 'Amantes del café', icon: Users, category: 'Social' },
    { type: 'event', text: 'Exposición de arte', icon: Calendar, category: 'Arte' },
    { type: 'tribe', text: 'Desarrolladores web', icon: Users, category: 'Tecnología' },
    { type: 'trending', text: 'Eventos populares', icon: TrendingUp, category: 'Tendencia' },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setShowSuggestions(newValue.length > 0)
  }

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    onChange(suggestion.text)
    setShowSuggestions(false)
    onSearch?.(suggestion.text)
    inputRef.current?.blur()
  }

  const handleClear = () => {
    onChange('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSearch?.(value.trim())
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.text.toLowerCase().includes(value.toLowerCase())
  )

  return (
    <div className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={cn(
              "w-full pl-10 pr-10 py-3 bg-background border border-border rounded-lg",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "transition-all duration-200",
              "placeholder:text-muted-foreground",
              isFocused && "ring-2 ring-primary border-transparent"
            )}
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            <div className="p-2">
              {filteredSuggestions.map((suggestion, index) => {
                const Icon = suggestion.icon
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center space-x-3 p-3 rounded-md hover:bg-accent transition-colors text-left"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      suggestion.type === 'event' && "bg-event-100 text-event-600",
                      suggestion.type === 'tribe' && "bg-tribe-100 text-tribe-600",
                      suggestion.type === 'trending' && "bg-pulse-100 text-pulse-600"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {suggestion.text}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {suggestion.category}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Categories */}
      {!value && isFocused && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50"
        >
          <div className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Categorías populares
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Calendar, label: 'Eventos', color: 'event' },
                { icon: Users, label: 'Tribus', color: 'tribe' },
                { icon: MapPin, label: 'Cerca de ti', color: 'primary' },
                { icon: TrendingUp, label: 'Tendencias', color: 'pulse' },
              ].map((category, index) => {
                const Icon = category.icon
                return (
                  <button
                    key={index}
                    onClick={() => onChange(category.label)}
                    className={cn(
                      "flex items-center space-x-2 p-3 rounded-md hover:bg-accent transition-colors",
                      `hover:bg-${category.color}-50`
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4",
                      `text-${category.color}-500`
                    )} />
                    <span className="text-sm text-foreground">{category.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
