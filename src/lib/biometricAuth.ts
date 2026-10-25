import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export interface BiometricAuthOptions {
  reason: string;
  cancelTitle?: string;
  allowDeviceCredential?: boolean;
  iosFallbackTitle?: string;
  androidTitle?: string;
  androidSubtitle?: string;
  androidConfirmationRequired?: boolean;
}

/**
 * Check if biometric authentication is available on the device
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    const result = await BiometricAuth.checkBiometry();
    return result.isAvailable;
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return false;
  }
};

/**
 * Get the type of biometric authentication available
 */
export const getBiometricType = async (): Promise<any> => {
  try {
    const result = await BiometricAuth.checkBiometry();
    if (result.isAvailable && result.biometryType) {
      return result.biometryType;
    }
    return null;
  } catch (error) {
    console.error('Error getting biometric type:', error);
    return null;
  }
};

/**
 * Authenticate user with native biometric or device credentials
 * This uses the actual device's biometric sensors (fingerprint, Face ID, etc.)
 * or falls back to device PIN/password
 */
export const authenticateWithBiometric = async (
  options: BiometricAuthOptions
): Promise<boolean> => {
  const platform = Capacitor.getPlatform();
  
  // Only use native biometric on mobile platforms
  if (platform === 'web') {
    console.log('Biometric auth not available on web, falling back to confirmation');
    return false;
  }

  try {
    // Check if biometric is available
    const isAvailable = await isBiometricAvailable();
    
    if (!isAvailable) {
      toast.info('Biometric authentication not available', {
        description: 'Using device PIN or password instead',
        duration: 3000,
      });
    }

    // Attempt biometric authentication
    await BiometricAuth.authenticate({
      reason: options.reason,
      cancelTitle: options.cancelTitle || 'Cancel',
      allowDeviceCredential: options.allowDeviceCredential !== false, // Default to true
      iosFallbackTitle: options.iosFallbackTitle || 'Use Passcode',
      androidTitle: options.androidTitle || 'Authentication Required',
      androidSubtitle: options.androidSubtitle || '',
      androidConfirmationRequired: options.androidConfirmationRequired !== undefined 
        ? options.androidConfirmationRequired 
        : false,
    });

    // If we reach here, authentication succeeded
    return true;
  } catch (error: any) {
    console.error('Biometric authentication failed:', error);
    
    // Check if user cancelled
    if (error.code === 10 || error.code === 13) {
      toast.info('Authentication cancelled');
      return false;
    }
    
    // Other errors - biometric might not be available
    console.log('Biometric auth failed, will use fallback');
    return false;
  }
};

/**
 * Authenticate for payment with native biometric or device credentials
 * Provides a fallback confirmation dialog for web or if biometric fails
 */
export const authenticateForPayment = async (
  amount: number,
  description: string,
  onSuccess: () => void,
  onCancel?: () => void
): Promise<void> => {
  const platform = Capacitor.getPlatform();
  
  // Try native biometric on mobile
  if (platform === 'ios' || platform === 'android') {
    const success = await authenticateWithBiometric({
      reason: `Confirm payment of ₹${amount.toFixed(1)} for ${description}`,
      cancelTitle: 'Cancel',
      allowDeviceCredential: true,
      iosFallbackTitle: 'Use Passcode',
      androidTitle: 'Confirm Payment',
      androidSubtitle: `₹${amount.toFixed(1)}`,
      androidConfirmationRequired: false,
    });

    if (success) {
      onSuccess();
      return;
    }
    
    // If biometric failed but user didn't cancel, fall through to confirmation
    if (onCancel) {
      onCancel();
    }
    return;
  }

  // Fallback for web or if biometric not available
  const confirmed = window.confirm(
    `Confirm payment of ₹${amount.toFixed(1)}?\n\n${description}`
  );

  if (confirmed) {
    onSuccess();
  } else if (onCancel) {
    onCancel();
  }
};
