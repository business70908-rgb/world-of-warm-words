import { nativeStorage } from '../nativeStorage';
import type { AppSettings } from '@/types/storage';

const CONFIG_PATH = 'config/appSettings.json';

const DEFAULT_SETTINGS: AppSettings = {
  razorpayApiKey: '',
  mobileContainerDimensions: {
    width: 540,
    height: 1086,
  },
};

export const configStorage = {
  async getAppSettings(): Promise<AppSettings> {
    const settings = await nativeStorage.readJSON<AppSettings>(CONFIG_PATH, DEFAULT_SETTINGS);
    return settings || DEFAULT_SETTINGS;
  },

  async updateAppSettings(settings: Partial<AppSettings>): Promise<void> {
    const currentSettings = await this.getAppSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await nativeStorage.writeJSON(CONFIG_PATH, updatedSettings);
  },

  async getRazorpayKey(): Promise<string> {
    const settings = await this.getAppSettings();
    return settings.razorpayApiKey || '';
  },

  async updateRazorpayKey(key: string): Promise<void> {
    await this.updateAppSettings({ razorpayApiKey: key });
  },

  async getContainerDimensions(): Promise<{ width: number; height: number }> {
    const settings = await this.getAppSettings();
    return settings.mobileContainerDimensions || DEFAULT_SETTINGS.mobileContainerDimensions!;
  },

  async updateContainerDimensions(dimensions: { width: number; height: number }): Promise<void> {
    await this.updateAppSettings({ mobileContainerDimensions: dimensions });
  },
};
