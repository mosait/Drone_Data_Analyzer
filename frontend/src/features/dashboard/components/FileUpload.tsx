// src/features/dashboard/components/FileUpload.tsx
import { useState, useCallback } from 'react';
import { Upload, FileType, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { useDataStore } from '../../../store/useDataStore';

interface FileUploadProps {
  maxSize?: number; // in MB
  allowedTypes?: string[]; // e.g., ['.csv', '.json']
}

export const FileUpload = ({
  maxSize = 10,
  allowedTypes = ['.csv', '.json']
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadFile } = useDataStore();

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
      await uploadFile(file);
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
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
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
              <div className="mt-4">
                <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                  Select File
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept={allowedTypes.join(',')}
                  onChange={handleFileInput}
                />
              </div>
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