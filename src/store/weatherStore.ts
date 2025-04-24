import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchStations, WeatherXMStation } from '../services/weatherService';
import { WeatherData, Location } from '../types/weather';

export interface FavoriteLocation extends Location {
  id: string;
  name: string;
}

interface WeatherState {
  selectedLocation: Location | null;
  weatherData: WeatherData | null;
  stations: WeatherXMStation[];
  isLoading: boolean;
  error: string | null;
  favorites: FavoriteLocation[];
  setSelectedLocation: (location: Location | null) => void;
  setWeatherData: (data: WeatherData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchStations: () => Promise<void>;
  addFavorite: (location: Location, name: string) => void;
  removeFavorite: (id: string) => void;
  selectFavorite: (location: FavoriteLocation) => void;
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set, get) => ({
      selectedLocation: null,
      weatherData: null,
      stations: [],
      isLoading: false,
      error: null,
      favorites: [],
      setSelectedLocation: (location) => {
        set({ selectedLocation: location, error: null });
        if (location) {
          get().fetchStations();
        }
      },
      setWeatherData: (data) => set({ weatherData: data }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      fetchStations: async () => {
        const { selectedLocation } = get();
        if (!selectedLocation) {
          set({ error: 'No location selected' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const stations = await fetchStations(selectedLocation);
          set({ stations, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch stations', isLoading: false });
        }
      },
      addFavorite: (location, name) => {
        const { favorites } = get();
        // Generate a unique ID for the favorite
        const id = `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Check if location already exists in favorites
        const exists = favorites.some(
          (fav) => fav.lat === location.lat && fav.lng === location.lng
        );
        
        if (!exists) {
          const newFavorite: FavoriteLocation = {
            ...location,
            id,
            name: name || `Location ${favorites.length + 1}`
          };
          set({ favorites: [...favorites, newFavorite] });
        }
      },
      removeFavorite: (id) => {
        const { favorites } = get();
        set({
          favorites: favorites.filter(fav => fav.id !== id),
        });
      },
      selectFavorite: (location) => {
        set({ selectedLocation: location, error: null });
        get().fetchStations();
      },
    }),
    {
      name: 'weather-storage',
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
); 