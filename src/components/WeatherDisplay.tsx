import React, { useEffect, useState } from 'react';
import { useWeatherStore } from '../store/weatherStore';
import { fetchWeatherData, fetchStations, WeatherXMStation } from '../services/weatherService';
import { useSettingsStore } from '../store/settingsStore';
import { calculateDistance } from '../types/weather';

const WeatherDisplay: React.FC = () => {
  const { 
    selectedLocation, 
    weatherData, 
    setWeatherData, 
    setError, 
    setLoading, 
    isLoading, 
    error,
    setSelectedStation: setStoreSelectedStation
  } = useWeatherStore();
  const { apiKey } = useSettingsStore();
  const [stations, setStations] = useState<WeatherXMStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<WeatherXMStation | null>(null);

  useEffect(() => {
    const loadStations = async () => {
      if (!selectedLocation || !apiKey) return;

      try {
        setLoading(true);
        setError(null);
        const nearbyStations = await fetchStations(selectedLocation);
        setStations(nearbyStations);
        
        if (nearbyStations.length > 0) {
          const firstStation = nearbyStations[0];
          setSelectedStation(firstStation);
          setStoreSelectedStation(firstStation);
          const data = await fetchWeatherData(firstStation);
          setWeatherData(data);
        } else {
          setError('No high-quality weather stations found in your area');
        }
      } catch (err) {
        console.error('Error loading stations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load weather stations');
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, [selectedLocation, apiKey]);

  const handleStationChange = async (station: WeatherXMStation) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedStation(station);
      setStoreSelectedStation(station);
      const data = await fetchWeatherData(station);
      setWeatherData(data);
    } catch (err) {
      console.error('Error loading weather data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedLocation) {
    return (
      <div className="p-4 text-center text-gray-500">
        Please select a location to view weather data
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="p-4 text-center text-red-500">
        Please set your API key in the settings
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
        <p className="text-sm mt-2">Please try again later or check your API key in settings</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Nearby Weather Stations</h3>
        <p className="text-sm text-gray-600 mb-2">
          Found {stations.length} stations in your area. Showing top 5 with perfect scores.
        </p>
        <div className="space-y-2">
          {stations
            .filter(station => station.lastDayQod === 1)
            .slice(0, 5)
            .map((station) => (
              <div
                key={station.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedStation?.id === station.id
                    ? 'bg-blue-100 border border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => handleStationChange(station)}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${
                    selectedStation?.id === station.id
                      ? 'text-blue-700'
                      : 'text-gray-800'
                  }`}>
                    {station.name}
                  </span>
                  <span className="text-sm text-green-600 font-semibold">
                    Quality: 100%
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {weatherData && (
        <div className="bg-white rounded-lg shadow p-4">
          {/* Responsive grid layout - 1 column on mobile, 2 on tablet, 3 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-2 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                  {weatherData.temperature.toFixed(1)}°C
                </div>
              </div>
              <div className="text-gray-600">Temperature</div>
              <div className="text-sm text-gray-500">
                Feels like: {weatherData.feelsLike.toFixed(1)}°C
              </div>
            </div>
            <div className="text-center p-2 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                  {weatherData.humidity}%
                </div>
              </div>
              <div className="text-gray-600">Humidity</div>
              <div className="text-sm text-gray-500">
                Dew point: {weatherData.dewPoint.toFixed(1)}°C
              </div>
            </div>
            <div className="text-center p-2 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                  {weatherData.windSpeed} m/s
                </div>
              </div>
              <div className="text-gray-600">Wind Speed</div>
              <div className="text-sm text-gray-500">
                Gust: {weatherData.windGust} m/s
              </div>
            </div>
            <div className="text-center p-2 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                  {weatherData.pressure} hPa
                </div>
              </div>
              <div className="text-gray-600">Pressure</div>
            </div>
            <div className="text-center p-2 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                  {weatherData.uvIndex}
                </div>
              </div>
              <div className="text-gray-600">UV Index</div>
            </div>
            <div className="text-center p-2 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                  {weatherData.solarIrradiance.toFixed(0)} W/m²
                </div>
              </div>
              <div className="text-gray-600">Solar Irradiance</div>
            </div>
            <div className="text-center p-2 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                  {weatherData.precipitationRate.toFixed(2)} mm/h
                </div>
              </div>
              <div className="text-gray-600">Precipitation Rate</div>
            </div>
            <div className="text-center p-2 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                  {weatherData.precipitationAccumulated.toFixed(2)} mm
                </div>
              </div>
              <div className="text-gray-600">Daily Precipitation</div>
            </div>
          </div>
          <div className="mt-4 text-center p-3 border-t">
            <div className="flex items-center justify-center">
              <img 
                src={`https://openweathermap.org/img/wn/${getWeatherIcon(weatherData.conditions)}@2x.png`} 
                alt={weatherData.conditions}
                className="w-16 h-16"
              />
              <div className="text-xl font-semibold text-gray-800 ml-2">
                {formatWeatherCondition(weatherData.conditions)}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date(weatherData.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get weather icon based on conditions
const getWeatherIcon = (conditions: string): string => {
  // Map WeatherXM Pro conditions to OpenWeatherMap icon codes
  const iconMap: Record<string, string> = {
    'clear-day': '01d',
    'clear-night': '01n',
    'partly-cloudy-day': '02d',
    'partly-cloudy-night': '02n',
    'cloudy': '03d',
    'overcast': '04d',
    'rain': '10d',
    'sleet': '13d',
    'snow': '13d',
    'wind': '50d',
    'fog': '50d',
    'thunderstorm': '11d',
    'tornado': '50d',
    'hail': '13d',
    'default': '01d'
  };
  
  return iconMap[conditions] || iconMap.default;
};

// Helper function to format weather conditions for display
const formatWeatherCondition = (conditions: string): string => {
  // Convert kebab-case to Title Case
  return conditions
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default WeatherDisplay; 