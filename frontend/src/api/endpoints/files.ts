  // src/api/endpoints/files.ts
  import { apiClient } from '../client'
  import type { FileUploadResponse } from '../types'
  
  export const filesApi = {
    upload: async (file: File): Promise<FileUploadResponse> => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await apiClient.post<FileUploadResponse>('/api/v1/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return data
    }
  }