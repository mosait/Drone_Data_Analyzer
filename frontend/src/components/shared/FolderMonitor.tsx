// src/components/shared/FolderMonitor.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, RefreshCcw, AlertCircle, FileIcon, Upload } from 'lucide-react';
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
  path: string;
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

  // Get directory path using File System Access API
  const getDirectoryPath = async (handle: FileSystemDirectoryHandle): Promise<string> => {
    try {
      // First try to get the path using the modern File System Access API
      // @ts-ignore: Newer API feature
      if (handle.resolve) {
        // @ts-ignore: Newer API feature
        const relativePaths = await handle.resolve();
        if (relativePaths) {
          return '/' + relativePaths.join('/');
        }
      }

      // If that fails, try to get at least some path information from a file in the directory
      for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
          const file = await (entry as FileSystemFileHandle).getFile();
          // The webkitRelativePath might give us more path information
          if (file.webkitRelativePath) {
            const parts = file.webkitRelativePath.split('/');
            return '/' + parts.slice(0, -1).join('/');
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error getting directory path:', error);
    }

    // Fallback to just the name if we can't get the full path
    return handle.name;
  };

  // Restore directory on component mount
  useEffect(() => {
    const restoreDirectory = async () => {
      if (storedDirectory?.handle) {
        try {
          // Request permission with { mode: 'read' }
          const permissionResult = await storedDirectory.handle.requestPermission({
            mode: 'read'
          });

          if (permissionResult === 'granted') {
            // Verify we can actually access the directory by trying to read it
            try {
              const dirHandle = storedDirectory.handle;
              // Try to read the directory
              const entriesIterator = dirHandle.values();
              await entriesIterator.next(); // Try to read first entry

              setDirectoryHandle(dirHandle);
              setWatchPath(storedDirectory.name);
              
              setIsWatching(true);
              await scanDirectory(dirHandle);
            } catch (e) {
              throw new Error('Failed to access directory');
            }
          } else {
            throw new Error('Permission denied');
          }
        } catch (err) {
          console.error('Failed to restore directory:', err);
          setStoredDirectory(null);
          setError('Please select the directory again to regrant access.');
        }
      }
    };

    restoreDirectory();
  }, []);

  // Scan directory periodically
  useEffect(() => {
    if (!isWatching || !directoryHandle) return;

    const scanInterval = setInterval(() => {
      scanDirectory(directoryHandle);
    }, 5000); // Scan every 5 seconds

    return () => {
      clearInterval(scanInterval);
    };
  }, [isWatching, directoryHandle]);

  const handleSelectFolder = async () => {
    try {
      // Check browser support
      if (!('showDirectoryPicker' in window)) {
        throw new Error('Directory selection is not supported in your browser. Please use a modern browser like Chrome or Edge.');
      }
  
      // Request directory access
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read',
        // Request persistent permission and start in desktop
        startIn: 'desktop'
      }).catch((e) => {
        // Handle abort specifically
        if (e.name === 'AbortError') {
          throw new Error('Folder selection was cancelled. Please select a folder to continue.');
        }
        throw e;  // Re-throw other errors
      });
  
      // Verify permission
      const permissionResult = await dirHandle.requestPermission({
        mode: 'read'
      }).catch(() => {
        throw new Error('Permission denied. Please allow access to the selected folder to continue monitoring.');
      });
  
      if (permissionResult !== 'granted') {
        throw new Error('Permission denied. Please allow access to the selected folder to continue monitoring.');
      }
  
      // Get the full path
      const path = await getDirectoryPath(dirHandle).catch((e) => {
        console.error('Error getting directory path:', e);
        return dirHandle.name; // Fallback to just the name
      });
      
      console.log('Selected directory path:', path);
      
      // Update state
      setDirectoryHandle(dirHandle);
      setWatchPath(dirHandle.name);
      setError(null);
      setIsWatching(true);
      
      // Store directory info with verified permission
      const directoryInfo = {
        name: dirHandle.name,
        handle: dirHandle,
        path: path
      };
      
      setStoredDirectory(directoryInfo);
  
      // Initial scan of the directory
      await scanDirectory(dirHandle).catch((e) => {
        console.error('Initial scan error:', e);
        throw new Error('Failed to scan the selected folder. Please try again.');
      });
  
    } catch (err) {
      console.error('Directory selection error:', err);
      
      // User-friendly error messages
      let errorMessage: string;
      
      if (err instanceof Error) {
        if (err.name === 'SecurityError') {
          errorMessage = 'Access to the folder was denied by your browser. Please try again and allow access when prompted.';
        } else if (err.name === 'AbortError' || err.message.includes('cancelled')) {
          errorMessage = 'Folder selection was cancelled. Please select a folder to monitor.';
        } else if (err.message.includes('Permission denied')) {
          errorMessage = 'Permission denied. Please allow access to the selected folder to continue monitoring.';
        } else if (err.message.includes('not supported')) {
          errorMessage = 'This feature is not supported in your browser. Please use Chrome, Edge, or another modern browser.';
        } else if (err.message.includes('scan')) {
          errorMessage = 'Failed to read the folder contents. Please check if the folder is accessible and try again.';
        } else {
          errorMessage = err.message;
        }
      } else {
        errorMessage = 'An unexpected error occurred while setting up folder monitoring. Please try again.';
      }
  
      setError(errorMessage);
      
      // Reset states on error
      setIsWatching(false);
      setDirectoryHandle(null);
      setWatchPath('');
      setFiles([]);
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
      console.error('Failed to scan directory:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to scan directory');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (fileHandle: FileSystemFileHandle) => {
    try {
      const file = await fileHandle.getFile();
      await onFileFound(file);
    } catch (err) {
      console.error('Failed to upload file:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to upload file');
      }
    }
  };

  // Continue with existing return JSX...
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Directory Monitor
          </div>
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
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm text-muted-foreground truncate flex-1">
                    Monitoring Folder: {watchPath}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => scanDirectory()}
                      className="h-8 w-8 p-0"
                      title="Refresh"
                      disabled={isScanning}
                    >
                      <RefreshCcw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
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