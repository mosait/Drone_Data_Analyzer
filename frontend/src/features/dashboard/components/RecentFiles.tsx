// src/features/dashboard/components/RecentFiles.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileType, Clock, X } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { FileUploadResponse } from '@/api/types';
import { Badge } from '@/components/ui/badge';
import { FileSlotDialog } from '@/components/shared/FileSlotDialog';

export const RecentFiles = () => {
  const { 
    recentFiles, 
    fileSlots,
    addFileToSlot,
    removeFileFromSlot
  } = useDataStore();

  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileUploadResponse | null>(null);

  const handleFileSelect = (file: FileUploadResponse) => {
    setSelectedFile(file);
    setSlotDialogOpen(true);
  };

  const handleSlotSelect = async (slot: 1 | 2) => {
    if (selectedFile) {
      await addFileToSlot(selectedFile, slot);
      setSlotDialogOpen(false);
      setSelectedFile(null);
    }
  };

  const getFileSlot = (fileId: string): number | null => {
    if (fileSlots.slot1?.id === fileId) return 1;
    if (fileSlots.slot2?.id === fileId) return 2;
    return null;
  };

  

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Files
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentFiles && recentFiles.length > 0 ? (
          <div className="space-y-2">
            {recentFiles.map((file) => {
              const slot = getFileSlot(file.id);
              return (
                <div
                  key={file.id}
                  className={`
                    flex items-center justify-between p-2 rounded-md
                    ${slot ? 'bg-primary/10' : 'hover:bg-muted/50'}
                    transition-colors
                  `}
                >
                  <div className="flex items-center gap-2">
                    <FileType className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium truncate">
                      {file.filename}
                    </span>
                    {slot && (
                      <Badge variant="secondary" className="ml-2">
                        Slot {slot}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(file.timestamp).toLocaleDateString()}
                    </span>
                    {slot ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => slot && removeFileFromSlot(slot as 1 | 2)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleFileSelect(file)}
                        disabled={Object.values(fileSlots).filter(Boolean).length >= 2}
                      >
                        <span className="sr-only">Select file</span>
                        <span className="text-xs">+</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">No recent files</p>
          </div>
        )}

        <FileSlotDialog
          open={slotDialogOpen}
          onOpenChange={setSlotDialogOpen}
          onSlotSelect={handleSlotSelect}
          file={selectedFile!}
        />
      </CardContent>
    </Card>
  );
};