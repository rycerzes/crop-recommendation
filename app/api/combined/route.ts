import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lon')

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    )
  }

  try {
    const results = await Promise.allSettled([
      fetch(`${process.env.BASE_URL}/api/weather?lat=${lat}&lon=${lng}`),
      fetch(`${process.env.BASE_URL}/api/aqi?lat=${lat}&lon=${lng}`),
      fetch(`${process.env.BASE_URL}/api/forecast?lat=${lat}&lon=${lng}`),
      fetch(`${process.env.BASE_URL}/api/soil?lat=${lat}&lon=${lng}`)
    ]);

    const [weatherRes, aqiRes, forecastRes, soilRes] = await Promise.all(
      results.map(async (result) => {
        if (result.status === 'fulfilled' && result.value.ok) {
          return result.value.json();
        }
        return null;
      })
    );

    const response = {
      weather: weatherRes,
      aqi: aqiRes,
      forecast: forecastRes,
      soil: soilRes,
      partialSuccess: true
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in combined API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
