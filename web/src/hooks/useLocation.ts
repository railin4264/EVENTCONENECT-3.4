'use client'

import { useState, useEffect, useCallback } from 'react'
import { Location } from '@/types'

interface UseLocationReturn {
  userLocation: Location | null
  isLoading: boolean
  error: string | null
  requestLocation: () => Promise<void>
  updateLocation: (location: Location) => void
}

export function useLocation(): UseLocationReturn {
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Try to get location from localStorage first
  useEffect(() => {
    const savedLocation = localStorage.getItem('eventconnect_user_location')
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation)
        setUserLocation(parsed)
      } catch (err) {
        console.error('Error parsing saved location:', err)
        localStorage.removeItem('eventconnect_user_location')
      }
    }
  }, [])

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no está soportada en este navegador')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5 * 60 * 1000 // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords
      
      // Get address from coordinates using reverse geocoding
      const address = await getAddressFromCoordinates(latitude, longitude)
      
      const location: Location = {
        latitude,
        longitude,
        address,
        city: 'Ciudad de México', // Default, will be updated with real data
        country: 'México',
        postalCode: ''
      }

      setUserLocation(location)
      localStorage.setItem('eventconnect_user_location', JSON.stringify(location))
    } catch (err) {
      console.error('Error getting location:', err)
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Permiso de ubicación denegado. Por favor, habilita la ubicación en tu navegador.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Información de ubicación no disponible.')
            break
          case err.TIMEOUT:
            setError('Tiempo de espera agotado al obtener la ubicación.')
            break
          default:
            setError('Error desconocido al obtener la ubicación.')
        }
      } else {
        setError('Error al obtener la ubicación.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateLocation = useCallback((location: Location) => {
    setUserLocation(location)
    localStorage.setItem('eventconnect_user_location', JSON.stringify(location))
  }, [])

  // Auto-request location on mount if not available
  useEffect(() => {
    if (!userLocation && !isLoading && !error) {
      requestLocation()
    }
  }, [userLocation, isLoading, error, requestLocation])

  return {
    userLocation,
    isLoading,
    error,
    requestLocation,
    updateLocation
  }
}

// Helper function to get address from coordinates
async function getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
  try {
    // You can integrate with Google Maps Geocoding API or similar service here
    // For now, return a formatted coordinate string
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  } catch (error) {
    console.error('Error getting address:', error)
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  }
}

// Hook for watching location changes
export function useLocationWatch() {
  const [location, setLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalización no está soportada')
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({
          latitude,
          longitude,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          city: 'Ciudad de México',
          country: 'México',
          postalCode: ''
        })
      },
      (err) => {
        console.error('Error watching location:', err)
        setError('Error al monitorear la ubicación')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  return { location, error }
}

// Hook for calculating distance between two locations
export function useDistance() {
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }, [])

  const isWithinRadius = useCallback((
    userLat: number, 
    userLon: number, 
    targetLat: number, 
    targetLon: number, 
    radiusKm: number
  ): boolean => {
    const distance = calculateDistance(userLat, userLon, targetLat, targetLon)
    return distance <= radiusKm
  }, [calculateDistance])

  return { calculateDistance, isWithinRadius }
}
