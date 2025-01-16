// src/api/endpoints.ts
import { apiClient } from './client';
import { transformDroneData } from '@/utils/data-transformers';
import type { 
  FileUploadResponse, 
  DroneData, 
  ProcessedData 
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
    get: async (fileId: string): Promise<ProcessedData> => {
      try {
        const { data } = await apiClient.get<ProcessedData>(`/api/v1/data/${fileId}`);
        return data;
      } catch (error) {
        console.error('Error in data.get:', error);
        throw error;
      }
    }
  },

  analysis: {
    export: async (fileId: string, format: 'csv' | 'json'): Promise<Blob> => {
      try {
        const response = await apiClient.get(`/api/v1/data/${fileId}/export?format=${format}`, {
          responseType: 'blob'  // Important for handling binary data
        });
        
        return response.data;
      } catch (error) {
        console.error('Export error:', error);
        throw error;
      }
    }
  }
}

function formatTime(dateStr: string): string {
  return dateStr; // Time is already in HH:MM:SS format
}

function createCSVBlob(data: DroneData[]): Blob {
  console.log('Creating CSV blob from data:', data);
  
  // Create CSV header
  const headers = ['timestamp', 'latitude', 'longitude', 'altitude', 'radar_distance'];
  
  // Create CSV rows
  const rows = data.map(item => [
    item.timestamp,
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
  console.log('Creating JSON blob from data:', data);
  return new Blob(
    [JSON.stringify(data, null, 2)], 
    { type: 'application/json;charset=utf-8;' }
  );
}