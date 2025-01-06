// src/utils/data-transformers.ts
import { DroneData, DroneDataRow } from '../api/types';

export const transformDroneData = (data: DroneData[]): DroneDataRow[] => {
  return data.map(item => ({
    time: item.timestamp,
    latitude: item.gps.latitude,
    longitude: item.gps.longitude,
    gps_altitude: item.gps.altitude,
    radar_distance: item.radar.distance,
    altitude: item.altitude
  }));
};