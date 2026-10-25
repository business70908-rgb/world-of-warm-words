// TypeScript interfaces for native storage

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
}

export interface CityLanguageSettings {
  selectedCity: string;
  selectedLanguage: string;
}

export interface PassData {
  passId: string;
  name: string;
  type: string;
  validFrom: string;
  validTill: string;
  amount: number;
  purchaseDate: string;
  purchaseTimestamp: number;
  status: 'active' | 'expired';
  colorTheme?: 'black' | 'blue';
  lastScannedBusNumber?: string;
  lastValidatedTimestamp?: string;
  // User data at time of purchase
  userFirstName?: string;
  userLastName?: string;
  userGender?: 'male' | 'female' | 'other';
  userDateOfBirth?: string;
}

export interface VerificationData {
  passId: string;
  selfieBase64: string;
  idType: string;
  idNumber: string;
  timestamp: number;
}

export interface WalletBalance {
  balance: number;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  timestamp: number;
  description: string;
  status?: 'completed' | 'pending' | 'failed';
  paymentMethod?: 'tummoc' | 'razorpay';
}

export interface TransactionsData {
  transactions: Transaction[];
}

export interface ScanData {
  scanCount: number;
  lastScanTimestamp?: string;
  totalCO2Saved: number;
  leaderboardData?: {
    title: string;
    entries: any[];
  };
  leaderboardPositions?: Record<string, number>;
}

export interface AppSettings {
  razorpayApiKey?: string;
  mobileContainerDimensions?: {
    width: number;
    height: number;
  };
}

export interface MigrationStatus {
  migrationComplete: boolean;
  migrationDate: string;
  version: string;
}
