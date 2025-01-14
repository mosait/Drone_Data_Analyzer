// src/utils/data-transformers.ts
import type { DroneData } from '@/api/types';

export const transformDroneData = (responseData: any): DroneData[] => {
  // Check if the data is wrapped in a data field
  const rawData = responseData.data ? responseData.data : responseData;

  if (!Array.isArray(rawData)) {
    console.error('Data is not an array:', rawData);
    return [];
  }

  return rawData.map(item => {
    if (!item.timestamp || !item.gps || !item.radar) {
      console.error('Invalid item structure:', item);
      throw new Error('Invalid data format');
    }

    // Ensure timestamp is in HH:MM:SS format
    const timestamp = typeof item.timestamp === 'string' ? 
      item.timestamp : 
      new Date(item.timestamp).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

    return {
      timestamp,
      gps: {
        latitude: Number(item.gps.latitude),
        longitude: Number(item.gps.longitude),
        altitude: Number(item.gps.altitude)
      },
      radar: {
        distance: Number(item.radar.distance)
      }
    };
  });
};