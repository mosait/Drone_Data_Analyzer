// src/api/endpoints.ts
import { apiClient } from './client';
import type { 
  FileUploadResponse, 
  DroneData, 
  ProcessedFlightData,
  FlightDataResponse 
} from './types';

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
      const { data } = await apiClient.get<{ data: DroneData[] }>(`/api/v1/data/${fileId}`);
      return data.data; // Note: Backend returns { data: [...] }
    }
  },

  flightData: {
    getProcessedData: async (fileId: string): Promise<ProcessedFlightData> => {
      const { data } = await apiClient.get<FlightDataResponse>(
        `/api/v1/data/${fileId}?include_summary=true`
      );
      return data.data;
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