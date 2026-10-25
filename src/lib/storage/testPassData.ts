// TEST DATA - Delete when asked
import type { PassData } from '@/types/storage';

const TEST_PASSES_KEY = 'test_active_passes';
const TEST_EXPIRED_PASS_KEY = 'test_expired_pass';
const TEST_VERIFICATION_KEY = 'test_verifications';

function generateTestPasses(): PassData[] {
  const now = new Date();
  
  const dailyValidFrom = new Date(now);
  dailyValidFrom.setHours(0, 0, 0, 0);
  const dailyValidTill = new Date(dailyValidFrom);
  dailyValidTill.setHours(23, 59, 59, 999);

  const weeklyValidFrom = new Date(now);
  weeklyValidFrom.setHours(0, 0, 0, 0);
  const weeklyValidTill = new Date(weeklyValidFrom);
  weeklyValidTill.setDate(weeklyValidTill.getDate() + 6);
  weeklyValidTill.setHours(23, 59, 59, 999);

  const monthlyValidFrom = new Date(now);
  monthlyValidFrom.setHours(0, 0, 0, 0);
  const monthlyValidTill = new Date(monthlyValidFrom);
  monthlyValidTill.setMonth(monthlyValidTill.getMonth() + 1);
  monthlyValidTill.setDate(monthlyValidTill.getDate() - 1);
  monthlyValidTill.setHours(23, 59, 59, 999);

  return [
    {
      passId: 'test-ordinary-day-001',
      name: 'Ordinary Day Pass',
      type: 'Ordinary',
      validFrom: dailyValidFrom.toISOString(),
      validTill: dailyValidTill.toISOString(),
      amount: 80,
      purchaseDate: now.toISOString(),
      purchaseTimestamp: now.getTime() - 3600000,
      status: 'active',
      colorTheme: 'black',
      userFirstName: 'Rahul',
      userLastName: 'Sharma',
      userGender: 'male',
      userDateOfBirth: '1995-06-15',
    },
    {
      passId: 'test-vajra-gold-day-002',
      name: 'Vajra Gold Day Pass',
      type: 'AC',
      validFrom: dailyValidFrom.toISOString(),
      validTill: dailyValidTill.toISOString(),
      amount: 140,
      purchaseDate: now.toISOString(),
      purchaseTimestamp: now.getTime() - 7200000,
      status: 'active',
      colorTheme: 'blue',
      userFirstName: 'Priya',
      userLastName: 'Reddy',
      userGender: 'female',
      userDateOfBirth: '1998-03-22',
    },
    {
      passId: 'test-ordinary-weekly-003',
      name: 'Ordinary Weekly Pass',
      type: 'Ordinary',
      validFrom: weeklyValidFrom.toISOString(),
      validTill: weeklyValidTill.toISOString(),
      amount: 350,
      purchaseDate: now.toISOString(),
      purchaseTimestamp: now.getTime() - 86400000,
      status: 'active',
      colorTheme: 'black',
      userFirstName: 'Arun',
      userLastName: 'Kumar',
      userGender: 'male',
      userDateOfBirth: '1990-11-08',
    },
    {
      passId: 'test-vajra-gold-monthly-004',
      name: 'Vajra Gold Monthly Pass',
      type: 'AC',
      validFrom: monthlyValidFrom.toISOString(),
      validTill: monthlyValidTill.toISOString(),
      amount: 2000,
      purchaseDate: now.toISOString(),
      purchaseTimestamp: now.getTime() - 172800000,
      status: 'active',
      colorTheme: 'blue',
      userFirstName: 'Sneha',
      userLastName: 'Patil',
      userGender: 'female',
      userDateOfBirth: '1992-09-30',
    },
  ];
}

function generateExpiredPass(): PassData {
  const now = new Date();
  const expiredFrom = new Date(now);
  expiredFrom.setDate(expiredFrom.getDate() - 8);
  expiredFrom.setHours(0, 0, 0, 0);
  const expiredTill = new Date(now);
  expiredTill.setDate(expiredTill.getDate() - 1);
  expiredTill.setHours(23, 59, 59, 999);

  return {
    passId: 'test-expired-pass-005',
    name: 'Ordinary Weekly Pass',
    type: 'Ordinary',
    validFrom: expiredFrom.toISOString(),
    validTill: expiredTill.toISOString(),
    amount: 350,
    purchaseDate: expiredFrom.toISOString(),
    purchaseTimestamp: expiredFrom.getTime(),
    status: 'expired',
    colorTheme: 'black',
    userFirstName: 'Vikram',
    userLastName: 'Joshi',
    userGender: 'male',
    userDateOfBirth: '1988-04-12',
  };
}

export function seedTestPasses(): void {
  const existing = localStorage.getItem(TEST_PASSES_KEY);
  if (!existing) {
    const passes = generateTestPasses();
    localStorage.setItem(TEST_PASSES_KEY, JSON.stringify(passes));
    console.log('[TEST] Seeded active passes:', passes.length);
  }
  
  const existingExpired = localStorage.getItem(TEST_EXPIRED_PASS_KEY);
  if (!existingExpired) {
    const expired = generateExpiredPass();
    localStorage.setItem(TEST_EXPIRED_PASS_KEY, JSON.stringify(expired));
    console.log('[TEST] Seeded expired pass');
  }

  // Seed test verification data
  const existingVerifications = localStorage.getItem(TEST_VERIFICATION_KEY);
  if (!existingVerifications) {
    const verifications = [
      { passId: 'test-ordinary-day-001', selfieBase64: '', idType: 'Aadhar Card', idNumber: '1234', timestamp: Date.now() },
      { passId: 'test-vajra-gold-day-002', selfieBase64: '', idType: 'Aadhar Card', idNumber: '5678', timestamp: Date.now() },
      { passId: 'test-ordinary-weekly-003', selfieBase64: '', idType: 'PAN Card', idNumber: '9012', timestamp: Date.now() },
      { passId: 'test-vajra-gold-monthly-004', selfieBase64: '', idType: 'Aadhar Card', idNumber: '3456', timestamp: Date.now() },
      { passId: 'test-expired-pass-005', selfieBase64: '', idType: 'Aadhar Card', idNumber: '7890', timestamp: Date.now() },
    ];
    localStorage.setItem(TEST_VERIFICATION_KEY, JSON.stringify(verifications));
    console.log('[TEST] Seeded verifications');
  }
}

export function getTestActivePasses(): PassData[] {
  const data = localStorage.getItem(TEST_PASSES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getTestExpiredPass(): PassData | null {
  const data = localStorage.getItem(TEST_EXPIRED_PASS_KEY);
  return data ? JSON.parse(data) : null;
}

export function getTestVerification(passId: string) {
  const data = localStorage.getItem(TEST_VERIFICATION_KEY);
  if (!data) return null;
  const verifications = JSON.parse(data);
  return verifications.find((v: any) => v.passId === passId) || null;
}

export function saveTestActivePasses(passes: PassData[]): void {
  localStorage.setItem(TEST_PASSES_KEY, JSON.stringify(passes));
}

export function saveTestExpiredPass(pass: PassData | null): void {
  if (pass) {
    localStorage.setItem(TEST_EXPIRED_PASS_KEY, JSON.stringify(pass));
  } else {
    localStorage.removeItem(TEST_EXPIRED_PASS_KEY);
  }
}

export function clearTestPasses(): void {
  localStorage.removeItem(TEST_PASSES_KEY);
  localStorage.removeItem(TEST_EXPIRED_PASS_KEY);
  localStorage.removeItem(TEST_VERIFICATION_KEY);
  console.log('[TEST] Cleared all test pass data');
}
