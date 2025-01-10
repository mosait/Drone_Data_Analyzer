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
    console.log('Setting current file:', file.id);
    try {
      set({ isLoading: true, error: null });
      
      // Load raw data
      console.log('Loading raw data...');
      const rawData = await api.data.get(file.id);
      
      // Load processed data
      console.log('Loading processed data...');
      const processedResponse = await api.flightData.getProcessedData(file.id);
      
      console.log('Setting new state...');
      set({ 
        currentFile: file, 
        currentData: rawData, 
        processedData: processedResponse.data,
        error: null,
        isLoading: false
      });
      
      console.log('Current file set successfully');
    } catch (error) {
      console.error('Error setting current file:', error);
      set({ 
        error: 'Failed to load file data',
        currentData: null,
        processedData: null,
        isLoading: false
      });
    }
  },

  loadRecentFiles: async () => {
    console.log('Loading recent files...');
    try {
      const files = await api.files.getAll();
      set({ recentFiles: files, error: null });
      console.log('Recent files loaded:', files.length);
    } catch (error) {
      console.error('Error loading recent files:', error);
      set({ error: 'Failed to load recent files', recentFiles: [] });
    }
  },

  uploadFile: async (file: File) => {
    console.log('Starting file upload...');
    try {
      set(state => ({ 
        ...initialState,
        recentFiles: state.recentFiles,
        isLoading: true 
      }));
      
      set({ uploadProgress: 10 });
      console.log('Uploading file...');
      const response = await api.files.upload(file);
      
      set({ uploadProgress: 50 });
      console.log('File uploaded, loading recent files...');
      await get().loadRecentFiles();
      
      set({ uploadProgress: 75 });
      console.log('Setting current file...');
      await get().setCurrentFile(response);
      
      set({ 
        selectedFile: response,
        uploadProgress: 100,
        isLoading: false
      });
      
      console.log('Upload completed successfully');
      
      // Reset progress after a delay
      setTimeout(() => {
        set({ uploadProgress: 0 });
      }, 1000);
    } catch (error) {
      console.error('Error during upload:', error);
      set({ 
        error: 'Failed to upload file',
        currentData: null,
        processedData: null,
        isLoading: false,
        uploadProgress: 0
      });
    }
  },

  selectFile: async (file: FileUploadResponse) => {
    console.log('Selecting file:', file.id);
    try {
      set({ isLoading: true, selectedFile: file });
      await get().setCurrentFile(file);
    } catch (error) {
      console.error('Error selecting file:', error);
      set({ error: 'Failed to select file', isLoading: false });
    }
  }
}));