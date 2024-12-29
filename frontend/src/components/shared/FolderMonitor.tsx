// src/components/shared/FolderMonitor.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, RefreshCcw } from 'lucide-react';
import { api } from '@/api/endpoints';


interface FolderMonitorProps {
  onFileFound: (file: File) => Promise<void>;
}

export const FolderMonitor = ({ onFileFound }: FolderMonitorProps) => {
  const [watchPath, setWatchPath] = useState<string>('');
  const [isWatching, setIsWatching] = useState(false);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectFolder = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        throw new Error('Directory selection is not supported in your browser');
      }

      // Type assertion to access the showDirectoryPicker
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'read' as const,
      });
      
      setDirectoryHandle(dirHandle);
      setWatchPath(dirHandle.name);
      setError(null);
      
      // Start watching the directory
      const response = await api.folders.setWatchPath(dirHandle.name);
      setIsWatching(response.success);

    } catch (err) {
      // User cancelled or browser doesn't support the API
      const errorMessage = err instanceof Error ? err.message : 'Failed to select directory';
      setError(errorMessage);
      console.error('Failed to select directory:', err);
    }
  };

  const handleRefresh = async () => {
    if (!directoryHandle) return;

    try {
      // Scan the directory for .csv and .json files
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file') {
          // Type assertion as we know it's a file handle
          const fileHandle = entry as FileSystemFileHandle;
          if (entry.name.endsWith('.csv') || entry.name.endsWith('.json')) {
            const file = await fileHandle.getFile();
            // Notify parent component
            await onFileFound(file);
          }
        }
      }
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh directory';
      setError(errorMessage);
      console.error('Failed to refresh directory:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Directory Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleSelectFolder}
              variant={isWatching ? "secondary" : "default"}
              className="w-full flex items-center gap-2 justify-center"
            >
              <Folder className="h-4 w-4" />
              {isWatching ? 'Change Directory' : 'Select Directory'}
            </Button>
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          {isWatching && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground truncate flex-1">
                Monitoring: {watchPath}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRefresh}
                className="h-8 w-8 p-0 ml-2"
                title="Refresh"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};