/**
 * Returns the browser's IANA timezone.
 * Uses a safe fallback to UTC if detection fails.
 */
export const getBrowserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (error) {
    console.warn('Failed to detect browser timezone, falling back to UTC:', error);
    return 'UTC';
  }
};
