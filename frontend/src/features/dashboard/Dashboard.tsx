// src/features/dashboard/Dashboard.tsx
import { useEffect, useState, useRef } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileType } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Loader } from 'lucide-react';
import { FolderMonitor } from '@/components/shared/FolderMonitor';
import { FlightComparison } from './components/FlightComparison';
import { FileSlotDialog } from '@/components/shared/FileSlotDialog';
import { FileUploadResponse } from '@/api/types';
import { FileUploadError } from '@/components/shared/FileUploadError';
import { QuickActions } from './components/QuickActions';
import { RecentFiles } from './components/RecentFiles';

export default function Dashboard() {
  const { 
    uploadFile, 
    loadRecentFiles,
    isLoading,
    uploadProgress,
    addFileToSlot,
  } = useDataStore();
  const [error, setError] = useState<string | null>(null);
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileUploadResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const triggerFileInput = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleFileUpload(file);
    }
  };
  
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setError(null);
      const response = await uploadFile(file);
      setUploadedFile(response);
      setSlotDialogOpen(true);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to upload file';
      setError(errorMessage);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleSlotSelect = async (slot: 1 | 2) => {
    if (uploadedFile) {
      try {
        await addFileToSlot(uploadedFile, slot);
        setSlotDialogOpen(false);
        setUploadedFile(null);
      } catch (error) {
        console.error('Failed to add file to slot')
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
    <div className="container mx-auto px-6 py-2">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".csv,.json"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {error && (
        <FileUploadError 
          error={error}
          onDismiss={() => setError(null)}
        />
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
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-8 h-[255px]
                  ${dragActive ? 'border-primary bg-primary/10' : ''}
                  hover:border-primary hover:bg-primary/5
                  transition-colors duration-200
                  cursor-pointer
                `}
                onClick={triggerFileInput}
                onDrop={handleDrop}
                onDragOver={handleDrag}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
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
          <QuickActions onUploadClick={triggerFileInput} />
          <RecentFiles />
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