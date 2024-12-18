// src/features/dashboard/components/RecentFiles.tsx
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { FileType, Clock } from 'lucide-react';
import { useDataStore } from '../../../store/useDataStore';

export const RecentFiles = () => {
  const { recentFiles, selectedFile, selectFile } = useDataStore();

  if (!recentFiles?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Files</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {recentFiles.map(file => (
            <li 
              key={file.id} 
              className={`flex items-center justify-between p-3 rounded-md transition-colors
                ${selectedFile?.id === file.id ? 'bg-primary/10' : 'bg-accent/10 hover:bg-accent/20'}`}
            >
              <div className="flex items-center gap-2">
                <FileType className="h-4 w-4 text-primary" />
                <span>{file.filename}</span>
                {file.analyzed && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Analyzed
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedFile?.id === file.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => selectFile(file)}
                  className="flex items-center gap-1"
                >
                  <Clock className="h-4 w-4" />
                  {selectedFile?.id === file.id ? 'Selected' : 'Load'}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {new Date(file.timestamp).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};