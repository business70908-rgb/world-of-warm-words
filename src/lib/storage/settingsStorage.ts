import { nativeStorage } from '../nativeStorage';
import type { CityLanguageSettings } from '@/types/storage';

const SETTINGS_PATH = 'settings/cityLanguage.json';

const DEFAULT_SETTINGS: CityLanguageSettings = {
  selectedCity: 'Bengaluru',
  selectedLanguage: 'English',
};

export const settingsStorage = {
  async getCityLanguageSettings(): Promise<CityLanguageSettings> {
    const settings = await nativeStorage.readJSON<CityLanguageSettings>(
      SETTINGS_PATH,
      DEFAULT_SETTINGS
    );
    return settings || DEFAULT_SETTINGS;
  },

  async updateCityLanguageSettings(settings: Partial<CityLanguageSettings>): Promise<void> {
    const currentSettings = await this.getCityLanguageSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await nativeStorage.writeJSON(SETTINGS_PATH, updatedSettings);
  },

  async getSelectedCity(): Promise<string> {
    const settings = await this.getCityLanguageSettings();
    return settings.selectedCity;
  },

  async setSelectedCity(city: string): Promise<void> {
    await this.updateCityLanguageSettings({ selectedCity: city });
  },

  async getSelectedLanguage(): Promise<string> {
    const settings = await this.getCityLanguageSettings();
    return settings.selectedLanguage;
  },

  async setSelectedLanguage(language: string): Promise<void> {
    await this.updateCityLanguageSettings({ selectedLanguage: language });
  },
};
