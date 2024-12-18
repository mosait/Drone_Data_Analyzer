// src/api/types.ts
export interface DroneData {
    timestamp: string;
    altitude: number;     // in meters
    gps: {
      latitude: number;
      longitude: number;
    };
    radar: {
      distance: number;  // distance to nearest object in meters
      velocity: number;  // relative velocity in m/s
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
        minRadarDistance: number; // closest approach to any object
      };
      timeRange: {
        start: string;
        end: string;
      };
    };
  }