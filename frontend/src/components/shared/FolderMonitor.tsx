// src/components/shared/FolderMonitor.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, RefreshCcw, AlertCircle, FileIcon, Upload, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface FileInfo {
  name: string;
  handle: FileSystemFileHandle;
  lastModified?: number;
  path?: string;
}

interface StoredDirectoryInfo {
  name: string;
  handle: FileSystemDirectoryHandle;
}

interface FolderMonitorProps {
  onFileFound: (file: File) => Promise<void>;
}

export const FolderMonitor = ({ onFileFound }: FolderMonitorProps) => {
  const [watchPath, setWatchPath] = useState<string>('');
  const [isWatching, setIsWatching] = useState(false);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  
  const [storedDirectory, setStoredDirectory] = useLocalStorage<StoredDirectoryInfo | null>(
    'monitoredDirectory',
    null
  );

  // Restore directory on component mount
  useEffect(() => {
    const restoreDirectory = async () => {
      if (storedDirectory) {
        try {
          const handle = storedDirectory.handle;
          const permission = await handle.requestPermission({ mode: 'read' });
          
          if (permission === 'granted') {
            setDirectoryHandle(handle);
            setWatchPath(storedDirectory.name);
            setIsWatching(true);
            await scanDirectory(handle);
          } else {
            setStoredDirectory(null);
          }
        } catch (err) {
          console.error('Failed to restore directory:', err);
          setStoredDirectory(null);
        }
      }
    };

    restoreDirectory();
  }, []);

  const handleSelectFolder = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        throw new Error('Directory selection is not supported in your browser');
      }

      const dirHandle = await window.showDirectoryPicker({
        mode: 'read' as const,
      });
      
      setDirectoryHandle(dirHandle);
      setWatchPath(dirHandle.name);
      setError(null);
      setIsWatching(true);
      
      // Store directory info
      setStoredDirectory({
        name: dirHandle.name,
        handle: dirHandle
      });
      
      await scanDirectory(dirHandle);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      console.error('Failed to select directory:', err);
    }
  };

  const handleOpenFolder = async () => {
    if (!directoryHandle) return;
    
    try {
      const url = URL.createObjectURL(new Blob([]));
      const a = document.createElement('a');
      a.href = url;
      a.download = '.';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to open folder:', err);
      setError('Failed to open folder in explorer');
    }
  };

  const scanDirectory = async (handle: FileSystemDirectoryHandle | null = directoryHandle) => {
    if (!handle || isScanning) return;

    setIsScanning(true);
    try {
      const newFiles: FileInfo[] = [];
      
      for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
          const fileHandle = entry as FileSystemFileHandle;
          const fileName = entry.name.toLowerCase();
          
          if (fileName.endsWith('.csv') || fileName.endsWith('.json')) {
            const file = await fileHandle.getFile();
            newFiles.push({
              name: entry.name,
              handle: fileHandle,
              lastModified: file.lastModified
            });
          }
        }
      }

      // Sort files by last modified date
      newFiles.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
      setFiles(newFiles);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      console.error('Failed to scan directory:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (fileHandle: FileSystemFileHandle) => {
    try {
      const file = await fileHandle.getFile();
      await onFileFound(file);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      console.error('Failed to upload file:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Directory Monitor
          </div>
          {isWatching && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenFolder}
              title="Open in File Explorer"
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={handleSelectFolder}
            variant={isWatching ? "secondary" : "default"}
            className="w-full flex items-center gap-2 justify-center"
          >
            <Folder className="h-4 w-4" />
            {isWatching ? 'Change Directory' : 'Select Directory'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isWatching && (
            <>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="text-sm text-muted-foreground truncate flex-1">
                  Monitoring: {watchPath}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => scanDirectory()}
                  className="h-8 w-8 p-0 ml-2"
                  title="Refresh"
                  disabled={isScanning}
                >
                  <RefreshCcw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No CSV or JSON files found in directory
                  </p>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <FileIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFileUpload(file.handle)}
                        className="h-8 w-8 p-0"
                        title="Upload"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};