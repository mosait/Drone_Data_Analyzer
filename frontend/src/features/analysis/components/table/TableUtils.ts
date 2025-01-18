// src/features/analysis/components/table/TableUtils.ts
import { DroneData } from "@/api/types";

export interface TableRow {
  index: number;
  timestamp: string;
  latitude: number;
  longitude: number;
  altitude: number;
  distance: number;
}

export function processTableData(data: DroneData[]): TableRow[] {
  return data.map((item, index) => ({
    index: index + 1,
    timestamp: item.timestamp,
    latitude: item.gps.latitude,
    longitude: item.gps.longitude,
    altitude: item.gps.altitude,
    distance: item.radar.distance
  }));
}

export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

export const formatTimestamp = (timestamp: string): string => {
  return timestamp;  // Add any specific formatting if needed
};