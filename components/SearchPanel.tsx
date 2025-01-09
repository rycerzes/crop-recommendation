import { useState, useRef, useEffect } from 'react'
import { Autocomplete } from '@react-google-maps/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchPanelProps {
  onSearch: (lat: number, lng: number) => void
  isLoaded: boolean
  selectedLocation: string
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, isLoaded, selectedLocation }) => {
  const [query, setQuery] = useState('')
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    if (selectedLocation) {
      setQuery(selectedLocation)
    }
  }, [selectedLocation])

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace()
    if (place && place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      onSearch(lat, lng)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query) {
      // Use Geocoding service to get coordinates from the query
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ address: query }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const lat = results[0].geometry.location.lat()
          const lng = results[0].geometry.location.lng()
          onSearch(lat, lng)
        } else {
          console.error('Geocode was not successful for the following reason: ' + status)
          // You might want to show an error message to the user here
        }
      })
    }
  }

  if (!isLoaded) return <div>Loading...</div>

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={handlePlaceChanged}
      >
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a location"
          className="flex-grow"
        />
      </Autocomplete>
      <Button type="submit">Search</Button>
    </form>
  )
}

export default SearchPanel

