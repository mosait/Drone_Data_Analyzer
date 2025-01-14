// src/components/shared/ImportDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { FileUpload } from "./FileUpload";

interface ImportDialogProps {
  onFileUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}


  
export function ImportDialog({ onFileUpload, disabled }: ImportDialogProps) {
    const [open, setOpen] = useState(false);
  
    const handleFileUpload = async (file: File) => {
      try {
        await onFileUpload(file);
        // Close the dialog after successful upload
        setOpen(false);
      } catch (error) {
        console.error("Upload error:", error);
        // Close the dialog even if upload fails
        setOpen(false);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full flex items-center gap-2 justify-center h-11"
            variant="outline"
            disabled={disabled}
            onClick={() => setOpen(true)} // Manually open dialog
          >
            <Upload className="h-5 w-5" />
            Import Data
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <FileUpload
              onFileAccepted={handleFileUpload}
              maxSize={10}
              allowedTypes={['.csv', '.json']}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }