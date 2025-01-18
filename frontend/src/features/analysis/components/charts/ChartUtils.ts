// src/features/analysis/components/charts/ChartUtils.ts
import { DroneData } from "@/api/types";

export interface ChartMetrics {
  avg: number;
  min: number;
  max: number;
  change: number;
}

export function calculateAltitudeMetrics(data: DroneData[]): ChartMetrics {
  const altitudes = data.map(d => d.gps.altitude);
  return {
    avg: altitudes.reduce((a, b) => a + b) / altitudes.length,
    min: Math.min(...altitudes),
    max: Math.max(...altitudes),
    change: altitudes[altitudes.length - 1] - altitudes[0]
  };
}

export function calculateRadarMetrics(data: DroneData[]): ChartMetrics {
  const distances = data.map(d => d.radar.distance);
  return {
    avg: distances.reduce((a, b) => a + b) / distances.length,
    min: Math.min(...distances),
    max: Math.max(...distances),
    change: distances[distances.length - 1] - distances[0]
  };
}

export const getGradientColors = (index: number) => {
  const colors = [
    { main: '#8884d8', light: '#8884d8' },
    { main: '#82ca9d', light: '#82ca9d' },
    { main: '#ffc658', light: '#ffc658' },
    { main: '#ff7300', light: '#ff7300' }
  ];
  return colors[index % colors.length];
};

export function processTimeSeriesData(data: DroneData[]) {
  return data.map((item, index) => ({
    time: index,
    timestamp: item.timestamp,
    altitude: item.gps.altitude,
    distance: item.radar.distance
  }));
}