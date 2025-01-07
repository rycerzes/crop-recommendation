'use client'

import { useState } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'
import Map from '@/components/Map'
import SearchPanel from '@/components/SearchPanel'
import WeatherInfo from '@/components/WeatherInfo'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

export default function Home() {
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({ lat: 0, lng: 0 })
  const [weatherData, setWeatherData] = useState(null)
  const [aqiData, setAqiData] = useState(null)
  const [forecastData, setForecastData] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
  })

  const handleSearch = async (lat: number, lng: number) => {
    setCenter({ lat, lng })
    await fetchAllData(lat, lng)
    // Update selected location using reverse geocoding
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        setSelectedLocation(results[0].formatted_address)
      }
    })
  }

  const handleMapClick = async (lat: number, lng: number, name: string) => {
    setCenter({ lat, lng })
    setSelectedLocation(name)
    await fetchAllData(lat, lng)
  }

  const fetchAllData = async (lat: number, lng: number) => {
    setError(null)
    try {
      const [weatherResponse, aqiResponse, forecastResponse] = await Promise.all([
        fetch(`/api/weather?lat=${lat}&lon=${lng}`),
        fetch(`/api/aqi?lat=${lat}&lon=${lng}`),
        fetch(`/api/forecast?lat=${lat}&lon=${lng}`)
      ])

      if (!weatherResponse.ok) throw new Error('Failed to fetch weather data')
      if (!aqiResponse.ok) throw new Error('Failed to fetch AQI data')
      if (!forecastResponse.ok) throw new Error('Failed to fetch forecast data')

      const weatherData = await weatherResponse.json()
      const aqiData = await aqiResponse.json()
      const forecastData = await forecastResponse.json()

      setWeatherData(weatherData)
      setAqiData(aqiData)
      setForecastData(forecastData)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch weather data. Please try again.')
      setWeatherData(null)
      setAqiData(null)
      setForecastData(null)
    }
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Weather Map</h1>
      <SearchPanel onSearch={handleSearch} isLoaded={isLoaded} selectedLocation={selectedLocation} />
      <Map center={center} zoom={8} onMapClick={handleMapClick} />
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <WeatherInfo weatherData={weatherData} aqiData={aqiData} forecastData={forecastData} />
    </main>
  )
}

