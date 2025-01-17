// src/store/useDataStore.ts
import { create } from 'zustand';
import { api } from '../api/endpoints';
import type { 
  DroneData, 
  FileUploadResponse,
  FlightMetrics
} from '../api/types';

interface FileSlots {
  slot1: FileUploadResponse | null;
  slot2: FileUploadResponse | null;
}

interface DataState {
  fileSlots: FileSlots;
  selectedFiles: FileUploadResponse[]; // Keep this for backwards compatibility
  currentFiles: FileUploadResponse[]; // Keep this for backwards compatibility
  currentDataMap: Record<string, DroneData[]>;
  metricsMap: Record<string, {
    flightMetrics: FlightMetrics | null;
    timeSeries: any[] | null;
    summary: any | null;
  }>;
  recentFiles: FileUploadResponse[];
  error: string | null;
  isLoading: boolean;
  uploadProgress: number;

  currentFile: FileUploadResponse | null;
  currentData: DroneData[] | null;
  metrics: {
    flightMetrics: FlightMetrics | null;
    timeSeries: any[] | null;
    summary: any | null;
  } | null;
}

interface DataActions {
  loadRecentFiles: () => Promise<void>;
  uploadFile: (file: File) => Promise<FileUploadResponse>;
  addFileToSlot: (file: FileUploadResponse, slot: 1 | 2) => Promise<void>;
  removeFileFromSlot: (slot: 1 | 2) => void;
  clearError: () => void;
  setUploadProgress: (progress: number) => void;
  reset: () => void;
}

const initialState: DataState = {
  fileSlots: {
    slot1: null,
    slot2: null
  },
  selectedFiles: [], // Initialize empty array
  currentFiles: [], // Initialize empty array
  currentDataMap: {},
  metricsMap: {},
  recentFiles: [],
  error: null,
  isLoading: false,
  uploadProgress: 0,

  metrics: null,
  currentFile: null,
  currentData: null,
};

export const useDataStore = create<DataState & DataActions>((set, get) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  reset: () => set(initialState),

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
      set({ uploadProgress: 100 });
      
      return response;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      set({ isLoading: false });
      setTimeout(() => get().setUploadProgress(0), 1000);
    }
  },

  addFileToSlot: async (file: FileUploadResponse, slot: 1 | 2) => {
    try {
      set({ isLoading: true, error: null });
      
      const processedData = await api.data.get(file.id);
      
      set(state => {
        // Update slots
        const newFileSlots = {
          ...state.fileSlots,
          [`slot${slot}`]: file
        };

        // Compute selected and current files from slots
        const selectedFiles = Object.values(newFileSlots).filter((f): f is FileUploadResponse => f !== null);

        return {
          fileSlots: newFileSlots,
          selectedFiles,
          currentFiles: selectedFiles,
          currentDataMap: {
            ...state.currentDataMap,
            [file.id]: processedData.data
          },
          metricsMap: {
            ...state.metricsMap,
            [file.id]: processedData.metrics
          },
          error: null
        };
      });
    } catch (error) {
      console.error('Error adding file to slot:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add file to slot'
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeFileFromSlot: (slot: 1 | 2) => {
    set(state => {
      const fileInSlot = state.fileSlots[`slot${slot}`];
      if (!fileInSlot) return state;

      // Create new file slots
      const newFileSlots = {
        ...state.fileSlots,
        [`slot${slot}`]: null
      };

      // Get remaining selected files
      const selectedFiles = Object.values(newFileSlots).filter((f): f is FileUploadResponse => f !== null);

      // Remove data for the file being removed if it's not in the other slot
      const isFileInOtherSlot = selectedFiles.some(f => f.id === fileInSlot.id);
      
      const newDataMap = isFileInOtherSlot 
        ? state.currentDataMap 
        : Object.fromEntries(
            Object.entries(state.currentDataMap).filter(([id]) => id !== fileInSlot.id)
          );

      const newMetricsMap = isFileInOtherSlot
        ? state.metricsMap
        : Object.fromEntries(
            Object.entries(state.metricsMap).filter(([id]) => id !== fileInSlot.id)
          );

      return {
        fileSlots: newFileSlots,
        selectedFiles,
        currentFiles: selectedFiles,
        currentDataMap: newDataMap,
        metricsMap: newMetricsMap
      };
    });
  },
}));