// src/components/shared/ImportDialog.tsx
import { useState, useCallback } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ImportDialogProps {
  onFileUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

export function ImportDialog({ onFileUpload, disabled }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    
    try {
      await onFileUpload(file);
      // Ensure we close the dialog after successful upload
      setOpen(false);
      setIsUploading(false);
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Failed to upload file");
      setIsUploading(false);
    }
  }, [onFileUpload]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!isUploading) {
      setOpen(newOpen);
      if (!newOpen) {
        setError(null);
      }
    }
  }, [isUploading]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="w-full flex items-center gap-2 justify-center h-11"
          variant="outline"
          disabled={disabled || isUploading}
        >
          <Upload className="h-5 w-5" />
          Import Data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
        </DialogHeader>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
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