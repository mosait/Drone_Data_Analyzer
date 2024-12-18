// src/features/dashboard/components/QuickActions.tsx
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Upload, Play, Download } from 'lucide-react';

interface QuickActionsProps {
  onImport: () => void;
  onAnalyze: () => void;
  onExport: () => void;
  hasFiles: boolean;
  hasAnalyzedFiles: boolean;
}

export const QuickActions = ({
  onImport,
  onAnalyze,
  onExport,
  hasFiles,
  hasAnalyzedFiles
}: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            onClick={onImport}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            onClick={onAnalyze}
            disabled={!hasFiles}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Analyze
          </Button>
          <Button
            variant="outline"
            onClick={onExport}
            disabled={!hasAnalyzedFiles}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};