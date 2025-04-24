import React, { useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';

export const Settings: React.FC = () => {
  const { apiKey, setApiKey, validateApiKey } = useSettingsStore();
  const [inputKey, setInputKey] = useState(apiKey || '85e7123d-a2aa-41a6-9c03-7e9773d5b942');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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
      setSuccess('API key saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the API key');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
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
          <p className="mt-1 text-sm text-gray-500">
            Get your API key from{' '}
            <a
              href="https://pro.weatherxm.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              WeatherXM Pro
            </a>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save API Key
        </button>
      </form>
    </div>
  );
}; 