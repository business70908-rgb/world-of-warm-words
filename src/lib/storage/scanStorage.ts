import { nativeStorage } from '../nativeStorage';
import type { ScanData } from '@/types/storage';
import { cacheManager } from './cacheManager';

const SCAN_DATA_PATH = 'scans/scanData.json';
const CACHE_KEY_SCAN_DATA = 'scan_data';
const CACHE_TTL = 30000; // 30 seconds

const DEFAULT_SCAN_DATA: ScanData = {
  scanCount: 0,
  totalCO2Saved: 0,
  lastScanTimestamp: undefined,
  leaderboardData: undefined,
  leaderboardPositions: undefined,
};

export const scanStorage = {
  async getScanData(): Promise<ScanData> {
    // Check cache first
    const cached = cacheManager.get<ScanData>(CACHE_KEY_SCAN_DATA);
    if (cached) {
      return cached;
    }

    const data = await nativeStorage.readJSON<ScanData>(SCAN_DATA_PATH, DEFAULT_SCAN_DATA);
    const scanData = data || DEFAULT_SCAN_DATA;
    
    // Cache the result
    cacheManager.set(CACHE_KEY_SCAN_DATA, scanData, CACHE_TTL);
    
    return scanData;
  },

  async updateScanData(scanData: Partial<ScanData>): Promise<void> {
    const currentData = await this.getScanData();
    const updatedData = { ...currentData, ...scanData };
    await nativeStorage.writeJSON(SCAN_DATA_PATH, updatedData);
    
    // Invalidate cache when updating
    cacheManager.invalidate(CACHE_KEY_SCAN_DATA);
  },

  async incrementScanCount(): Promise<number> {
    const data = await this.getScanData();
    const newCount = (data.scanCount || 0) + 1;
    await this.updateScanData({
      scanCount: newCount,
      lastScanTimestamp: new Date().toISOString(),
    });
    return newCount;
  },

  async getScanCount(): Promise<number> {
    const data = await this.getScanData();
    return data.scanCount || 0;
  },

  async updateLeaderboardData(leaderboardData: any): Promise<void> {
    await this.updateScanData({ leaderboardData });
  },

  async updateLeaderboardPositions(positions: Record<string, number>): Promise<void> {
    await this.updateScanData({ leaderboardPositions: positions });
  },

  async updateCO2Saved(co2Amount: number): Promise<void> {
    const data = await this.getScanData();
    const newTotal = (data.totalCO2Saved || 0) + co2Amount;
    await this.updateScanData({ totalCO2Saved: newTotal });
  },
};
