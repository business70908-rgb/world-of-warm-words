/**
 * Date formatting utilities for consistent date display
 */

/**
 * Format date to "DD Mon YYYY, HH:MM AM/PM"
 */
export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const formattedDate = date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return `${formattedDate}, ${formattedTime}`;
};

/**
 * Format validity date with optional end-of-day time
 */
export const formatValidityDate = (dateStr: string, isEndOfDay: boolean = false): string => {
  const date = new Date(dateStr);
  const formattedDate = date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
  const time = isEndOfDay ? '11:59 PM' : '12:00 AM';
  return `${formattedDate}, ${time}`;
};

/**
 * Get pass type from pass name
 */
export const getPassType = (passName: string): string => {
  if (passName.includes('Day Pass')) return 'Daily';
  if (passName.includes('Weekly Pass')) return 'Weekly';
  if (passName.includes('Monthly Pass') || 
      passName === 'Vayu Vajra Gold Pass' || 
      passName === 'Vajra Gold Monthly Pass') return 'Monthly';
  return 'Daily';
};

/**
 * Get badge positioning based on pass type
 */
export const getBadgePosition = (passType: string): string => {
  switch (passType) {
    case 'Weekly': return '333px';
    case 'Monthly': return '343px';
    default: return '313px'; // Daily
  }
};

/**
 * Get badge left offset based on pass type
 */
export const getBadgeLeftOffset = (passType: string): string => {
  switch (passType) {
    case 'Daily': return '5px';
    case 'Weekly': return '14px';
    case 'Monthly': return '21px';
    default: return '5px';
  }
};
