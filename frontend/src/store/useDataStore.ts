// src/store/useDataStore.ts
import { create } from 'zustand';
import { api } from '../api/endpoints';
import type { 
  DroneData, 
  FileUploadResponse, 
  ProcessedFlightData 
} from '../api/types';

interface DataState {
  selectedFile: FileUploadResponse | null;
  currentFile: FileUploadResponse | null;
  currentData: DroneData[] | null;
  processedData: ProcessedFlightData | null;
  recentFiles: FileUploadResponse[];
  error: string | null;
  isLoading: boolean;
  uploadProgress: number;
}

interface DataActions {
  setCurrentFile: (file: FileUploadResponse) => Promise<void>;
  loadRecentFiles: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  selectFile: (file: FileUploadResponse) => Promise<void>;
  clearError: () => void;
  setUploadProgress: (progress: number) => void;
  reset: () => void;
}

const initialState: DataState = {
  selectedFile: null,
  currentFile: null,
  currentData: null,
  processedData: null,
  recentFiles: [],
  error: null,
  isLoading: false,
  uploadProgress: 0,
};

export const useDataStore = create<DataState & DataActions>((set, get) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  reset: () => set(initialState),

  setCurrentFile: async (file) => {
    try {
      set({ isLoading: true, error: null });
      
      // Load raw data
      const rawData = await api.data.get(file.id);
      
      // Load processed data
      const processedResponse = await api.flightData.getProcessedData(file.id);
      
      set({ 
        currentFile: file, 
        currentData: rawData, 
        processedData: processedResponse,
        error: null
      });
    } catch (error) {
      console.error('Error setting current file:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load file data',
        currentData: null,
        processedData: null
      });
    } finally {
      set({ isLoading: false });
    }
  },

  loadRecentFiles: async () => {
    try {
      const files = await api.files.getAll();
      set({ recentFiles: files, error: null });
    } catch (error) {
      console.error('Error loading recent files:', error);
      set({ error: 'Failed to load recent files', recentFiles: [] });
    }
  },

  uploadFile: async (file: File) => {
    try {
      set({ isLoading: true, error: null, uploadProgress: 10 });
      
      const response = await api.files.upload(file);
      set({ uploadProgress: 50 });
      
      await get().loadRecentFiles();
      set({ uploadProgress: 75 });
      
      await get().setCurrentFile(response);
      
      set({ 
        selectedFile: response,
        uploadProgress: 100
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to upload file',
        currentData: null,
        processedData: null
      });
    } finally {
      set({ isLoading: false });
      setTimeout(() => get().setUploadProgress(0), 1000);
    }
  },

  selectFile: async (file: FileUploadResponse) => {
    try {
      set({ isLoading: true, selectedFile: file });
      
      // Load data for the selected file
      const rawData = await api.data.get(file.id);
      const processedResponse = await api.flightData.getProcessedData(file.id);
      
      set({ 
        currentFile: file, 
        currentData: rawData, 
        processedData: processedResponse,
        error: null
      });
    } catch (error) {
      console.error('Error selecting file:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load file data',
        currentData: null,
        processedData: null
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));