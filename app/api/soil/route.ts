import { NextResponse } from 'next/server'

interface SoilProperty {
  mean: number;
}

interface SoilData {
  properties: {
    layers: {
      name: string;
      depths: {
        values: {
          mean: number;
        };
      }[];
    }[];
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
  }

  // Define all properties to fetch
  const properties = [
    'nitrogen',
    'phh2o',
    'bdod',
    'clay',
    'sand',
    'silt',
    'soc',
    'cec',
    'wv0033',
    'wv1500',
  ];

  // Construct the URL with all properties
  const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lat=${lat}&lon=${lon}&property=${properties.join('&property=')}&depth=0-5cm&value=mean`

  try {
    console.log(`Fetching soil data from: ${url}`)
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error(`SoilGrids API responded with status: ${response.status}`)
      const errorText = await response.text()
      console.error(`Error response: ${errorText}`)
      throw new Error(`SoilGrids API error: ${response.status}`)
    }

    const data: SoilData = await response.json()

    if (!data.properties || !data.properties.layers) {
      console.error('Unexpected data structure from SoilGrids API:', data)
      throw new Error('Unexpected data structure from SoilGrids API')
    }

    // Extract mean values for all properties
    const soilData: Record<string, number | null> = {};

    properties.forEach(property => {
      const layer = data.properties.layers.find(layer => layer.name === property);
      const meanValue = layer?.depths[0]?.values?.mean ?? null;
      soilData[property] = meanValue;
    });

    console.log('Successfully fetched and processed soil data:', soilData)
    return NextResponse.json(soilData)
  } catch (error) {
    console.error('Error in soil data API route:', error)
    return NextResponse.json({ error: 'Failed to fetch soil data: ' + error.message }, { status: 500 })
  }
}