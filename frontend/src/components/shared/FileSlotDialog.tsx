// src/components/shared/FileSlotDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUploadResponse } from "@/api/types";
import { useDataStore } from "@/store/useDataStore";

interface FileSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSlotSelect: (slot: 1 | 2) => void;
  file: FileUploadResponse | null;
}

export const FileSlotDialog = ({ 
  open, 
  onOpenChange, 
  onSlotSelect,
  file 
}: FileSlotDialogProps) => {
  const { fileSlots } = useDataStore();

  const handleSlotSelect = (slot: 1 | 2) => {
    // If slot is occupied, show confirmation
    if (fileSlots[`slot${slot}`]) {
      if (confirm(`Replace "${fileSlots[`slot${slot}`]?.filename}" with "${file?.filename}"?`)) {
        onSlotSelect(slot);
      }
    } else {
      onSlotSelect(slot);
    }
  };

  if (!file) return null;

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
              onClick={() => handleSlotSelect(1)}
            >
              <span className="text-2xl">1</span>
              <span className="text-sm">
                {fileSlots.slot1 ? (
                  <span className="text-xs text-muted-foreground">
                    Replace: {fileSlots.slot1.filename}
                  </span>
                ) : 'Empty Slot'}
              </span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2"
              onClick={() => handleSlotSelect(2)}
            >
              <span className="text-2xl">2</span>
              <span className="text-sm">
                {fileSlots.slot2 ? (
                  <span className="text-xs text-muted-foreground">
                    Replace: {fileSlots.slot2.filename}
                  </span>
                ) : 'Empty Slot'}
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};