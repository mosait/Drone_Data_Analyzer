// src/features/dashboard/Dashboard.tsx
import { useEffect } from 'react';
import { api } from '@/api/endpoints';
import { useDataStore } from '@/store/useDataStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileType, Download, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from '@/components/shared/FileUpload';
import { Loader } from 'lucide-react';
import { FolderMonitor } from '@/components/shared/FolderMonitor';
import { ExportDialog } from '@/components/shared/ExportDialog';

export default function Dashboard() {
  const { 
    currentData, 
    uploadFile, 
    recentFiles, 
    selectedFile, 
    loadRecentFiles,
    isLoading,
    error,
    clearError,
    uploadProgress,
    selectFile
  } = useDataStore();

  useEffect(() => {
    loadRecentFiles();
  }, []);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  const handleFileUpload = async (file: File) => {
    try {
      await uploadFile(file);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!selectedFile) return;
    
    try {
      const blob = await api.analysis.export(selectedFile.id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drone_data_${selectedFile.id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2">
          {/* Upload Area */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Drone Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload 
                onFileAccepted={handleFileUpload}
                maxSize={10}
                allowedTypes={['.csv', '.json']}
              />
            </CardContent>
          </Card>

          {/* Folder Monitor */}
          <Card className="mb-6">
            <FolderMonitor onFileFound={handleFileUpload} />
          </Card>

          {/* Flight Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Current Flight Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(currentData) && currentData.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Max Altitude</p>
                    <p className="text-2xl font-bold">
                      {Math.max(...currentData.map(d => d.gps.altitude))}m
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Flight Duration</p>
                    <p className="text-2xl font-bold">
                      {((new Date(currentData[currentData.length - 1].timestamp).getTime() -
                        new Date(currentData[0].timestamp).getTime()) / 60000).toFixed(1)}min
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="text-2xl font-bold">
                      {currentData.reduce((sum, d) => sum + d.radar.distance, 0).toFixed(1)}m
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-muted-foreground">
                    Select or upload a file to view metrics
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div>
          {/* Quick Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  className="w-full flex items-center gap-2 justify-center h-11"
                  variant="outline"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="h-5 w-5" />
                  Upload New File
                </Button>
                <ExportDialog selectedFile={selectedFile} disabled={!selectedFile} />
              </div>
            </CardContent>
          </Card>

          {/* Recent Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentFiles && recentFiles.length > 0 ? (
                <div className="space-y-4">
                  {recentFiles.map((file) => (
                    <Button
                      key={file.id}
                      variant="ghost"
                      className="w-full flex items-center justify-between p-2 h-auto"
                      onClick={() => selectFile(file)} 
                    >
                      <div className="flex items-center gap-2">
                        <FileType className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium truncate">
                          {file.filename}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(file.timestamp).toLocaleDateString()}
                      </span>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-muted-foreground">No recent files</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}