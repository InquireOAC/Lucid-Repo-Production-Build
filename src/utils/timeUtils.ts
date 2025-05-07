
/**
 * Formats seconds into a MM:SS format
 * @param seconds Number of seconds to format
 * @returns Formatted time string as MM:SS
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};
