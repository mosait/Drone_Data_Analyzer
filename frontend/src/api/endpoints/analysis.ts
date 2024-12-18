// src/api/endpoints/analysis.ts
import { apiClient } from '../client'

export const analysisApi = {
  analyze: async (fileId: string) => {
    const { data } = await apiClient.post(`/api/v1/analyze`, { fileId })
    return data
  }
}