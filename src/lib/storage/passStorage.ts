import { nativeStorage } from '../nativeStorage';
import type { PassData } from '@/types/storage';
import { verificationStorage } from './verificationStorage';
import { cacheManager } from './cacheManager';
import { getTestActivePasses, getTestExpiredPass, saveTestActivePasses, saveTestExpiredPass } from './testPassData';

const ACTIVE_PASSES_DIR = 'passes/active';
const EXPIRED_PASS_PATH = 'passes/expired/lastExpiredPass.json';
const CACHE_KEY_ACTIVE_PASSES = 'active_passes';
const CACHE_KEY_EXPIRED_PASS = 'expired_pass';
const CACHE_TTL = 30000; // 30 seconds

export const passStorage = {
  async saveActivePass(passData: PassData): Promise<void> {
    const fileName = `pass_${passData.passId}_${passData.purchaseTimestamp}.json`;
    const filePath = `${ACTIVE_PASSES_DIR}/${fileName}`;
    const passWithStatus = { ...passData, status: 'active' as const };
    await nativeStorage.writeJSON(filePath, passWithStatus);
    
    // Invalidate cache when saving
    cacheManager.invalidate(CACHE_KEY_ACTIVE_PASSES);
  },

  async getActivePasses(): Promise<PassData[]> {
    // Check cache first
    const cached = cacheManager.get<PassData[]>(CACHE_KEY_ACTIVE_PASSES);
    if (cached) {
      return cached;
    }

    // Try native storage first
    const files = await nativeStorage.listFiles(ACTIVE_PASSES_DIR);
    
    // Read all pass files in parallel for better performance
    const passPromises = files
      .filter(file => file.endsWith('.json'))
      .map(file => nativeStorage.readJSON<PassData>(`${ACTIVE_PASSES_DIR}/${file}`));
    
    const passResults = await Promise.all(passPromises);
    let passes = passResults.filter((pass): pass is PassData => pass !== null);

    // TEST: Merge with localStorage test data
    const testPasses = getTestActivePasses();
    if (testPasses.length > 0) {
      const existingIds = new Set(passes.map(p => p.passId));
      const newTestPasses = testPasses.filter(tp => !existingIds.has(tp.passId));
      passes = [...passes, ...newTestPasses];
    }

    // Sort by purchase timestamp descending (newest first)
    const sortedPasses = passes.sort((a, b) => b.purchaseTimestamp - a.purchaseTimestamp);
    
    // Cache the result
    cacheManager.set(CACHE_KEY_ACTIVE_PASSES, sortedPasses, CACHE_TTL);
    
    return sortedPasses;
  },

  async getActivePassById(passId: string, purchaseTimestamp: number): Promise<PassData | null> {
    const fileName = `pass_${passId}_${purchaseTimestamp}.json`;
    const filePath = `${ACTIVE_PASSES_DIR}/${fileName}`;
    return await nativeStorage.readJSON<PassData>(filePath);
  },

  async deleteActivePass(passId: string, purchaseTimestamp: number): Promise<void> {
    const fileName = `pass_${passId}_${purchaseTimestamp}.json`;
    const filePath = `${ACTIVE_PASSES_DIR}/${fileName}`;
    await nativeStorage.deleteFile(filePath);
    
    // Invalidate cache when deleting
    cacheManager.invalidate(CACHE_KEY_ACTIVE_PASSES);
  },

  async expirePass(passData: PassData): Promise<void> {
    // Mark as expired
    const expiredPass = { ...passData, status: 'expired' as const };

    // Check if we already have an expired pass
    const currentExpired = await nativeStorage.readJSON<PassData>(EXPIRED_PASS_PATH);

    // Keep only if this is newer than the current expired pass
    if (!currentExpired || passData.purchaseTimestamp > currentExpired.purchaseTimestamp) {
      await nativeStorage.writeJSON(EXPIRED_PASS_PATH, expiredPass);
    }

    // Delete verification data (including selfie image) when pass expires
    await verificationStorage.deleteVerification(passData.passId);

    // Delete from active passes
    await this.deleteActivePass(passData.passId, passData.purchaseTimestamp);
    
    // Invalidate cache
    cacheManager.invalidate(CACHE_KEY_ACTIVE_PASSES);
    cacheManager.invalidate(CACHE_KEY_EXPIRED_PASS);
  },

  async getLastExpiredPass(): Promise<PassData | null> {
    // Check cache first
    const cached = cacheManager.get<PassData | null>(CACHE_KEY_EXPIRED_PASS);
    if (cached !== null) {
      return cached;
    }

    let expiredPass = await nativeStorage.readJSON<PassData>(EXPIRED_PASS_PATH);
    
    // TEST: Fall back to localStorage test expired pass
    if (!expiredPass) {
      expiredPass = getTestExpiredPass();
    }
    
    // Cache the result
    cacheManager.set(CACHE_KEY_EXPIRED_PASS, expiredPass, CACHE_TTL);
    
    return expiredPass;
  },

  async getAllPasses(): Promise<PassData[]> {
    const activePasses = await this.getActivePasses();
    const expiredPass = await this.getLastExpiredPass();
    
    return expiredPass ? [...activePasses, expiredPass] : activePasses;
  },

  async updatePassColor(passId: string, purchaseTimestamp: number, colorTheme: 'black' | 'blue'): Promise<void> {
    const pass = await this.getActivePassById(passId, purchaseTimestamp);
    if (pass) {
      const updatedPass = { ...pass, colorTheme };
      await this.saveActivePass(updatedPass);
    }
  },

  async updatePassScanData(passId: string, purchaseTimestamp: number, busNumber: string, timestamp: string): Promise<void> {
    const pass = await this.getActivePassById(passId, purchaseTimestamp);
    if (pass) {
      const updatedPass = { 
        ...pass, 
        lastScannedBusNumber: busNumber,
        lastValidatedTimestamp: timestamp
      };
      await this.saveActivePass(updatedPass);
    }
  },

  async deletePass(passId: string, purchaseTimestamp: number): Promise<void> {
    // Delete verification data (including selfie image) first
    await verificationStorage.deleteVerification(passId);
    
    // Delete from active passes
    await this.deleteActivePass(passId, purchaseTimestamp);

    // TEST: Also remove from localStorage test data
    const testPasses = getTestActivePasses();
    const filtered = testPasses.filter(p => !(p.passId === passId && p.purchaseTimestamp === purchaseTimestamp));
    if (filtered.length !== testPasses.length) {
      saveTestActivePasses(filtered);
    }
    
    // Check expired test pass too
    const expiredTest = getTestExpiredPass();
    if (expiredTest && expiredTest.passId === passId && expiredTest.purchaseTimestamp === purchaseTimestamp) {
      saveTestExpiredPass(null);
    }
  },
};
