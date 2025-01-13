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
        const transformedData = transformDroneData(data);
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
        
        if (!data || !data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid data format received');
        }

        return data;
      } catch (error) {
        console.error('Error in flightData.getProcessedData:', error);
        throw error;
      }
    }
  },

  analysis: {
    export: async (fileId: string, format: 'csv' | 'json'): Promise<Blob> => {
      try {
        const response = await apiClient.get<{ data: DroneData[] }>(`/api/v1/data/${fileId}`);
        const data = response.data.data;

        if (format === 'csv') {
          return createCSVBlob(data);
        } else {
          return createJSONBlob(data);
        }
      } catch (error) {
        console.error('Export error:', error);
        throw error;
      }
    }
  }
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function createCSVBlob(data: DroneData[]): Blob {
  // Create CSV header
  const headers = ['timestamp', 'latitude', 'longitude', 'altitude', 'radar_distance'];
  
  // Create CSV rows
  const rows = data.map(item => [
    formatTime(item.timestamp),
    item.gps.latitude,
    item.gps.longitude,
    item.gps.altitude,
    item.radar.distance
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

function createJSONBlob(data: DroneData[]): Blob {
  const formattedData = data.map(item => ({
    timestamp: formatTime(item.timestamp),
    gps: {
      latitude: item.gps.latitude,
      longitude: item.gps.longitude,
      altitude: item.gps.altitude
    },
    radar: {
      distance: item.radar.distance
    }
  }));

  return new Blob(
    [JSON.stringify(formattedData, null, 2)], 
    { type: 'application/json;charset=utf-8;' }
  );
}