'use client'

import { useState, useEffect } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'
import Map from '@/components/Map'
import SearchPanel from '@/components/SearchPanel'
import WeatherInfo from '@/components/WeatherInfo'
import SoilInfo from '@/components/SoilInfo'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function Home() {
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({ lat: 0, lng: 0 })
  const [weatherData, setWeatherData] = useState(null)
  const [aqiData, setAqiData] = useState(null)
  const [forecastData, setForecastData] = useState(null)
  const [soilData, setSoilData] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [chatResponse, setChatResponse] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
  })

  const handleSearch = async (lat: number, lng: number) => {
    setCenter({ lat, lng })
    await fetchAllData(lat, lng)
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
    setError(null);
    setWeatherData(null);
    setAqiData(null);
    setForecastData(null);
    setSoilData(null);
    setChatResponse('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/combined?lat=${lat}&lon=${lng}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
    
      const data = await response.json();
      setWeatherData(data.weather);
      setAqiData(data.aqi);
      setForecastData(data.forecast);
      setSoilData(data.soil);

      if (data.partialSuccess && (!data.weather || !data.aqi || !data.forecast || !data.soil)) {
        setError('Some data could not be loaded, but showing available information');
      }

      if (data.weather || data.soil) {
        const chatResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: `Given this agricultural data: 
                Weather: ${JSON.stringify(data.weather)}
                Air Quality: ${JSON.stringify(data.aqi)}
                Forecast: ${JSON.stringify(data.forecast)}
                Soil: ${JSON.stringify(data.soil)}
                Location: ${selectedLocation}
                What crops would be suitable to grow in this location? Note that some data might be missing.`
            }],
            environmentData: data
          })
        });

        if (!chatResponse.ok) {
          throw new Error('Failed to fetch chat response');
        }

        const chatData = await chatResponse.json();
        setChatResponse(chatData.text);
      }

      console.log('Combined API Data:', { ...data, location: { lat, lng } });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Weather and Soil Map</h1>
      <SearchPanel onSearch={handleSearch} isLoaded={isLoaded} selectedLocation={selectedLocation} />
      <Map center={center} zoom={8} onMapClick={handleMapClick} />
      {error && (
        <Alert variant={error.includes('Some data') ? "warning" : "destructive"} className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{error.includes('Some data') ? 'Warning' : 'Error'}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <WeatherInfo weatherData={weatherData} aqiData={aqiData} forecastData={forecastData} />
      <SoilInfo soilData={soilData} />
      {isLoading ? (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Loading Crop Recommendations...</h2>
        </div>
      ) : chatResponse && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Crop Recommendations</h2>
          <ReactMarkdown className="prose max-w-none">{chatResponse}</ReactMarkdown>
        </div>
      )}
    </main>
  )
}

``