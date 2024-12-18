// src/store/useDataStore.ts
import { create } from 'zustand'
import type { DroneData } from '../api/types'
import type { FileInfo } from '../features/dashboard/types'
import { api } from '../api/endpoints'

interface DataState {
  // Data
  selectedFile: FileInfo | null;
  recentFiles: FileInfo[];
  currentData: DroneData[] | null;
  
  // Status
  isLoading: boolean;
  error: string | null;
  
  // Actions
  uploadFile: (file: File) => Promise<void>;
  selectFile: (file: FileInfo) => Promise<void>;
  clearSelectedFile: () => void;
  refreshData: () => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  // Initial state
  selectedFile: null,
  recentFiles: [],
  currentData: null,
  isLoading: false,
  error: null,

  // Actions
  uploadFile: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.files.upload(file);
      
      const newFile: FileInfo = {
        id: response.id,
        filename: response.filename,
        timestamp: response.timestamp,
        status: 'success'
      };
      
      set(state => ({ 
        recentFiles: [newFile, ...state.recentFiles].slice(0, 5),
        selectedFile: newFile,
        isLoading: false 
      }));
      
      // Load the data for the new file
      await get().selectFile(newFile);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to upload file',
        isLoading: false 
      });
    }
  },

  selectFile: async (file: FileInfo) => {
    set({ isLoading: true, error: null, selectedFile: file });
    try {
      const data = await api.data.get(file.id);
      set({ 
        currentData: data,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false 
      });
    }
  },

  clearSelectedFile: () => {
    set({ 
      selectedFile: null,
      currentData: null,
      error: null 
    });
  },

  refreshData: async () => {
    const { selectedFile } = get();
    if (!selectedFile) return;

    set({ isLoading: true, error: null });
    try {
      const data = await api.data.get(selectedFile.id);
      set({ 
        currentData: data,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to refresh data',
        isLoading: false 
      });
    }
  }
}));