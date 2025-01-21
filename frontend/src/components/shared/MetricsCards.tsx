// src/components/shared/MetricsCards.tsx
import { Card, CardContent } from '@/components/ui/card';
import { FlightMetrics } from '@/api/types';

interface ComparisonInfo {
  difference: number;
  percentChange: number;
}

interface MetricItemProps {
  value: number;
  unit?: string;
  otherValue?: number;
  hasBothFiles: boolean;
}

const MetricItem = ({ value, unit = '', otherValue, hasBothFiles }: MetricItemProps) => {
  let comparison: ComparisonInfo | null = null;

  if (hasBothFiles && otherValue !== undefined) {
    // Value is current file, otherValue is reference file
    // So we calculate the difference from the reference (otherValue)
    const difference = value - otherValue;
    const percentChange = otherValue !== 0 ? (difference / otherValue) * 100 : 0;
    comparison = { difference, percentChange };
  }

  const formatValue = (val: number): string => {
    if (unit === 'min') return val.toFixed(2);
    if (unit === 'm') return val.toFixed(1);
    return val.toString();
  };

  return (
    <>
      <p className="text-2xl font-bold">
        {formatValue(value)}{unit}
      </p>
      {comparison && (
        <p className={`text-sm font-medium ${comparison.difference > 0 ? 'text-emerald-600' : comparison.difference < 0 ? 'text-red-600' : 'text-gray-500'}`}>
          {/* Show down arrow for negative, up arrow for positive */}
          {comparison.difference > 0 ? '↑' : comparison.difference < 0 ? '↓' : '→'} {Math.abs(comparison.difference).toFixed(1)}{unit} 
          ({comparison.percentChange > 0 ? '+' : comparison.percentChange < 0 ? '-' : '±'}{Math.abs(comparison.percentChange).toFixed(1)}%)
        </p>
      )}
    </>
  );
};

export interface MetricsCardsProps {
  metrics: FlightMetrics;
  otherMetrics?: FlightMetrics;
  hasBothFiles: boolean;
}

export function MetricsCards({ metrics, otherMetrics, hasBothFiles }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Flight Duration</h3>
        <CardContent className="p-0 pt-2">
          <MetricItem 
            value={metrics.duration}
            unit="min"
            otherValue={otherMetrics?.duration}
            hasBothFiles={hasBothFiles}
          />
        </CardContent>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Max Altitude</h3>
        <CardContent className="p-0 pt-2">
          <MetricItem 
            value={metrics.maxAltitude}
            unit="m"
            otherValue={otherMetrics?.maxAltitude}
            hasBothFiles={hasBothFiles}
          />
        </CardContent>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Avg Distance</h3>
        <CardContent className="p-0 pt-2">
          <MetricItem 
            value={metrics.avgDistance}
            unit="m"
            otherValue={otherMetrics?.avgDistance}
            hasBothFiles={hasBothFiles}
          />
        </CardContent>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Data Points</h3>
        <CardContent className="p-0 pt-2">
          <MetricItem 
            value={metrics.totalPoints}
            otherValue={otherMetrics?.totalPoints}
            hasBothFiles={hasBothFiles}
          />
        </CardContent>
      </Card>
    </div>
  );
}