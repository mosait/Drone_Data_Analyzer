// src/components/shared/FileUploadError.tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadErrorProps {
  error: string;
  onDismiss: () => void;
}

export function FileUploadError({ error, onDismiss }: FileUploadErrorProps) {
  // Split the error message into title and details
  const [errorTitle, ...details] = error.split('\n');

  return (
    <Alert variant="destructive" className="mb-4">
      <div className="flex w-full">
        <AlertCircle className="h-4 w-4 mt-0.5" />
        
        <div className="flex-1 ml-3">
          <AlertTitle className="font-semibold tracking-tight">
            {errorTitle}
          </AlertTitle>
          
          {details.length > 0 && (
            <AlertDescription>
              <ul className="mt-2 space-y-1 text-sm">
                {details.map((detail, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-red-300 mr-2">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          )}
        </div>

        <Button
          variant="destructive"
          size="icon"
          className="h-6 w-6 ml-2"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}