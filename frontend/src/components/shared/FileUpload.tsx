// src/components/shared/FileUpload.tsx
import { useState, useCallback } from 'react';
import { Upload, X, FileType, AlertCircle } from 'lucide-react';
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

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsUploading(true);
      await onFileAccepted(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  }, [onFileAccepted, maxSize, allowedTypes]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Drone Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
            ${error ? 'border-destructive bg-destructive/5' : ''}
            transition-colors duration-200
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <FileType className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-medium">
                Drag and drop your file here
              </p>
              <p className="text-sm text-muted-foreground">
                Supports {allowedTypes.join(', ')} files up to {maxSize}MB
              </p>
            </div>
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-primary">Uploading...</div>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};