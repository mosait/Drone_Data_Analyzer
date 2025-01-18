// src/components/shared/FileUploadError.tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadErrorProps {
  error: string;
  onDismiss: () => void;
}

export function FileUploadError({ error, onDismiss }: FileUploadErrorProps) {
  // Split the error message if it contains specific details
  const [mainError, ...details] = error.split('\n');

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle>Upload Failed</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="font-medium">{mainError}</p>
          {details.length > 0 && (
            <ul className="mt-2 list-disc list-inside space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="text-sm">{detail}</li>
              ))}
            </ul>
          )}
        </AlertDescription>
      </div>
      <Button
        variant="destructive"
        size="icon"
        className="ml-2 h-6 w-6"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}