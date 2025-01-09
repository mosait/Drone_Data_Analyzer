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

export interface DirectoryWatchResponse {
  success: boolean;
  path: string;
}

export interface FileSystemError {
  name: string;
  message: string;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

export interface AnalysisResult {
  fileId: string;
  results: {
    metrics: {
      avgAltitude: number;
      maxAltitude: number;
      minAltitude: number;
      totalDistance: number;
      minRadarDistance: number;
    };
    timeRange: {
      start: string;
      end: string;
    };
  };
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
}

export interface ProcessedFlightData {
  summary: {
    altitude: {
      max: number;
      min: number;
      avg: number;
      change: string;
    };
    radar: {
      max: number;
      min: number;
      avg: number;
      change: string;
    };
  };
  timeSeries: {
    points: {
      duration: number;
      altitude: number;
      distance: number;
      avgAltitude: number;
      avgDistance: number;
    }[];
    averages: {
      altitude: number;
      distance: number;
    };
  };
}

// API endpoint response type
export interface FlightDataResponse {
  data: ProcessedFlightData;
}