import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY
  if (!apiKey) {
    console.error('OPENWEATHERMAP_API_KEY is not set')
    return NextResponse.json({ error: 'API key is missing' }, { status: 500 })
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    const forecastData = {
      hourly: data.list.slice(0, 5).map((item: any) => ({
        time: new Date(item.dt * 1000).toISOString(),
        temperature: item.main.temp,
        icon: item.weather[0].icon,
      })),
      daily: data.list.filter((item: any, index: number) => index % 8 === 0).slice(0, 5).map((item: any) => ({
        date: new Date(item.dt * 1000).toISOString(),
        minTemp: item.main.temp_min,
        maxTemp: item.main.temp_max,
        icon: item.weather[0].icon,
      })),
    }

    return NextResponse.json(forecastData)
  } catch (error) {
    console.error('Error fetching forecast data:', error)
    return NextResponse.json({ error: 'Failed to fetch forecast data' }, { status: 500 })
  }
}

