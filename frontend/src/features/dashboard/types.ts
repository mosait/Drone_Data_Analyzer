// src/features/dashboard/types.ts
export interface FileInfo {
  id: string;
  filename: string;
  timestamp: string;
  status: 'success' | 'error' | 'processing';
  analyzed?: boolean;
}

export interface AnalysisProgress {
  fileId: string;
  progress: number;
  status: 'processing' | 'complete' | 'error';
}