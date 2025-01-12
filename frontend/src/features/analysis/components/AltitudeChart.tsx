// src/features/analysis/components/AltitudeChart.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
} from 'recharts'
import type { ProcessedFlightData } from "@/api/types"

interface AltitudeChartProps {
  data: ProcessedFlightData;
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const AltitudeChart = ({ data }: AltitudeChartProps) => {
  // Find the max duration from the data
  const maxDuration = Math.ceil(Math.max(...data.timeSeries.points.map(p => p.duration)));

  // Custom Tooltip
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
            <p className="text-2xl font-bold">{data.summary.altitude.max.toFixed(1)}m</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Minimum</p>
            <p className="text-2xl font-bold">{data.summary.altitude.min.toFixed(1)}m</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Average</p>
            <p className="text-2xl font-bold">{data.summary.altitude.avg.toFixed(1)}m</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Change</p>
            <p className={`text-2xl font-bold ${
              data.summary.altitude.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {data.summary.altitude.change}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={data.timeSeries.points}
            margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorAltitude" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
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
            <Tooltip content={CustomTooltip} />
            <Legend 
              verticalAlign="top"
              height={36}
            />
            <Area
              type="monotone"
              dataKey="altitude"
              name="Current Altitude"
              stroke="#8884d8"
              fill="url(#colorAltitude)"
              fillOpacity={1}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="avgAltitude"
              name="Average Altitude"
              stroke="#82ca9d"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AltitudeChart;