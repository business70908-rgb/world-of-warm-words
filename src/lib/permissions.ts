import { Camera, CameraPermissionState } from '@capacitor/camera';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { cacheManager } from './storage/cacheManager';

export interface PermissionStatus {
  camera: CameraPermissionState;
}

const PERMISSION_CACHE_KEY = 'camera_permission_status';
const PERMISSION_CACHE_TTL = 300000; // 5 minutes - permissions don't change often

/**
 * Request camera permissions for the app
 * This should be called when the app is first launched or when accessing camera features
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  // Skip permission check on web platform
  if (!Capacitor.isNativePlatform()) {
    return true;
  }

  try {
    const permissionStatus = await Camera.checkPermissions();
    
    if (permissionStatus.camera === 'granted') {
      // Cache granted permission
      cacheManager.set(PERMISSION_CACHE_KEY, 'granted', PERMISSION_CACHE_TTL);
      return true;
    }
    
    if (permissionStatus.camera === 'denied') {
      // Cache denied permission
      cacheManager.set(PERMISSION_CACHE_KEY, 'denied', PERMISSION_CACHE_TTL);
      return false;
    }
    
    // Request permission if not yet determined
    const result = await Camera.requestPermissions({ permissions: ['camera'] });
    
    if (result.camera === 'granted') {
      // Cache the result
      cacheManager.set(PERMISSION_CACHE_KEY, 'granted', PERMISSION_CACHE_TTL);
      return true;
    }
    
    // Cache denied/prompt state
    cacheManager.set(PERMISSION_CACHE_KEY, result.camera, PERMISSION_CACHE_TTL);
    return false;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

/**
 * Check current camera permission status with caching for instant response
 */
export const checkCameraPermission = async (): Promise<CameraPermissionState> => {
  // On web, always return granted
  if (!Capacitor.isNativePlatform()) {
    return 'granted';
  }

  // Check cache first for instant response
  const cached = cacheManager.get<CameraPermissionState>(PERMISSION_CACHE_KEY);
  if (cached) {
    return cached;
  }

  try {
    const permissionStatus = await Camera.checkPermissions();
    const status = permissionStatus.camera;
    
    // Cache the permission status
    cacheManager.set(PERMISSION_CACHE_KEY, status, PERMISSION_CACHE_TTL);
    
    return status;
  } catch (error) {
    console.error('Error checking camera permission:', error);
    return 'denied';
  }
};

/**
 * Prompt user to go to settings if permission is permanently denied
 * Only shows on native platforms
 */
export const promptForSettings = () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  toast.error('Camera access required', {
    description: 'Please enable camera permission in your device settings to scan QR codes',
    duration: 10000,
  });
};

/**
 * Initialize permissions on app first launch
 * Call this in your main App component or splash screen
 * Pre-warms permission cache for instant camera access
 */
export const initializePermissions = async (): Promise<void> => {
  // Skip on web platform
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  const hasAskedBefore = localStorage.getItem('hasAskedCameraPermission');
  
  if (!hasAskedBefore) {
    // First time - request permission and cache result
    const granted = await requestCameraPermission();
    localStorage.setItem('hasAskedCameraPermission', 'true');
    
    // Permission is now cached for instant access
    console.log('Camera permission initialized:', granted ? 'granted' : 'denied');
  } else {
    // Pre-warm cache by checking permission status
    await checkCameraPermission();
  }
};
