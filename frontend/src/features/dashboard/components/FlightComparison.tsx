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

interface ComparisonMetricProps {
  label: string;
  value1: number;
  value2: number;
  unit?: string;
}

const ComparisonMetric = ({ 
  label, 
  value1, 
  value2, 
  unit = ''
}: ComparisonMetricProps) => {
  const difference = value2 - value1;
  const percentChange = ((value2 - value1) / value1) * 100;
  
  const formatDifference = (isFirstFile: boolean) => {
    const diff = isFirstFile ? -difference : difference;
    const percent = isFirstFile ? -percentChange : percentChange;
    const arrow = diff > 0 ? '↑' : '↓';
    const signedDiff = diff > 0 ? `+${Math.abs(diff).toFixed(1)}` : `-${Math.abs(diff).toFixed(1)}`;
    const signedPercent = percent > 0 ? `+${Math.abs(percent).toFixed(1)}` : `-${Math.abs(percent).toFixed(1)}`;
    
    // Add color based on whether the number is positive or negative
    const color = diff > 0 ? "text-emerald-600" : "text-red-600";
    
    return {
      arrow,
      text: `${signedDiff}${unit} (${signedPercent}%)`,
      color
    };
  };

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">File 1</p>
          <p className="text-lg font-semibold">
            {value1.toFixed(1)}{unit}
          </p>
          {difference !== 0 && (
            <p className={`text-sm font-medium ${formatDifference(true).color}`}>
              {formatDifference(true).arrow} {formatDifference(true).text}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">File 2</p>
          <p className="text-lg font-semibold">
            {value2.toFixed(1)}{unit}
          </p>
          {difference !== 0 && (
            <p className={`text-sm font-medium ${formatDifference(false).color}`}>
              {formatDifference(false).arrow} {formatDifference(false).text}
            </p>
          )}
        </div>
      </div>
    </div>
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

  const renderComparison = () => {
    if (!hasBothFiles || !fileSlots.slot1 || !fileSlots.slot2) return null;
    
    const metrics1 = metricsMap[fileSlots.slot1.id]?.flightMetrics;
    const metrics2 = metricsMap[fileSlots.slot2.id]?.flightMetrics;

    if (!metrics1 || !metrics2) {
      return (
        <Card>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to load metrics for comparison.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparison Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <ComparisonMetric
              label="Flight Duration"
              value1={metrics1.duration}
              value2={metrics2.duration}
              unit="min"
            />
            <ComparisonMetric
              label="Data Points"
              value1={metrics1.totalPoints}
              value2={metrics2.totalPoints}
              unit=""
            />
            <ComparisonMetric
              label="Average Altitude"
              value1={metrics1.avgAltitude}
              value2={metrics2.avgAltitude}
              unit="m"
            />
            <ComparisonMetric
              label="Maximum Altitude"
              value1={metrics1.maxAltitude}
              value2={metrics2.maxAltitude}
              unit="m"
            />
            <ComparisonMetric
              label="Average Distance"
              value1={metrics1.avgDistance}
              value2={metrics2.avgDistance}
              unit="m"
            />
            <ComparisonMetric
              label="Maximum Distance"
              value1={metrics1.maxDistance}
              value2={metrics2.maxDistance}
              unit="m"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

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

      {hasBothFiles && renderComparison()}
    </div>
  );
};