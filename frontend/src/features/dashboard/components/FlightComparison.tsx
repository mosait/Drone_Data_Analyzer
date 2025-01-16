// src/features/dashboard/components/FlightComparison.tsx
import { useDataStore } from "@/store/useDataStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface MetricItemProps {
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
}

const MetricItem = ({ label, value, unit, className = "" }: MetricItemProps) => (
  <div className={className}>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-2xl font-bold">
      {value}{unit && <span className="text-base ml-1">{unit}</span>}
    </p>
  </div>
);

interface FlightMetricsProps {
  data: any;
  label: string;
  className?: string;
}

const FlightMetrics = ({ data, label, className = "" }: FlightMetricsProps) => {
  if (!data?.flightMetrics) return null;

  const metrics = data.flightMetrics;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <MetricItem 
            label="Duration"
            value={metrics.duration.toFixed(2)}
            unit="min"
          />
          <MetricItem 
            label="Max Altitude"
            value={metrics.maxAltitude.toFixed(1)}
            unit="m"
          />
          <MetricItem 
            label="Avg Distance"
            value={metrics.avgDistance.toFixed(1)}
            unit="m"
          />
          <MetricItem 
            label="Data Points"
            value={metrics.totalPoints}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export const FlightComparison = () => {
  const { fileSlots, metricsMap } = useDataStore();
  const hasFiles = fileSlots.slot1 || fileSlots.slot2;
  const hasBothFiles = fileSlots.slot1 && fileSlots.slot2;

  if (!hasFiles) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Select or upload files to view flight metrics.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`grid ${hasBothFiles ? 'grid-cols-1 lg:grid-cols-2 gap-6' : 'grid-cols-1'}`}>
        {fileSlots.slot1 && (
          <FlightMetrics 
            data={metricsMap[fileSlots.slot1.id]} 
            label={`File 1: ${fileSlots.slot1.filename}`}
            className={!hasBothFiles ? 'h-full' : ''}
          />
        )}
        {fileSlots.slot2 && (
          <FlightMetrics 
            data={metricsMap[fileSlots.slot2.id]} 
            label={`File 2: ${fileSlots.slot2.filename}`}
            className={!hasBothFiles ? 'h-full' : ''}
          />
        )}
      </div>

      {hasBothFiles && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Comparison metrics coming soon...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
