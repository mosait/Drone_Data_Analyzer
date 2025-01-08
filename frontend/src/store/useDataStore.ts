// src/store/useDataStore.ts
import { create } from 'zustand';
import { api } from '../api/endpoints';
import type { DroneData, FileUploadResponse, ProcessedFlightData } from '../api/types';

interface DataState {
  selectedFile: FileUploadResponse | null;
  currentFile: FileUploadResponse | null;
  currentData: DroneData[] | null;
  processedData: ProcessedFlightData | null;
  recentFiles: FileUploadResponse[];
  error: string | null;
  isLoading: boolean;
  setCurrentFile: (file: FileUploadResponse) => Promise<void>;
  loadRecentFiles: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  selectedFile: null,
  currentFile: null,
  currentData: null,
  processedData: null,
  recentFiles: [],
  error: null,
  isLoading: false,

  setCurrentFile: async (file) => {
    try {
      set({ isLoading: true, error: null });
      
      // Load raw data
      const rawData = await api.data.get(file.id);
      
      // Load processed data
      const processedData = await api.flightData.getProcessedData(file.id);
      
      set({ 
        currentFile: file, 
        currentData: rawData, 
        processedData: processedData.data,
        error: null 
      });
    } catch (error) {
      set({ error: 'Failed to load file data' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadRecentFiles: async () => {
    try {
      const files = await api.files.getAll();
      set({ recentFiles: files, error: null });
    } catch (error) {
      set({ error: 'Failed to load recent files' });
    }
  },

  uploadFile: async (file: File) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.files.upload(file);
      if (response.status === 'success') {
        await get().loadRecentFiles();
        await get().setCurrentFile(response);
      }
    } catch (error) {
      set({ error: 'Failed to upload file' });
    } finally {
      set({ isLoading: false });
    }
  }
}));