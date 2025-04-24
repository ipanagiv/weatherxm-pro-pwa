import React, { useState, useEffect } from 'react';
import { useWeatherStore } from '../store/weatherStore';
import { useSettingsStore } from '../store/settingsStore';
import { fetchForecast } from '../services/weatherService';

interface ForecastData {
  timestamp: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  precipitation: number;
  pressure: number;
  solar_radiation: number;
}

export const Forecast: React.FC = () => {
  const { selectedStation } = useWeatherStore();
  const { apiKey } = useSettingsStore();
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadForecast = async () => {
      if (!selectedStation || !apiKey) {
        setForecast([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const forecastData = await fetchForecast(selectedStation.cell_index);
        setForecast(forecastData);
      } catch (err) {
        console.error('Error fetching forecast:', err);
        setError('Failed to load forecast data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadForecast();
  }, [selectedStation, apiKey]);

  if (!selectedStation) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Forecast</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Select a weather station to view forecast data.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Forecast</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Forecast</h2>
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Forecast for {selectedStation.name}</h2>
      
      {forecast.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No forecast data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Temperature</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Humidity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Wind</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Precipitation</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pressure</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Solar Radiation</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {forecast.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {item.temperature.toFixed(1)}°C
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {item.humidity.toFixed(1)}%
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {item.wind_speed.toFixed(1)} m/s {getWindDirection(item.wind_direction)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {item.precipitation.toFixed(1)} mm
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {item.pressure.toFixed(1)} hPa
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {item.solar_radiation.toFixed(1)} W/m²
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Helper function to convert wind direction degrees to cardinal direction
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
} 