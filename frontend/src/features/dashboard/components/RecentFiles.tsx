// src/features/dashboard/components/RecentFiles.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileType, Clock } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';

export const RecentFiles = () => {
  const { recentFiles, selectedFile, selectFile } = useDataStore();

  const handleFileSelect = (file: any) => {
    // Don't upload a new file, just select the existing one
    selectFile(file);
  };

  return (
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
                className={`w-full flex items-center justify-between p-2 h-auto ${
                  selectedFile?.id === file.id ? 'bg-primary/10' : ''
                }`}
                onClick={() => handleFileSelect(file)}
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
  );
};