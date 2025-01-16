// src/features/dashboard/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileType, Download, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from '@/components/shared/FileUpload';
import { Loader, AlertCircle } from 'lucide-react';
import { FolderMonitor } from '@/components/shared/FolderMonitor';
import { ExportDialog } from '@/components/shared/ExportDialog';
import { FlightComparison } from './components/FlightComparison';
import { FileSlotDialog } from '@/components/shared/FileSlotDialog';
import { FileUploadResponse } from '@/api/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Dashboard() {
  const { 
    fileSlots,
    uploadFile, 
    recentFiles, 
    loadRecentFiles,
    isLoading,
    error,
    clearError,
    uploadProgress,
    addFileToSlot
  } = useDataStore();

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileUploadResponse | null>(null);

  useEffect(() => {
    loadRecentFiles();
  }, []);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    try {
      const response = await uploadFile(file);
      setUploadedFile(response);
      setSlotDialogOpen(true);
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
    }
  };

  const handleSlotSelect = async (slot: 1 | 2) => {
    if (uploadedFile) {
      try {
        await addFileToSlot(uploadedFile, slot);
        setSlotDialogOpen(false);
        setUploadedFile(null);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : 'Failed to add file to slot');
      }
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
              <Dialog 
                open={isUploadDialogOpen} 
                onOpenChange={(open) => setIsUploadDialogOpen(open)}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Drone Data</DialogTitle>
                  </DialogHeader>
                  {uploadError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}
                  <FileUpload 
                    onFileAccepted={handleFileUpload}
                    maxSize={10}
                    allowedTypes={['.csv', '.json']}
                  />
                </DialogContent>
              </Dialog>
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-8
                  hover:border-primary hover:bg-primary/5
                  transition-colors duration-200
                  cursor-pointer
                `}
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <FileType className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      Drag files or click to upload
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports .csv, .json files up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Folder Monitor */}
          <Card className="mb-6">
            <FolderMonitor onFileFound={handleFileUpload} />
          </Card>

          {/* Flight Comparison */}
          <FlightComparison />

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <Card className="mt-6">
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
          )}
        </div>

        {/* Right Column */}
        <div>
          {/* Quick Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col justify-center space-y-4">
                <Button
                  className="w-full flex items-center gap-2 justify-center h-11"
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(true)}
                >
                  <Upload className="h-5 w-5" />
                  Upload New File
                </Button>
                <ExportDialog disabled={!fileSlots.slot1 && !fileSlots.slot2} />
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
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {recentFiles.map((file) => (
                    <Button
                      key={file.id}
                      variant="ghost"
                      className="w-full flex items-center justify-between p-2 h-auto"
                      onClick={() => {
                        setUploadedFile(file);
                        setSlotDialogOpen(true);
                      }}
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
      </div>

      <FileSlotDialog
        open={slotDialogOpen}
        onOpenChange={setSlotDialogOpen}
        onSlotSelect={handleSlotSelect}
        file={uploadedFile}
      />
    </div>
  );
}