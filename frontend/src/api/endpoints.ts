// src/api/endpoints.ts
import { apiClient } from './client';
import { transformDroneData } from '@/utils/data-transformers';
import type { 
  FileUploadResponse, 
  DroneData, 
  ProcessedFlightData
} from '@/api/types';

export const api = {
  files: {
    upload: async (file: File): Promise<FileUploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post<FileUploadResponse>('/api/v1/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    
    getAll: async (): Promise<FileUploadResponse[]> => {
      const { data } = await apiClient.get<FileUploadResponse[]>('/api/v1/files');
      return data;
    }
  },

  data: {
    get: async (fileId: string): Promise<DroneData[]> => {
      try {
        const { data } = await apiClient.get(`/api/v1/data/${fileId}`);
        console.log('API Response for get:', data);
        const transformedData = transformDroneData(data);
        console.log('Transformed data:', transformedData);
        return transformedData;
      } catch (error) {
        console.error('Error in data.get:', error);
        throw error;
      }
    }
  },

  flightData: {
    getProcessedData: async (fileId: string): Promise<ProcessedFlightData> => {
      try {
        const { data } = await apiClient.get(`/api/v1/data/${fileId}?include_summary=true`);
        console.log('API Response for processed data:', data);
        
        // Get the drone data
        const droneData = transformDroneData(data);
        
        if (!droneData.length) {
          throw new Error('No flight data available');
        }

        // Calculate time series
        const startTime = new Date(droneData[0].timestamp);
        const timeSeriesPoints = droneData.map(point => {
          const currentTime = new Date(point.timestamp);
          const duration = (currentTime.getTime() - startTime.getTime()) / (1000 * 60);

          return {
            duration,
            altitude: point.gps.altitude,
            distance: point.radar.distance,
            avgAltitude: 0,
            avgDistance: 0
          };
        });

        // Calculate statistics
        const altitudes = droneData.map(d => d.gps.altitude);
        const distances = droneData.map(d => d.radar.distance);
        
        const avgAltitude = altitudes.reduce((a, b) => a + b, 0) / altitudes.length;
        const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;

        // Add averages to time series points
        timeSeriesPoints.forEach(point => {
          point.avgAltitude = avgAltitude;
          point.avgDistance = avgDistance;
        });

        // Create the processed data structure
        const processedData: ProcessedFlightData = {
          summary: {
            altitude: {
              max: Math.max(...altitudes),
              min: Math.min(...altitudes),
              avg: avgAltitude,
              change: `${(altitudes[altitudes.length - 1] - altitudes[0]).toFixed(1)}`
            },
            radar: {
              max: Math.max(...distances),
              min: Math.min(...distances),
              avg: avgDistance,
              change: `${(distances[distances.length - 1] - distances[0]).toFixed(1)}`
            }
          },
          timeSeries: {
            points: timeSeriesPoints,
            averages: {
              altitude: avgAltitude,
              distance: avgDistance
            }
          }
        };

        console.log('Processed data:', processedData);
        return processedData;
      } catch (error) {
        console.error('Error in flightData.getProcessedData:', error);
        throw error;
      }
    }
  },

  analysis: {
    export: async (fileId: string, format: 'csv' | 'json'): Promise<Blob> => {
      const { data } = await apiClient.get(`/api/v1/analyze/${fileId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return data;
    }
  }
};