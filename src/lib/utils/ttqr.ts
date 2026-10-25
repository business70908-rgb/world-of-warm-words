/**
 * TTQR - Time-based Timestamped QR utility
 * Generates dynamic QR data with timestamp for security
 */

export interface TTQRData {
  passID: string;
  timestamp: number;
}

/**
 * Generate QR data with current timestamp
 */
export const generateTTQRData = (passId: string): string => {
  const data: TTQRData = {
    passID: passId,
    timestamp: Date.now()
  };
  return JSON.stringify(data);
};

/**
 * Hook for auto-updating QR timestamp
 */
export const useTTQRTimestamp = (intervalMs: number = 500): number => {
  const [timestamp, setTimestamp] = React.useState(Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [intervalMs]);

  return timestamp;
};

// React import for hook
import React from 'react';
