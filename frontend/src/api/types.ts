// src/api/types.ts

export interface GPSData {
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface RadarData {
  distance: number;
}

export interface DroneData {
  timestamp: string;  // Format: HH:MM:SS
  gps: GPSData;
  radar: RadarData;
}

export interface FlightMetrics {
  duration: number;
  maxAltitude: number;
  minAltitude: number;
  avgAltitude: number;
  maxDistance: number;
  minDistance: number;
  avgDistance: number;
  totalPoints: number;
  startTime: string;
  endTime: string;
}

export interface StatsSummary {
  max: number;
  min: number;
  avg: number;
  change: number;
}

export interface TimeSeriesPoint {
  duration: number;
  altitude: number;
  distance: number;
  time: string;
}

export interface ProcessedData {
  data: DroneData[];
  metrics: {
    flightMetrics: FlightMetrics;
    timeSeries: TimeSeriesPoint[];
    summary: {
      altitude: StatsSummary;
      radar: StatsSummary;
    };
  };
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  timestamp: string;
  status: 'success' | 'error' | 'processing';
}

export interface FileSlots {
  slot1: FileUploadResponse | null;
  slot2: FileUploadResponse | null;
}