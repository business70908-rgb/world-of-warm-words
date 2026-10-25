// Device ID management
const DEVICE_ID_KEY = 'device_uuid';

// Non-mutating getter: returns existing ID if present, otherwise null
export const getDeviceId = (): string | null => {
  try {
    return localStorage.getItem(DEVICE_ID_KEY) || null;
  } catch {
    return null;
  }
};

// Ensures an ID exists ONLY when explicitly called (e.g., on login submit)
export const ensureDeviceId = (): string => {
  let deviceId = getDeviceId();
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

export const clearDeviceId = (): void => {
  try {
    localStorage.removeItem(DEVICE_ID_KEY);
  } catch {
    // no-op
  }
};
