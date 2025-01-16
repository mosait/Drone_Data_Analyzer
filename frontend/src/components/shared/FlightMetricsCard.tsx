// src/components/shared/FlightMetricsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlightMetrics } from "@/api/types";

interface MetricItemProps {
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
}

const MetricItem = ({ label, value, unit, className }: MetricItemProps) => (
  <div className={className}>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-2xl font-bold">
      {value}{unit && <span className="text-lg ml-1">{unit}</span>}
    </p>
  </div>
);

interface FlightMetricsCardProps {
  metrics: FlightMetrics;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const FlightMetricsCard = ({ 
  metrics, 
  title = "Flight Metrics",
  subtitle,
  className = "" 
}: FlightMetricsCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            label="Total Distance"
            value={metrics.maxDistance.toFixed(1)}
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