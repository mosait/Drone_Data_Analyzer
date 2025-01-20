// src/components/shared/VisibilityControls.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Layers } from 'lucide-react';

interface FileVisibility {
  [key: string]: boolean;
}

interface VisibilityControlsProps {
  fileName1: string;
  fileName2?: string;
  visibility: FileVisibility;
  onVisibilityChange: (fileName: string) => void;
  className?: string;
}

export function VisibilityControls({
  fileName1,
  fileName2,
  visibility,
  onVisibilityChange,
  className = ""
}: VisibilityControlsProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Visible Layers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`visibility-${fileName1}`}
              checked={visibility[fileName1]}
              onCheckedChange={() => onVisibilityChange(fileName1)}
              className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
            <Label 
              htmlFor={`visibility-${fileName1}`}
              className="text-base font-medium flex items-center gap-2"
            >
              {fileName1}
              <div className="w-3 h-3 rounded-full bg-purple-600" />
            </Label>
          </div>

          {fileName2 && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`visibility-${fileName2}`}
                checked={visibility[fileName2]}
                onCheckedChange={() => onVisibilityChange(fileName2)}
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <Label 
                htmlFor={`visibility-${fileName2}`}
                className="text-base font-medium flex items-center gap-2"
              >
                {fileName2}
                <div className="w-3 h-3 rounded-full bg-orange-500" />
              </Label>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}