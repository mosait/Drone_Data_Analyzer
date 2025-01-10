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

  setUploadProgress: (progress) => {
    console.log('Setting upload progress:', progress);
    set({ uploadProgress: progress });
  },

  reset: () => {
    console.log('Resetting state to initial');
    set(initialState);
  },

  setCurrentFile: async (file) => {
    console.log('Setting current file:', file.id);
    try {
      set({ isLoading: true, error: null });
      
      // Load raw data
      console.log('Loading raw data...');
      const rawData = await api.data.get(file.id);
      console.log('Raw data loaded:', rawData);

      if (!rawData || !Array.isArray(rawData)) {
        throw new Error('Invalid raw data format received');
      }
      
      // Load processed data
      console.log('Loading processed data...');
      const processedData = await api.flightData.getProcessedData(file.id);
      console.log('Processed data loaded:', processedData);

      if (!processedData || !processedData.summary) {
        throw new Error('Invalid processed data format received');
      }
      
      set({ 
        currentFile: file, 
        currentData: rawData, 
        processedData: processedData,
        error: null
      });
      console.log('State updated successfully');
    } catch (error) {
      console.error('Error in setCurrentFile:', error);
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
    console.log('Loading recent files...');
    try {
      const files = await api.files.getAll();
      console.log('Recent files loaded:', files);
      set({ recentFiles: files, error: null });
    } catch (error) {
      console.error('Error loading recent files:', error);
      set({ error: 'Failed to load recent files', recentFiles: [] });
    }
  },

  uploadFile: async (file: File) => {
    console.log('Starting file upload:', file.name);
    try {
      set(state => ({ 
        ...initialState,
        recentFiles: state.recentFiles,
        isLoading: true 
      }));
      
      set({ uploadProgress: 10 });
      console.log('Uploading file...');
      const response = await api.files.upload(file);
      console.log('Upload response:', response);
      
      set({ uploadProgress: 50 });
      
      // Load recent files
      console.log('Loading recent files...');
      await get().loadRecentFiles();
      
      set({ uploadProgress: 75 });
      
      // Set current file
      console.log('Setting current file...');
      await get().setCurrentFile(response);
      
      set({ 
        selectedFile: response,
        uploadProgress: 100
      });
      
      console.log('Upload process completed');
    } catch (error) {
      console.error('Error during upload:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to upload file',
        currentData: null,
        processedData: null
      });
    } finally {
      set({ isLoading: false });
      // Reset progress after a delay
      setTimeout(() => get().setUploadProgress(0), 1000);
    }
  },

  selectFile: async (file: FileUploadResponse) => {
    console.log('Selecting file:', file.id);
    try {
      set({ isLoading: true, selectedFile: file });
      await get().setCurrentFile(file);
    } catch (error) {
      console.error('Error selecting file:', error);
      set({ error: 'Failed to select file' });
    } finally {
      set({ isLoading: false });
    }
  }
}));