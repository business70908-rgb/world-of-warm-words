import { nativeStorage } from '../nativeStorage';
import type { VerificationData } from '@/types/storage';
import { cacheManager } from './cacheManager';

const ACTIVE_VERIFICATION_DIR = 'verification/active';
const EXPIRED_VERIFICATION_PATH = 'verification/expired/lastExpiredVerification.json';
const CACHE_KEY_PREFIX = 'verification_';
const CACHE_TTL = 30000; // 30 seconds

export const verificationStorage = {
  async saveVerificationData(passId: string, data: VerificationData): Promise<void> {
    const fileName = `verification_${passId}.json`;
    const filePath = `${ACTIVE_VERIFICATION_DIR}/${fileName}`;
    await nativeStorage.writeJSON(filePath, data);
    
    // Invalidate cache when saving
    cacheManager.invalidate(`${CACHE_KEY_PREFIX}${passId}`);
  },

  async getVerificationByPassId(passId: string): Promise<VerificationData | null> {
    // Check cache first
    const cacheKey = `${CACHE_KEY_PREFIX}${passId}`;
    const cached = cacheManager.get<VerificationData | null>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const fileName = `verification_${passId}.json`;
    const filePath = `${ACTIVE_VERIFICATION_DIR}/${fileName}`;
    const data = await nativeStorage.readJSON<VerificationData>(filePath);
    
    // Cache the result
    cacheManager.set(cacheKey, data, CACHE_TTL);
    
    return data;
  },

  async getAllActiveVerifications(): Promise<VerificationData[]> {
    const files = await nativeStorage.listFiles(ACTIVE_VERIFICATION_DIR);
    
    // Read all verification files in parallel for better performance
    const verificationPromises = files
      .filter(file => file.endsWith('.json'))
      .map(file => nativeStorage.readJSON<VerificationData>(`${ACTIVE_VERIFICATION_DIR}/${file}`));
    
    const verificationResults = await Promise.all(verificationPromises);
    return verificationResults.filter((verification): verification is VerificationData => verification !== null);
  },

  async expireVerification(passId: string): Promise<void> {
    const verificationData = await this.getVerificationByPassId(passId);
    if (!verificationData) return;

    // Check if we already have an expired verification
    const currentExpired = await nativeStorage.readJSON<VerificationData>(EXPIRED_VERIFICATION_PATH);

    // Keep only if this is newer than the current expired verification
    if (!currentExpired || verificationData.timestamp > currentExpired.timestamp) {
      await nativeStorage.writeJSON(EXPIRED_VERIFICATION_PATH, verificationData);
    }

    // Delete from active verifications
    await this.deleteVerification(passId);
  },

  async deleteVerification(passId: string): Promise<void> {
    const fileName = `verification_${passId}.json`;
    const filePath = `${ACTIVE_VERIFICATION_DIR}/${fileName}`;
    await nativeStorage.deleteFile(filePath);
    
    // Invalidate cache when deleting
    cacheManager.invalidate(`${CACHE_KEY_PREFIX}${passId}`);
  },

  async getLastExpiredVerification(): Promise<VerificationData | null> {
    return await nativeStorage.readJSON<VerificationData>(EXPIRED_VERIFICATION_PATH);
  },
};
