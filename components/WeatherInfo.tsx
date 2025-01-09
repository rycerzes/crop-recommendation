import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'

interface WeatherData {
  placeName: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  pressure: number;
  visibility: number;
  icon: string;
}

interface AqiData {
  pm25: number;
  so2: number;
  no2: number;
  o3: number;
}

interface ForecastData {
  hourly: {
    time: string;
    temperature: number;
    icon: string;
  }[];
  daily: {
    date: string;
    minTemp: number;
    maxTemp: number;
    icon: string;
  }[];
}

interface WeatherInfoProps {
  weatherData: WeatherData | null;
  aqiData: AqiData | null;
  forecastData: ForecastData | null;
}

const WeatherInfo: React.FC<WeatherInfoProps> = ({ weatherData, aqiData, forecastData }) => {
  if (!weatherData) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{weatherData.placeName} Weather Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">Current Weather</h3>
            <div className="flex items-center">
              <Image src={`https://openweathermap.org/img/wn/${weatherData.icon}@4x.png`} alt={weatherData.description} width={50} height={50} />
              <span className="text-4xl ml-2">{weatherData.temperature}°C</span>
            </div>
            <p className="text-lg">{weatherData.description}</p>
            <p>Feels like: {weatherData.feelsLike}°C</p>
            <p>Humidity: {weatherData.humidity}%</p>
            <p>Wind Speed: {weatherData.windSpeed} m/s</p>
            <p>Pressure: {weatherData.pressure} hPa</p>
            <p>Visibility: {weatherData.visibility / 1000} km</p>
          </div>
          {aqiData && (
            <div>
              <h3 className="text-2xl font-bold mb-2">Air Quality Index</h3>
              <p>PM2.5: {aqiData.pm25} µg/m³</p>
              <p>SO2: {aqiData.so2} µg/m³</p>
              <p>NO2: {aqiData.no2} µg/m³</p>
              <p>O3: {aqiData.o3} µg/m³</p>
            </div>
          )}
        </div>
        {forecastData && forecastData.hourly && forecastData.daily && (
          <Tabs defaultValue="hourly" className="mt-4">
            <TabsList>
              <TabsTrigger value="hourly">5 Hour Forecast</TabsTrigger>
              <TabsTrigger value="daily">5 Day Forecast</TabsTrigger>
            </TabsList>
            <TabsContent value="hourly">
              <div className="grid grid-cols-5 gap-2">
                {forecastData.hourly.slice(0, 5).map((hour, index) => (
                  <div key={index} className="text-center">
                    <p>{new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <Image src={`https://openweathermap.org/img/wn/${hour.icon}@4x.png`} alt={hour.icon} width={30} height={30} />
                    <p>{hour.temperature}°C</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="daily">
              <div className="grid grid-cols-5 gap-2">
                {forecastData.daily.slice(0, 5).map((day, index) => (
                  <div key={index} className="text-center">
                    <p>{new Date(day.date).toLocaleDateString([], { weekday: 'short' })}</p>
                    <Image src={`https://openweathermap.org/img/wn/${day.icon}@4x.png`} alt={day.icon} width={30} height={30} />
                    <p>{day.minTemp}°C - {day.maxTemp}°C</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

export default WeatherInfo

