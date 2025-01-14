// components/RadarChart.tsx
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
  avgDistance: number;
}

interface Summary {
  radar: {
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

export const RadarChart = ({ timeSeries, summary, syncHover }: Props) => {
  const maxDuration = Math.ceil(Math.max(...timeSeries.map(point => point.duration)));

  const chartData = timeSeries.map(point => ({
    ...point,
    avgDistanceLine: summary.radar.avg
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
        <CardTitle>Radar Distance Analysis</CardTitle>
        <CardDescription>Object detection and distance trends</CardDescription>
        <div className="grid grid-cols-4 gap-4 mt-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Maximum</p>
            <p className="text-2xl font-bold">{summary.radar.max}m</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Minimum</p>
            <p className="text-2xl font-bold">{summary.radar.min}m</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Average</p>
            <p className="text-2xl font-bold">{summary.radar.avg}m</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Change</p>
            <p className={`text-2xl font-bold ${
              summary.radar.change >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {summary.radar.change}m
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChartWrapper onSync={syncHover?.onHover} syncState={syncHover?.syncState || { activeIndex: null, mouseX: 0, mouseY: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              className="synchronized-chart radar-chart"
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
                <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
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
                  value: 'Distance (m)', 
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
                dataKey="distance"
                name="Current Distance"
                stroke="#FF8C42"
                fill="url(#colorDistance)"
                fillOpacity={1}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="avgDistanceLine"
                name="Average Distance"
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