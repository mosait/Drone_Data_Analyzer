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

export interface StatsSummary {
  max: number;
  min: number;
  avg: number;
  change: string;
}

export interface ProcessedFlightData {
  summary: {
    altitude: StatsSummary;
    radar: StatsSummary;
  };
  timeSeries: {
    points: Array<{
      duration: number;
      altitude: number;
      distance: number;
      avgAltitude: number;
      avgDistance: number;
    }>;
    averages: {
      altitude: number;
      distance: number;
    };
  };
}

export interface FlightDataResponse {
  data: ProcessedFlightData;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  timestamp: string;
  status: 'success' | 'error' | 'processing';
}