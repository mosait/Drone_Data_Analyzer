// src/utils/data-transformers.ts
import type { DroneData } from '@/api/types';

export const transformDroneData = (responseData: any): DroneData[] => {
  console.log('Raw response:', responseData);
  
  // Check if the data is wrapped in a data field
  const rawData = responseData.data ? responseData.data : responseData;
  console.log('Extracted data:', rawData);

  if (!Array.isArray(rawData)) {
    console.error('Data is not an array:', rawData);
    return [];
  }

  return rawData.map(item => {
    if (!item.timestamp || !item.gps || !item.radar) {
      console.error('Invalid item structure:', item);
      throw new Error('Invalid data format');
    }

    return {
      timestamp: item.timestamp,
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