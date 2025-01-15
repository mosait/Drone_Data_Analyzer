// src/features/analysis/components/AltitudeChart.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ComposedChart,
  Area,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ChartWrapper } from './ChartWrapper';

interface TimeSeriesPoint {
  duration: number;
  altitude: number;
  distance: number;
  avgAltitude: number;
}

interface Summary {
  altitude: {
    max: number;
    min: number;
    avg: number;
    change: number;
  };
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

interface Props {
  timeSeries: TimeSeriesPoint[];
  summary: Summary;
  syncHover?: {
    activeTooltipIndex: number | null;
    onHover: (state: any) => void;
    syncState: any;
  };
}

export const AltitudeChart = ({ timeSeries, summary, syncHover }: Props) => {
  const maxDuration = Math.ceil(Math.max(...timeSeries.map(point => point.duration)));

  const chartData = timeSeries.map(point => ({
    ...point,
    avgAltitudeLine: summary.altitude.avg
  }));

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-1">Time: {label} min</p>
        {payload.map((entry: any, index: number) => (
          <p 
            key={index} 
            className="text-sm" 
            style={{ color: entry.stroke }}
          >
            {entry.name}: {entry.value.toFixed(1)}m
          </p>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Altitude Analysis</CardTitle>
        <CardDescription>Flight altitude metrics and trends</CardDescription>
        <div className="grid grid-cols-4 gap-4 mt-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Maximum</p>
            <p className="text-2xl font-bold">{summary.altitude.max.toFixed(2)}m</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Minimum</p>
            <p className="text-2xl font-bold">{summary.altitude.min.toFixed(2)}m</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Average</p>
            <p className="text-2xl font-bold">{summary.altitude.avg.toFixed(2)}m</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Change</p>
            <p className={`text-2xl font-bold ${
              summary.altitude.change >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {summary.altitude.change}m
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChartWrapper onSync={syncHover?.onHover} syncState={syncHover?.syncState || { activeIndex: null, mouseX: 0, mouseY: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              className="synchronized-chart altitude-chart"
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
              onMouseMove={(state) => {
                if (syncHover && typeof state?.activeTooltipIndex === 'number') {
                  syncHover.onHover({
                    activeIndex: state.activeTooltipIndex,
                    mouseX: state.chartX,
                    mouseY: state.chartY
                  });
                }
              }}
              onMouseLeave={() => {
                if (syncHover) {
                  syncHover.onHover(null);
                }
              }}
            >
              <defs>
                <linearGradient id="colorAltitude" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF8C42" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#FF8C42" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="duration"
                type="number"
                domain={[0, maxDuration]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{ 
                  value: 'Duration (minutes)', 
                  position: 'bottom',
                  offset: 0,
                  style: { fontSize: 12 }
                }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{ 
                  value: 'Altitude (m)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 12 }
                }}
              />
              <Tooltip 
                content={CustomTooltip}
                cursor={{ stroke: '#666', strokeWidth: 1 }}
                active={syncHover?.activeTooltipIndex !== null}
              />
              <Legend 
                verticalAlign="top"
                height={36}
              />
              <Area
                type="monotone"
                dataKey="altitude"
                name="Current Altitude"
                stroke="#FF8C42"
                fill="url(#colorAltitude)"
                fillOpacity={1}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="avgAltitudeLine"
                name="Average Altitude"
                stroke="#A64AC9"
                dot={false}
                strokeWidth={2}
                strokeDasharray="5 5"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </CardContent>
    </Card>
  );
};