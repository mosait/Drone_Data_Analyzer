// src/api/endpoints/data.ts
import { apiClient } from '../client'
import type { AnalysisData } from '../types'

export const dataApi = {
  getData: async () => {
    const { data } = await apiClient.get<AnalysisData[]>('/api/v1/data')
    return data
  }
}