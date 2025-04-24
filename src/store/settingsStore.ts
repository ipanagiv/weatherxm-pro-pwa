import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  validateApiKey: (key: string) => boolean;
}

// Function to validate WeatherXM Pro API key format
const isValidApiKey = (key: string): boolean => {
  // WeatherXM Pro API keys are UUID format (e.g., 85e7123d-a2aa-41a6-9c03-7e9773d5b942)
  const apiKeyRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return apiKeyRegex.test(key);
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: null,
      setApiKey: (key: string) => {
        if (!isValidApiKey(key)) {
          throw new Error('Invalid API key format. WeatherXM Pro API keys should be in UUID format (e.g., 85e7123d-a2aa-41a6-9c03-7e9773d5b942)');
        }
        set({ apiKey: key });
      },
      validateApiKey: isValidApiKey,
    }),
    {
      name: 'weatherxm-pro-settings',
    }
  )
); 