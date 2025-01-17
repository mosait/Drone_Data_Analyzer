// src/features/data-table/components/MetricsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlightMetrics } from '@/api/types';

interface MetricsCardsProps {
  metrics: FlightMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Flight Duration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-2xl font-bold">{metrics.duration.toFixed(2)} min</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Max Altitude
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-2xl font-bold">{metrics.maxAltitude.toFixed(2)}m</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Distance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-2xl font-bold">{metrics.avgDistance.toFixed(2)}m</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Data Points
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-2xl font-bold">{metrics.totalPoints}</p>
        </CardContent>
      </Card>
    </div>
  );
}