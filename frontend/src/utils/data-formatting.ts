// src/utils/data-formatting.ts
// Only keep lightweight formatting and display-related utilities
export const formatDistance = (meters: number): string => {
    return meters < 1000 
      ? `${meters.toFixed(1)}m` 
      : `${(meters/1000).toFixed(2)}km`;
  }
  
  export const formatVelocity = (mps: number): string => {
    return `${mps.toFixed(1)} m/s`;
  }
  
  export const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return hours > 0 
      ? `${hours}h ${minutes % 60}m` 
      : `${minutes}m ${Math.floor(seconds % 60)}s`;
  }