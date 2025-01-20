// src/api/endpoints.ts
import { apiClient } from './client';
import type { 
  FileUploadResponse,
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
    },

    delete: async (fileId: string): Promise<void> => {
      await apiClient.delete(`/api/v1/files/${fileId}`);
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