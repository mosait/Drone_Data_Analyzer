// src/features/dashboard/components/QuickActions.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { Separator } from '@/components/ui/separator';
import { ExportDialog } from '@/components/shared/ExportDialog';

interface QuickActionsProps {
  onUploadClick: () => void;
}

export const QuickActions = ({ onUploadClick }: QuickActionsProps) => {
  const { fileSlots, removeFileFromSlot } = useDataStore();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col justify-center space-y-4">
          <Button
            className="w-full flex items-center gap-2 justify-center h-11"
            variant="outline"
            onClick={onUploadClick}
          >
            <Upload className="h-5 w-5" />
            Upload New File
          </Button>
          <ExportDialog disabled={!fileSlots.slot1 && !fileSlots.slot2} />
          
          {/* File Management section */}
          {(fileSlots.slot1 || fileSlots.slot2) && (
            <>
              <Separator className="my-2" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Manage Files</p>
                {fileSlots.slot1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => removeFileFromSlot(1)}
                  >
                    <span className="truncate">Slot 1: {fileSlots.slot1.filename}</span>
                    <X className="h-4 w-4 ml-2" />
                  </Button>
                )}
                {fileSlots.slot2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => removeFileFromSlot(2)}
                  >
                    <span className="truncate">Slot 2: {fileSlots.slot2.filename}</span>
                    <X className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};