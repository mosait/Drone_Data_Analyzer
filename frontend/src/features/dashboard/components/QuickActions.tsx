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
  const hasFiles = fileSlots.slot1 || fileSlots.slot2;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="min-h-[255px]">
          <div className="space-y-4">
            <Button
              className="w-full flex items-center gap-2 justify-center h-11"
              variant="outline"
              onClick={onUploadClick}
            >
              <Upload className="h-5 w-5" />
              Upload New File
            </Button>
            <ExportDialog disabled={!hasFiles} />
          </div>

          <div className="mt-8">
            <Separator className="mb-4" />
            <p className="text-sm font-medium mb-2">Manage Files</p>
            {hasFiles ? (
              <div className="space-y-2">
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
            ) : (
              <p className="text-sm text-muted-foreground">No files selected</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};