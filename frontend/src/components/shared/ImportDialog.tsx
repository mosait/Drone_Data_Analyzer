// src/components/shared/ImportDialog.tsx
import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useDataStore } from "@/store/useDataStore";
import { FileSlotDialog } from "./FileSlotDialog";
import type { FileUploadResponse } from "@/api/types";

interface ImportDialogProps {
  disabled?: boolean;
}

export function ImportDialog({ disabled }: ImportDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileUploadResponse | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, addFileToSlot } = useDataStore();

  const handleFileUpload = useCallback(async (fileOrFiles: File | FileList) => {
    setIsUploading(true);
    setError(null);
    
    try {
      const file = fileOrFiles instanceof File ? fileOrFiles : fileOrFiles[0];
      const response = await uploadFile(file);
      setUploadedFile(response);
      setSlotDialogOpen(true);
      
      // Clear input for reuse
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  }, [uploadFile]);

  const handleSlotSelect = async (slot: 1 | 2) => {
    if (!uploadedFile) return;

    try {
      await addFileToSlot(uploadedFile, slot);
      setSlotDialogOpen(false);
      setUploadedFile(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add file to slot");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".csv,.json"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files);
          }
        }}
      />

      <Button
        className="w-full flex items-center gap-2 justify-center h-11"
        variant="outline"
        onClick={triggerFileInput}
        disabled={disabled || isUploading}
      >
        <Upload className="h-5 w-5" />
        Import Data
      </Button>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FileSlotDialog
        open={slotDialogOpen}
        onOpenChange={setSlotDialogOpen}
        onSlotSelect={handleSlotSelect}
        file={uploadedFile}
      />
    </>
  );
}