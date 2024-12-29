// src/api/endpoints.ts
import { apiClient } from './client';
import type { FileUploadResponse, DroneData, AnalysisResult } from './types';
import { DirectoryWatchResponse } from '@/api/types';

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
    
    getAll: async () => {
      const { data } = await apiClient.get<FileUploadResponse[]>('/api/v1/files');
      return data;
    }
  },

  folders: {
    setWatchPath: async (path: string): Promise<DirectoryWatchResponse> => {
      const { data } = await apiClient.post('/api/v1/folders/watch', { path });
      return data;
    },
    
    scanDirectory: async () => {
      const { data } = await apiClient.post('/api/v1/folders/scan');
      return data;
    }
},

  data: {
    get: async (fileId: string): Promise<DroneData[]> => {
      const { data } = await apiClient.get<DroneData[]>(`/api/v1/data/${fileId}`);
      return data;
    }
  },

  analysis: {
    analyze: async (fileId: string): Promise<AnalysisResult> => {
      const { data } = await apiClient.post<AnalysisResult>(`/api/v1/analyze/${fileId}`);
      return data;
    },
    
    export: async (fileId: string, format: 'csv' | 'json') => {
      const { data } = await apiClient.get(`/api/v1/analyze/${fileId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return data;
    }
  }
};