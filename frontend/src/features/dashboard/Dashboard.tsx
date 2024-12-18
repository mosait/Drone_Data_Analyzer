// src/features/dashboard/Dashboard.tsx
import { useState } from 'react';
import { api } from '../../api/endpoints';
import { FileUpload } from './components/FileUpload';
import { ProcessingStatus } from './components/ProcessingStatus';
import { QuickActions } from './components/QuickActions';
import { RecentFiles } from './components/RecentFiles';
import type { FileInfo, AnalysisProgress } from './types';

const Dashboard = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentFiles, setRecentFiles] = useState<FileInfo[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);
  const [exportQueue, setExportQueue] = useState<string[]>([]);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const response = await api.files.upload(file);
      setRecentFiles(prev => [{
        id: response.id,
        name: response.filename,
        timestamp: response.timestamp,
        analyzed: false
      }, ...prev].slice(0, 5));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = async () => {
    const fileId = recentFiles[0]?.id;
    if (!fileId) return;

    setAnalysisProgress({ fileId, progress: 0, status: 'processing' });
    try {
      await api.analysis.analyze(fileId);
      setAnalysisProgress({ fileId, progress: 100, status: 'complete' });
      setRecentFiles(prev => 
        prev.map(file => 
          file.id === fileId ? { ...file, analyzed: true } : file
        )
      );
    } catch (error) {
      setAnalysisProgress(prev => 
        prev ? { ...prev, status: 'error' } : null
      );
    }
  };

  const handleExport = async () => {
    const fileId = recentFiles[0]?.id;
    if (!fileId) return;

    setExportQueue(prev => [...prev, fileId]);
    try {
      await api.analysis.export(fileId, 'csv');
    } finally {
      setExportQueue(prev => prev.filter(id => id !== fileId));
    }
  };

  const handleQuickLoad = async (fileId: string) => {
    setIsProcessing(true);
    try {
      await api.data.get(fileId);
      // Handle the loaded data
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <FileUpload onFileAccepted={handleFileUpload} />

      <ProcessingStatus 
        analysisProgress={analysisProgress}
        exportQueue={exportQueue}
      />

      <QuickActions
        onImport={() => document.querySelector('input[type="file"]')?.click()}
        onAnalyze={handleAnalyze}
        onExport={handleExport}
        hasFiles={recentFiles.length > 0}
        hasAnalyzedFiles={recentFiles.some(f => f.analyzed)}
      />

      <RecentFiles
        files={recentFiles}
        onQuickLoad={handleQuickLoad}
      />
    </div>
  );
};

export default Dashboard;