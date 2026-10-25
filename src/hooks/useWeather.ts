import { useState, useEffect } from 'react';

// City coordinates for major Indian cities
const cityCoordinates: Record<string, { lat: number; lon: number }> = {
  'Bengaluru': { lat: 12.9716, lon: 77.5946 },
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Delhi': { lat: 28.7041, lon: 77.1025 },
  'Chennai': { lat: 13.0827, lon: 80.2707 },
  'Kolkata': { lat: 22.5726, lon: 88.3639 },
  'Hyderabad': { lat: 17.3850, lon: 78.4867 },
  'Pune': { lat: 18.5204, lon: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'Jaipur': { lat: 26.9124, lon: 75.7873 },
  'Lucknow': { lat: 26.8467, lon: 80.9462 },
  'Indore': { lat: 22.7196, lon: 75.8577 },
  'Bhopal': { lat: 23.2599, lon: 77.4126 },
  'Patna': { lat: 25.5941, lon: 85.1376 },
  'Guwahati': { lat: 26.1445, lon: 91.7362 },
  'Kanpur': { lat: 26.4499, lon: 80.3319 },
  'Nagpur': { lat: 21.1458, lon: 79.0882 },
  'Vadodara': { lat: 22.3072, lon: 73.1812 },
  'Kochi': { lat: 9.9312, lon: 76.2673 },
  'Agra': { lat: 27.1767, lon: 78.0081 },
  'Bhubaneswar': { lat: 20.2961, lon: 85.8245 },
  'Hubballi-Dharwad': { lat: 15.3647, lon: 75.1240 },
  'Goa': { lat: 15.2993, lon: 74.1240 }
};

interface WeatherData {
  temperature: number;
  weatherCode: number;
  loading: boolean;
  error: string | null;
}

export const useWeather = (city: string): WeatherData => {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 25.0,
    weatherCode: 1,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeatherData(prev => ({ ...prev, loading: true, error: null }));
        
        const coordinates = cityCoordinates[city];
        if (!coordinates) {
          throw new Error(`Coordinates not found for ${city}`);
        }

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lon}&current=temperature_2m,weather_code&timezone=Asia%2FKolkata`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        const temperature = data.current.temperature_2m;
        const weatherCode = data.current.weather_code;

        setWeatherData({
          temperature: Number(temperature),
          weatherCode: Number(weatherCode),
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Weather fetch error:', error);
        setWeatherData({
          temperature: 25.0, // fallback temperature
          weatherCode: 1, // fallback weather code
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    fetchWeather();
  }, [city]);

  return weatherData;
};