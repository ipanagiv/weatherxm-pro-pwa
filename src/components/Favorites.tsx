import React, { useState } from 'react';
import { useWeatherStore, FavoriteLocation } from '../store/weatherStore';

export const Favorites: React.FC = () => {
  const { favorites, removeFavorite, setSelectedLocation } = useWeatherStore();
  const [newFavoriteName, setNewFavoriteName] = useState('');
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);

  const handleAddFavorite = () => {
    if (!newFavoriteName.trim()) return;
    
    // Get the current selected location from the store
    const currentLocation = useWeatherStore.getState().selectedLocation;
    
    if (currentLocation) {
      useWeatherStore.getState().addFavorite(currentLocation, newFavoriteName);
      setNewFavoriteName('');
      setIsAddingFavorite(false);
    }
  };

  const handleSelectFavorite = (favorite: FavoriteLocation) => {
    setSelectedLocation(favorite);
  };

  const handleRemoveFavorite = (id: string) => {
    removeFavorite(id);
  };

  if (favorites.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No favorite locations yet.
        </p>
        <button
          onClick={() => setIsAddingFavorite(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Current Location as Favorite
        </button>
        
        {isAddingFavorite && (
          <div className="mt-4 p-4 border rounded bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-2">Add Favorite</h3>
            <input
              type="text"
              value={newFavoriteName}
              onChange={(e) => setNewFavoriteName(e.target.value)}
              placeholder="Enter a name for this location"
              className="w-full p-2 border rounded mb-2 bg-gray-100 dark:bg-gray-700"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleAddFavorite}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => setIsAddingFavorite(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Favorite Locations</h2>
        <button
          onClick={() => setIsAddingFavorite(true)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Add Current
        </button>
      </div>
      
      {isAddingFavorite && (
        <div className="mb-4 p-4 border rounded bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium mb-2">Add Favorite</h3>
          <input
            type="text"
            value={newFavoriteName}
            onChange={(e) => setNewFavoriteName(e.target.value)}
            placeholder="Enter a name for this location"
            className="w-full p-2 border rounded mb-2 bg-gray-100 dark:bg-gray-700"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleAddFavorite}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setIsAddingFavorite(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {favorites.map((favorite) => (
          <div 
            key={favorite.id}
            className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded shadow-sm"
          >
            <div>
              <h3 className="font-medium">{favorite.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {favorite.lat.toFixed(4)}, {favorite.lng.toFixed(4)}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSelectFavorite(favorite)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                View
              </button>
              <button
                onClick={() => handleRemoveFavorite(favorite.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 