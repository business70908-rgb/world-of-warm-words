import { nativeStorage } from '../nativeStorage';
import type { UserProfile } from '@/types/storage';
import { cacheManager } from './cacheManager';

const PROFILE_PATH = 'user/profile.json';
const PROFILE_IMAGE_PATH = 'user/profileImage.jpg';
const CACHE_KEY_PROFILE = 'user_profile';
const CACHE_KEY_PROFILE_IMAGE = 'profile_image';
const CACHE_TTL = 60000; // 1 minute

export const userStorage = {
  async getUserProfile(): Promise<UserProfile | null> {
    // Check cache first
    const cached = cacheManager.get<UserProfile | null>(CACHE_KEY_PROFILE);
    if (cached !== null) {
      return cached;
    }

    const profile = await nativeStorage.readJSON<UserProfile>(PROFILE_PATH);
    
    // Cache the result
    cacheManager.set(CACHE_KEY_PROFILE, profile, CACHE_TTL);
    
    return profile;
  },

  async updateUserProfile(profile: UserProfile): Promise<void> {
    await nativeStorage.writeJSON(PROFILE_PATH, profile);
    
    // Invalidate cache when updating
    cacheManager.invalidate(CACHE_KEY_PROFILE);
  },

  async hasUserProfile(): Promise<boolean> {
    return await nativeStorage.fileExists(PROFILE_PATH);
  },

  async saveProfileImage(base64Image: string): Promise<void> {
    await nativeStorage.writeFile(PROFILE_IMAGE_PATH, base64Image);
    
    // Invalidate cache when saving
    cacheManager.invalidate(CACHE_KEY_PROFILE_IMAGE);
  },

  async getProfileImage(): Promise<string | null> {
    // Check cache first
    const cached = cacheManager.get<string | null>(CACHE_KEY_PROFILE_IMAGE);
    if (cached !== null) {
      return cached;
    }

    const image = await nativeStorage.readFile(PROFILE_IMAGE_PATH);
    
    // Cache the result
    cacheManager.set(CACHE_KEY_PROFILE_IMAGE, image, CACHE_TTL);
    
    return image;
  },

  async deleteProfileImage(): Promise<void> {
    await nativeStorage.deleteFile(PROFILE_IMAGE_PATH);
    
    // Invalidate cache when deleting
    cacheManager.invalidate(CACHE_KEY_PROFILE_IMAGE);
  },
};
