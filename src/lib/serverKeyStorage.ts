// Server key persistence on the device
const KEY_STORAGE = 'tummoc_server_key';
const VALIDATED_AT_STORAGE = 'tummoc_server_key_validated_at';

export const serverKeyStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(KEY_STORAGE);
    } catch {
      return null;
    }
  },

  save(key: string): void {
    try {
      localStorage.setItem(KEY_STORAGE, key);
    } catch {
      // no-op
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(KEY_STORAGE);
      localStorage.removeItem(VALIDATED_AT_STORAGE);
    } catch {
      // no-op
    }
  },

  getLastValidated(): number {
    try {
      return Number(localStorage.getItem(VALIDATED_AT_STORAGE) || 0);
    } catch {
      return 0;
    }
  },

  touchValidatedAt(): void {
    try {
      localStorage.setItem(VALIDATED_AT_STORAGE, String(Date.now()));
    } catch {
      // no-op
    }
  },
};
