// src/api/types.ts
export interface DroneData {
  timestamp: string;
  gps: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  radar: {
    distance: number;
  };
}

export interface DroneDataRow {
  time: string;
  latitude: number;
  longitude: number;
  altitude: number;
  radar_distance: number;
}

export interface StatsSummary {
  max: number;
  min: number;
  avg: number;
  change: string;
}

export interface TimeSeriesPoint {
  duration: number;
  altitude: number;
  distance: number;
  avgAltitude: number;
  avgDistance: number;
}

export interface ProcessedFlightData {
  summary: {
    altitude: StatsSummary;
    radar: StatsSummary;
  };
  timeSeries: {
    points: TimeSeriesPoint[];
    averages: {
      altitude: number;
      distance: number;
    };
  };
}

export interface FlightDataResponse {
  data: ProcessedFlightData;
}

// This matches the actual backend response structure
export interface FlightDataResponse {
  data: {
    summary: {
      altitude: StatsSummary;
      radar: StatsSummary;
    };
    timeSeries: {
      points: TimeSeriesPoint[];
      averages: {
        altitude: number;
        distance: number;
      };
    };
  };
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  timestamp: string;
  status: 'success' | 'error' | 'processing';
}

export interface DirectoryWatchResponse {
  success: boolean;
  path: string;
}