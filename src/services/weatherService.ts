import { WeatherData, Location } from '../types/weather';
import { useSettingsStore } from '../store/settingsStore';

// Interface for WeatherXM Pro API response
export interface WeatherXMStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  pressure: number;
  conditions: string;
  icon: string;
  timestamp: string;
  lastDayQod: number;  // Quality of Data metric
  cell_index: string;  // Cell index for forecast API
}

interface WeatherXMResponse {
  stations: WeatherXMStation[];
}

// Function to log API calls to the debug log
const logApiCall = (method: string, url: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog({
      method,
      url,
      params
    });
  }
};

// Function to calculate distance between two points in kilometers
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

// Function to fetch stations from WeatherXM Pro API
export const fetchStations = async (location: Location): Promise<WeatherXMStation[]> => {
  const { apiKey } = useSettingsStore.getState();
  
  if (!apiKey) {
    throw new Error('API key is required');
  }

  try {
    // Calculate bounds around the location (approximately 30km radius)
    const latOffset = 0.3; // roughly 30km
    const lonOffset = 0.3; // roughly 30km at this latitude
    
    const minLat = location.lat - latOffset;
    const maxLat = location.lat + latOffset;
    const minLon = location.lng - lonOffset;
    const maxLon = location.lng + lonOffset;
    
    // Construct the API URL for WeatherXM Pro with bounds parameters
    const url = `https://pro.weatherxm.com/api/stations/bounds?min_lat=${minLat}&min_lon=${minLon}&max_lat=${maxLat}&max_lon=${maxLon}`;
    
    // Log the API call to the debug log
    logApiCall('GET', url, { 
      min_lat: minLat, 
      min_lon: minLon, 
      max_lat: maxLat, 
      max_lon: maxLon 
    });
    
    const startTime = performance.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    const endTime = performance.now();
    
    // Update the log with status and duration
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      (window as any).addDebugLog({
        method: 'GET',
        url,
        status: response.status,
        duration: endTime - startTime
      });
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error response:', errorData);
      throw new Error(`API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    let data: WeatherXMResponse;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      throw new Error('Invalid JSON response from API');
    }
    
    console.log('Parsed stations data:', data);
    
    if (data.stations && data.stations.length > 0) {
      // Filter for high-quality stations (lastDayQod > 0.9)
      const highQualityStations = data.stations.filter(station => station.lastDayQod > 0.9);
      
      // Sort by proximity to the selected location
      highQualityStations.sort((a, b) => {
        const distanceA = calculateDistance(location.lat, location.lng, a.lat, a.lon);
        const distanceB = calculateDistance(location.lat, location.lng, b.lat, b.lon);
        return distanceA - distanceB;
      });
      
      return highQualityStations;
    } else {
      console.error('No stations found in response');
      throw new Error('No weather stations found in the area');
    }
  } catch (error) {
    console.error('Error fetching stations:', error);
    throw error;
  }
};

// Function to fetch weather data for a specific station
export const fetchWeatherData = async (station: WeatherXMStation): Promise<WeatherData> => {
  const { apiKey } = useSettingsStore.getState();
  
  if (!apiKey) {
    throw new Error('API key is required');
  }

  try {
    console.log('Fetching latest observations for station:', station.id);
    
    // Fetch the latest observations for the selected station
    const url = `https://pro.weatherxm.com/api/stations/${station.id}/latest`;
    
    // Log the API call to the debug log
    logApiCall('GET', url, { station_id: station.id });
    
    const startTime = performance.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    const endTime = performance.now();
    
    // Update the log with status and duration
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      (window as any).addDebugLog({
        method: 'GET',
        url,
        status: response.status,
        duration: endTime - startTime
      });
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error response:', errorData);
      throw new Error(`API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('Latest observations data:', data);
    
    // Extract the weather data from the observation object in the response
    const observation = data.observation || {};
    
    return {
      temperature: observation.temperature || 0,
      humidity: observation.humidity || 0,
      windSpeed: observation.wind_speed || 0,
      windDirection: observation.wind_direction || 0,
      pressure: observation.pressure || 0,
      conditions: observation.icon || 'Unknown',
      feelsLike: observation.feels_like || 0,
      dewPoint: observation.dew_point || 0,
      precipitationRate: observation.precipitation_rate || 0,
      precipitationAccumulated: observation.precipitation_accumulated_daily || 0,
      windGust: observation.wind_gust || 0,
      uvIndex: observation.uv_index || 0,
      solarIrradiance: observation.solar_irradiance || 0,
      timestamp: observation.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Function to reverse geocode coordinates to a location name
export const getLocationName = async (location: Location): Promise<string> => {
  const { apiKey } = useSettingsStore.getState();
  
  if (!apiKey) {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  }

  try {
    // Using OpenStreetMap's Nominatim service for geocoding
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`;
    
    // Log the API call to the debug log
    logApiCall('GET', url, { lat: location.lat, lon: location.lng });
    
    const startTime = performance.now();
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WeatherXM Pro PWA',
      },
    });
    const endTime = performance.now();
    
    // Update the log with status and duration
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      (window as any).addDebugLog({
        method: 'GET',
        url,
        status: response.status,
        duration: endTime - startTime
      });
    }
    
    if (!response.ok) {
      throw new Error('Failed to get location name');
    }
    
    const data = await response.json();
    return data.display_name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  } catch (error) {
    console.error('Error getting location name:', error);
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  }
};

// Function to fetch forecast data for a specific cell
export const fetchForecast = async (cellIndex: string): Promise<any[]> => {
  const { apiKey } = useSettingsStore.getState();
  
  if (!apiKey) {
    throw new Error('API key is required');
  }

  try {
    const url = `https://pro.weatherxm.com/api/v1/cells/${cellIndex}/forecast`;
    
    // Log the API call to the debug log
    logApiCall('GET', url);
    
    const startTime = performance.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    const endTime = performance.now();
    
    // Update the log with status and duration
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      (window as any).addDebugLog({
        method: 'GET',
        url,
        status: response.status,
        duration: endTime - startTime
      });
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch forecast: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
}; 