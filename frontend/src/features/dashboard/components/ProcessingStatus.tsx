// src/features/dashboard/components/ProcessingStatus.tsx
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { AnalysisProgress } from '../types';

interface ProcessingStatusProps {
  analysisProgress: AnalysisProgress | null;
  exportQueue: string[];
}

export const ProcessingStatus = ({ analysisProgress, exportQueue }: ProcessingStatusProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Status</CardTitle>
      </CardHeader>
      <CardContent>
        {analysisProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analyzing file...</span>
              <span>{analysisProgress.progress}%</span>
            </div>
            <Progress value={analysisProgress.progress} />
          </div>
        )}
        {exportQueue.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              {exportQueue.length} file(s) queued for export
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};