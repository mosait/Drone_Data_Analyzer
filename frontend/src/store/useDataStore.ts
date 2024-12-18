// src/store/useDataStore.ts
import { create } from 'zustand';
import { api } from '../api/endpoints';
import type { DroneData, FileUploadResponse } from '../api/types';

interface DataState {
  selectedFile: FileUploadResponse | null;
  recentFiles: FileUploadResponse[];
  currentData: DroneData[] | null;
  error: string | null;
  setSelectedFile: (file: FileUploadResponse) => Promise<void>;
  loadRecentFiles: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  selectedFile: null,
  recentFiles: [],
  currentData: null,
  error: null,

  setSelectedFile: async (file) => {
    try {
      const data = await api.data.get(file.id);
      set({ selectedFile: file, currentData: data, error: null });
    } catch (error) {
      set({ error: 'Failed to load file data' });
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

  uploadFile: async (file) => {
    try {
      const response = await api.files.upload(file);
      if (response.status === 'success') {
        await get().loadRecentFiles();
        await get().setSelectedFile(response);
      }
    } catch (error) {
      set({ error: 'Failed to upload file' });
    }
  }
}));