// src/components/shared/ImportDialog.tsx
import { useState, useCallback, useRef } from "react";
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { FileUploadError } from './FileUploadError';
import { useDataStore } from '@/store/useDataStore';
import { FileUploadResponse } from '@/api/types';
import { FileSlotDialog } from './FileSlotDialog';

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

  const triggerFileInput = () => {
    setError(null); // Clear error before opening file dialog
    fileInputRef.current?.click();
  };

  const handleFileUpload = useCallback(async (fileOrFiles: File | FileList) => {
    setIsUploading(true);
    setError(null); // Clear any existing errors
    
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
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to upload file';
      setError(errorMessage);
      
      // Clear input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      setError(null); // Clear any errors after successful slot assignment
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to add file to slot';
      setError(errorMessage);
    }
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

      {error && (
        <div className="mb-2">
          <FileUploadError 
            error={error}
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      <Button
        className="w-full flex items-center gap-2 justify-center h-11"
        variant="outline"
        onClick={triggerFileInput}
        disabled={disabled || isUploading}
      >
        <Upload className="h-5 w-5" />
        Import Data
        {isUploading && <span className="ml-2">...</span>}
      </Button>

      <FileSlotDialog
        open={slotDialogOpen}
        onOpenChange={setSlotDialogOpen}
        onSlotSelect={handleSlotSelect}
        file={uploadedFile}
      />
    </>
  );
}