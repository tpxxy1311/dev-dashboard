// src/lib/helpers/duration.ts

/**
 * Formats a duration in seconds as hours and minutes, rounded down to the
 * minute: "3 h 12 min", "45 min", "2 h", "0 min".
 */
export const formatDuration = (seconds: number): string => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
};
