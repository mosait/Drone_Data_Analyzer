// src/api/types.ts
export interface DroneData {
  timestamp: string;
  altitude: number;
  gps: {
    latitude: number;
    longitude: number;
  };
  radar: {
    distance: number;
    velocity: number;
  };
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
      maxVelocity: number;
      avgVelocity: number;
      minRadarDistance: number;
    };
    timeRange: {
      start: string;
      end: string;
    };
  };
}