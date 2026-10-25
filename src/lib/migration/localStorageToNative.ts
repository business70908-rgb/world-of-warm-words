import { nativeStorage } from '../nativeStorage';
import { userStorage } from '../storage/userStorage';
import { settingsStorage } from '../storage/settingsStorage';
import { passStorage } from '../storage/passStorage';
import { verificationStorage } from '../storage/verificationStorage';
import { walletStorage } from '../storage/walletStorage';
import { scanStorage } from '../storage/scanStorage';
import { configStorage } from '../storage/configStorage';
import type { PassData, Transaction, VerificationData } from '@/types/storage';

const MIGRATION_FLAG_PATH = 'config/migrationComplete.json';

export async function migrateLocalStorageToNative(): Promise<void> {
  try {
    // Use in-memory flag to avoid repeated filesystem checks
    if (sessionStorage.getItem('migrationChecked') === 'true') {
      return;
    }

    // Check if migration already completed
    const migrationStatus = await nativeStorage.readJSON<{ migrationComplete: boolean }>(
      MIGRATION_FLAG_PATH
    );

    if (migrationStatus?.migrationComplete) {
      sessionStorage.setItem('migrationChecked', 'true');
      return;
    }

    console.log('Starting migration from localStorage to native storage...');

    // 1. Migrate User Profile
    await migrateUserProfile();

    // 2. Migrate City & Language Settings
    await migrateSettings();

    // 3. Migrate Passes
    await migratePasses();

    // 4. Migrate Verification Data
    await migrateVerification();

    // 5. Migrate Wallet & Transactions
    await migrateWallet();

    // 6. Migrate Scan Data
    await migrateScanData();

    // 7. Migrate Config/App Settings
    await migrateConfig();

    // Mark migration as complete
    await nativeStorage.writeJSON(MIGRATION_FLAG_PATH, {
      migrationComplete: true,
      migrationDate: new Date().toISOString(),
      version: '1.0.0',
    });

    // Set session flag to avoid checking again this session
    sessionStorage.setItem('migrationChecked', 'true');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function migrateUserProfile(): Promise<void> {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const profile = JSON.parse(userData);
      await userStorage.updateUserProfile(profile);
      console.log('✓ User profile migrated');
    }

    const profileImage = localStorage.getItem('profileImage');
    if (profileImage) {
      await userStorage.saveProfileImage(profileImage);
      console.log('✓ Profile image migrated');
    }
  } catch (error) {
    console.error('Error migrating user profile:', error);
  }
}

async function migrateSettings(): Promise<void> {
  try {
    const selectedCity = localStorage.getItem('selectedCity') || 'Bengaluru';
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'English';

    await settingsStorage.updateCityLanguageSettings({
      selectedCity,
      selectedLanguage,
    });
    console.log('✓ Settings migrated');
  } catch (error) {
    console.error('Error migrating settings:', error);
  }
}

async function migratePasses(): Promise<void> {
  try {
    const allPassesStr = localStorage.getItem('allPurchasedPasses');
    if (!allPassesStr) {
      // Try single pass format
      const singlePassStr = localStorage.getItem('purchasedPass');
      if (singlePassStr) {
        const passData = JSON.parse(singlePassStr);
        const normalizedPass = normalizePassData(passData);
        
        if (isPassActive(normalizedPass)) {
          await passStorage.saveActivePass(normalizedPass);
        } else {
          await passStorage.expirePass(normalizedPass);
        }
        console.log('✓ Single pass migrated');
      }
      return;
    }

    const allPasses = JSON.parse(allPassesStr);
    const passArray = Array.isArray(allPasses) ? allPasses : [allPasses];

    for (const pass of passArray) {
      const normalizedPass = normalizePassData(pass);
      
      if (isPassActive(normalizedPass)) {
        await passStorage.saveActivePass(normalizedPass);
      } else {
        // Will only keep the most recent expired one
        await passStorage.expirePass(normalizedPass);
      }
    }

    console.log(`✓ ${passArray.length} passes migrated`);
  } catch (error) {
    console.error('Error migrating passes:', error);
  }
}

function normalizePassData(pass: any): PassData {
  const purchaseTimestamp = pass.purchaseTimestamp || 
                           pass.purchaseDate ? new Date(pass.purchaseDate).getTime() : 
                           Date.now();
  
  return {
    passId: pass.passId || pass.id || `pass_${purchaseTimestamp}`,
    name: pass.name || pass.passName || 'Unknown Pass',
    type: pass.type || pass.passType || 'general',
    validFrom: pass.validFrom || pass.startDate || new Date().toISOString(),
    validTill: pass.validTill || pass.endDate || new Date().toISOString(),
    amount: pass.amount || pass.price || 0,
    purchaseDate: pass.purchaseDate || new Date(purchaseTimestamp).toISOString(),
    purchaseTimestamp: purchaseTimestamp,
    status: pass.status || 'active',
  };
}

function isPassActive(pass: PassData): boolean {
  const now = new Date();
  const validTill = new Date(pass.validTill);
  return validTill > now;
}

async function migrateVerification(): Promise<void> {
  try {
    const selfie = localStorage.getItem('verificationSelfie');
    const idType = localStorage.getItem('verificationIdType');
    const idNumber = localStorage.getItem('verificationIdNumber');

    if (selfie && idType && idNumber) {
      // Try to link to most recent pass
      const passes = await passStorage.getActivePasses();
      const mostRecentPass = passes[0];

      if (mostRecentPass) {
        const verificationData: VerificationData = {
          passId: mostRecentPass.passId,
          selfieBase64: selfie,
          idType: idType,
          idNumber: idNumber,
          timestamp: Date.now(),
        };
        await verificationStorage.saveVerificationData(mostRecentPass.passId, verificationData);
        console.log('✓ Verification data migrated');
      }
    }
  } catch (error) {
    console.error('Error migrating verification:', error);
  }
}

async function migrateWallet(): Promise<void> {
  try {
    // Migrate balance
    const balanceStr = localStorage.getItem('tummocBalance');
    if (balanceStr) {
      const balance = parseFloat(balanceStr);
      await walletStorage.updateBalance(balance);
      console.log('✓ Wallet balance migrated');
    }

    // Migrate transactions
    const transactionsStr = localStorage.getItem('tummocTransactions');
    if (transactionsStr) {
      const transactions: Transaction[] = JSON.parse(transactionsStr);
      
      // Write all transactions at once
      if (transactions.length > 0) {
        await nativeStorage.writeJSON('wallet/transactions.json', { transactions });
        console.log(`✓ ${transactions.length} transactions migrated`);
      }
    }
  } catch (error) {
    console.error('Error migrating wallet:', error);
  }
}

async function migrateScanData(): Promise<void> {
  try {
    const scanCount = localStorage.getItem('scanCount');
    const leaderboardData = localStorage.getItem('leaderboardData');
    const leaderboardPositions = localStorage.getItem('leaderboardPositions');

    const scanData: any = {
      scanCount: scanCount ? parseInt(scanCount) : 0,
      totalCO2Saved: 0,
    };

    if (leaderboardData) {
      scanData.leaderboardData = JSON.parse(leaderboardData);
    }

    if (leaderboardPositions) {
      scanData.leaderboardPositions = JSON.parse(leaderboardPositions);
    }

    await scanStorage.updateScanData(scanData);
    console.log('✓ Scan data migrated');
  } catch (error) {
    console.error('Error migrating scan data:', error);
  }
}

async function migrateConfig(): Promise<void> {
  try {
    const razorpayApiKey = localStorage.getItem('razorpayApiKey') || '';
    const dimensionsStr = localStorage.getItem('mobileContainerDimensions');
    const lastScannedBusNumber = localStorage.getItem('lastScannedBusNumber') || '';
    const lastValidatedTimestamp = localStorage.getItem('lastValidatedTimestamp') || '';

    const config: any = {
      razorpayApiKey,
      lastScannedBusNumber,
      lastValidatedTimestamp,
    };

    if (dimensionsStr) {
      config.mobileContainerDimensions = JSON.parse(dimensionsStr);
    }

    await configStorage.updateAppSettings(config);
    console.log('✓ Config migrated');
  } catch (error) {
    console.error('Error migrating config:', error);
  }
}

