import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';

export const ApiKeyModal: React.FC = () => {
  const { apiKey, setApiKey, validateApiKey } = useSettingsStore();
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal if no API key is set
    if (!apiKey) {
      setIsOpen(true);
    }
  }, [apiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!inputKey.trim()) {
        setError('API key cannot be empty');
        return;
      }

      if (!validateApiKey(inputKey)) {
        setError('Invalid API key format. WeatherXM Pro API keys should be in UUID format (e.g., 85e7123d-a2aa-41a6-9c03-7e9773d5b942)');
        return;
      }

      setApiKey(inputKey);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the API key');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome to WeatherXM Pro</h2>
        <p className="text-gray-600 mb-6">
          To use this application, you need a WeatherXM Pro API key. If you don't have one, you can get it from the WeatherXM Pro website.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              WeatherXM Pro API Key
            </label>
            <input
              type="text"
              id="apiKey"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Enter your WeatherXM Pro API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-mono"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center">
            <a
              href="https://pro.weatherxm.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Get an API key
            </a>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save API Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 