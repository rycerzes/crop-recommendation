import { useCallback, useRef } from 'react'
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'

interface MapProps {
  center: google.maps.LatLngLiteral
  zoom: number
  onMapClick: (lat: number, lng: number, name: string) => void
}

const Map: React.FC<MapProps> = ({ center, zoom, onMapClick }) => {
  const mapRef = useRef<google.maps.Map | null>(null)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const onUnmount = useCallback(() => {
    mapRef.current = null
  }, [])

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      const geocoder = new google.maps.Geocoder()
      
      try {
        const result = await geocoder.geocode({ location: { lat, lng } })
        if (result.results[0]) {
          const name = result.results[0].formatted_address
          onMapClick(lat, lng, name)
        }
      } catch (error) {
        console.error('Error geocoding clicked location:', error)
        onMapClick(lat, lng, 'Unknown location')
      }
    }
  }

  if (!isLoaded) return <div>Loading...</div>

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '400px' }}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
    />
  )
}

export default Map

