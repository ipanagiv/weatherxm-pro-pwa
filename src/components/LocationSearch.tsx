import React, { useState } from 'react';
import { useWeatherStore } from '../store/weatherStore';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export const LocationSearch: React.FC = () => {
  const { setSelectedLocation } = useWeatherStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      // Use OpenStreetMap's Nominatim service for geocoding
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'WeatherXM Pro PWA',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to search for locations');
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching for locations:', error);
      setError('Failed to search for locations. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (result: SearchResult) => {
    setSelectedLocation({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name: result.display_name
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="mb-4">
      <div className="flex flex-col space-y-2">
        <div className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location..."
            className="flex-grow p-2 border rounded-l bg-white dark:bg-gray-700"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSearching ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            ) : (
              'Search'
            )}
          </button>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        {searchResults.length > 0 && (
          <div className="mt-2 border rounded bg-white dark:bg-gray-800 shadow-md max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0"
                onClick={() => handleSelectLocation(result)}
              >
                <div className="font-medium">{result.display_name.split(',')[0]}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {result.display_name.split(',').slice(1).join(',').trim()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 