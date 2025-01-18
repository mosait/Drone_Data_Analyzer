// src/store/useDataStore.ts
import { create } from 'zustand';
import { api } from '../api/endpoints';
import type { 
  DroneData, 
  FileUploadResponse,
  FlightMetrics,
  FileSlots
} from '../api/types';

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
  selectedFiles: [],
  currentFiles: [],
  currentDataMap: {},
  metricsMap: {},
  recentFiles: [],
  error: null,
  isLoading: false,
  uploadProgress: 0,
};

// Helper function to format error messages
const formatErrorMessage = (error: any): string => {
  // If we received a detailed error message from our backend validator
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    // Format backend validation messages
    if (detail.includes("Missing required columns")) {
      return `File Structure Error\n${detail}\nEnsure your CSV file has all required columns`;
    }
    if (detail.includes("Invalid timestamp format")) {
      return `Invalid Time Format\n${detail}\nMake sure all timestamps are in HH:MM:SS format`;
    }
    if (detail.includes("Non-numeric values")) {
      return `Invalid Data Type\n${detail}\nAll coordinate and distance values must be numbers`;
    }
    if (detail.includes("Missing GPS fields")) {
      return `Missing Data\n${detail}\nCheck that your JSON file has the correct structure`;
    }
    // Return other backend messages as is
    return `Validation Error\n${detail}`;
  }

  // Handle common HTTP errors
  if (error.response?.status === 413) {
    return 'File Too Large\nThe maximum allowed file size is 10MB\nTry compressing your file';
  }
  if (error.response?.status === 415) {
    return 'Invalid File Type\nOnly .csv and .json files are supported\nCheck your file extension';
  }

  // Handle network errors
  if (error.message === 'Network Error') {
    return 'Connection Error\nCould not reach the server\nPlease check your internet connection';
  }

  // Fallback for unexpected errors
  return 'Upload Failed\nAn unexpected error occurred\nPlease try again or contact support';
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
      
      // Client-side validation
      if (!file.name.match(/\.(csv|json)$/i)) {
        throw new Error('Invalid File Type\nOnly .csv and .json files are supported\nCheck your file extension');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error(
          `File Too Large\nMaximum size: 10MB\nCurrent size: ${(file.size / (1024 * 1024)).toFixed(1)}MB`
        );
      }

      const response = await api.files.upload(file);
      set({ uploadProgress: 50 });
      
      await get().loadRecentFiles();
      set({ uploadProgress: 100 });
      
      return response;
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      throw new Error(errorMessage);
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