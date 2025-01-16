// src/components/shared/FileSlotDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUploadResponse } from "@/api/types";
import { useDataStore } from "@/store/useDataStore";

interface FileSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSlotSelect: (slot: 1 | 2) => void;
  file: FileUploadResponse | null; // Make file optional
}

export const FileSlotDialog = ({ 
  open, 
  onOpenChange, 
  onSlotSelect,
  file 
}: FileSlotDialogProps) => {
  const { fileSlots } = useDataStore();

  // Check which slots are available
  const slot1Used = !!fileSlots.slot1;
  const slot2Used = !!fileSlots.slot2;

  if (!file) return null; // Don't render if no file is selected

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select File Slot</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Choose which slot to use for: <span className="font-medium">{file.filename}</span>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2"
              onClick={() => onSlotSelect(1)}
              disabled={slot1Used}
            >
              <span className="text-2xl">1</span>
              <span className="text-sm">
                {slot1Used ? (
                  <span className="text-xs text-muted-foreground">
                    {fileSlots.slot1?.filename || 'Occupied'}
                  </span>
                ) : 'File Slot 1'}
              </span>
            </Button>
            <Button 
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => onSlotSelect(2)}
              disabled={slot2Used}
            >
              <span className="text-2xl">2</span>
              <span className="text-sm">
                {slot2Used ? (
                  <span className="text-xs text-muted-foreground">
                    {fileSlots.slot2?.filename || 'Occupied'}
                  </span>
                ) : 'File Slot 2'}
              </span>
            </Button>
          </div>
          {(slot1Used && slot2Used) && (
            <p className="text-sm text-destructive">
              Remove a file from an existing slot to add a new file.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};