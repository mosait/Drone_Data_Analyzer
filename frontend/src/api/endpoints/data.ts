// src/api/endpoints/data.ts
import { apiClient } from '../client'
import type { DroneData, ProcessedFlightData } from '../types'

export const dataApi = {
  getData: async () => {
    const { data } = await apiClient.get<DroneData[]>('/api/v1/data')
    return data
  },
  
  getProcessedData: async (fileId: string): Promise<ProcessedFlightData> => {
    const { data } = await apiClient.get(`/api/v1/data/${fileId}?include_summary=true`)
    return data
  }
}