import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY
  const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    const aqiData = {
      pm25: data.list[0].components.pm2_5,
      so2: data.list[0].components.so2,
      no2: data.list[0].components.no2,
      o3: data.list[0].components.o3,
    }

    return NextResponse.json(aqiData)
  } catch (error) {
    console.error('Error fetching AQI data:', error)
    return NextResponse.json({ error: 'Failed to fetch AQI data' }, { status: 500 })
  }
}

