import './index.css' // Ensure Tailwind styles are loaded
import { Settings } from './components/Settings'
import { useSettingsStore } from './store/settingsStore'
import { DebugLog } from './components/DebugLog'
import { Map } from './components/Map'
import WeatherDisplay from './components/WeatherDisplay'
import { Favorites } from './components/Favorites'
import { LocationSearch } from './components/LocationSearch'
import { useWeatherStore } from './store/weatherStore'
import { ApiKeyModal } from './components/ApiKeyModal'
import { BurgerMenu } from './components/BurgerMenu'
import { Forecast } from './components/Forecast'
import { useState } from 'react'

function App() {
  const { apiKey } = useSettingsStore();
  const { setSelectedLocation } = useWeatherStore();
  const [activeTab, setActiveTab] = useState<'weather' | 'forecast'>('weather');

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <header className="mb-4 flex justify-between items-center">
        <div className="w-1/4"></div>
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 text-center w-1/2">
          WeatherXM Pro API
        </h1>
        <div className="w-1/4 flex justify-end">
          {apiKey && <BurgerMenu />}
        </div>
      </header>

      <main>
        {/* API Key Modal - Shows on first visit or when no API key is set */}
        <ApiKeyModal />

        {!apiKey ? (
          // Show settings component centered when no API key is present
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold mb-2">Welcome to WeatherXM Pro API</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Please enter your WeatherXM Pro API key to get started.
                </p>
              </div>
              <div className="p-4 border rounded shadow-md bg-white dark:bg-gray-800">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Settings</h2>
                <div className="p-4">
                  <Settings />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Show main content when API key is present
          <>
            {/* Tabs */}
            <div className="mt-4 flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'weather'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('weather')}
              >
                Current Weather
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === 'forecast'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('forecast')}
              >
                Forecast
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'weather' ? (
              <>
                {/* Weather Display Area */}
                <div className="mt-4 p-4 border rounded shadow-md bg-white dark:bg-gray-800">
                  <WeatherDisplay />
                </div>

                {/* Location Search */}
                <div className="mt-4 p-4 border rounded shadow-md bg-white dark:bg-gray-800">
                  <h2 className="text-xl font-semibold mb-2">Search Location</h2>
                  <LocationSearch />
                </div>

                {/* Map Area */}
                <div className="mt-4 p-4 border rounded shadow-md bg-white dark:bg-gray-800" style={{ height: '400px' }}>
                  <Map onLocationSelect={handleLocationSelect} />
                </div>

                {/* Favorites Area */}
                <div className="mt-4 p-4 border rounded shadow-md bg-white dark:bg-gray-800">
                  <Favorites />
                </div>
              </>
            ) : (
              <div className="mt-4 p-4 border rounded shadow-md bg-white dark:bg-gray-800">
                <Forecast />
              </div>
            )}

            {/* Debug Log Component */}
            <div className="mt-4">
              <DebugLog />
            </div>
          </>
        )}
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Powered by WeatherXM Pro API
      </footer>
    </div>
  )
}

export default App
