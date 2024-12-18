// src/components/shared/FileUpload.tsx
import { useState, useCallback } from 'react';
import { Upload, FileType, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

interface FileUploadProps {
  onFileAccepted: (file: File) => Promise<void>;
  maxSize?: number; // in MB
  allowedTypes?: string[]; // e.g., ['.csv', '.json']
}

export const FileUpload = ({
  onFileAccepted,
  maxSize = 10, // 10MB default
  allowedTypes = ['.csv', '.json']
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return `Only ${allowedTypes.join(', ')} files are allowed`;
    }

    return null;
  };

  const handleFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      await onFileAccepted(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleFile(file);
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-8
        ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
        ${error ? 'border-destructive bg-destructive/5' : ''}
        transition-colors duration-200
      `}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="p-4 bg-primary/10 rounded-full">
          <FileType className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-lg font-semibold">
            Drag files or click to upload
          </p>
          <p className="text-sm text-muted-foreground">
            Supports {allowedTypes.join(', ')} files up to {maxSize}MB
          </p>
          <input
            type="file"
            className="hidden"
            accept={allowedTypes.join(',')}
            onChange={handleFileInput}
            id="file-input"
          />
          <button
            onClick={() => document.getElementById('file-input')?.click()}
            className="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Select File
          </button>
        </div>
      </div>

      {isUploading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div className="text-primary">Uploading...</div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};