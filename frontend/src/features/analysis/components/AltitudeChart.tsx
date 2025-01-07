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
  ReferenceLine,
  Legend
} from 'recharts'
import type { DroneData } from "@/api/types"

interface AltitudeChartProps {
  data: DroneData[]
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const AltitudeChart = ({ data }: AltitudeChartProps) => {
  // Transform data for the chart
  const chartData = data.map(item => ({
    timestamp: new Date(item.timestamp).toLocaleTimeString(),
    altitude: item.altitude,
    smoothAltitude: calculateMovingAverage(data.map(d => d.altitude), 5)[data.indexOf(item)]
  }))

  // Calculate statistics
  const stats = {
    max: Math.max(...data.map(d => d.altitude)),
    min: Math.min(...data.map(d => d.altitude)),
    avg: data.reduce((sum, d) => sum + d.altitude, 0) / data.length,
    change: calculateChange(data.map(d => d.altitude))
  }

  // Calculate moving average for smoother line
  function calculateMovingAverage(values: number[], window: number): number[] {
    const result = []
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - Math.floor(window / 2))
      const end = Math.min(values.length, i + Math.floor(window / 2) + 1)
      const windowValues = values.slice(start, end)
      const avg = windowValues.reduce((sum, val) => sum + val, 0) / windowValues.length
      result.push(avg)
    }
    return result
  }

  // Calculate percentage change
  function calculateChange(values: number[]): string {
    if (!values.length) return '0%'
    const first = values[0]
    const last = values[values.length - 1]
    if (first === 0) return '0%'
    const change = ((last - first) / first) * 100
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (!active || !payload || !payload.length) return null

    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p 
            key={index} 
            className="text-sm" 
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value.toFixed(1)}m
          </p>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Altitude Analysis</CardTitle>
        <CardDescription>Flight altitude metrics and trends</CardDescription>
        <div className="grid grid-cols-4 gap-4 mt-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Maximum</p>
            <p className="text-2xl font-bold">{stats.max.toFixed(1)}m</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Minimum</p>
            <p className="text-2xl font-bold">{stats.min.toFixed(1)}m</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Average</p>
            <p className="text-2xl font-bold">{stats.avg.toFixed(1)}m</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Change</p>
            <p className={`text-2xl font-bold ${
              stats.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {stats.change}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="altitudeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-border"
              vertical={false}
            />
            <XAxis 
              dataKey="timestamp"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              label={{ 
                value: 'Altitude (m)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }
              }}
            />
            <Tooltip 
              content={CustomTooltip}
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value: string) => <span className="text-sm font-medium">{value}</span>}
            />
            <ReferenceLine 
              y={stats.avg} 
              stroke="#4A90E2"
              strokeDasharray="3 3"
              label={{
                value: 'Average',
                position: 'right',
                fill: '#4A90E2',
                fontSize: 12
              }}
            />
            <Area
              type="monotone"
              dataKey="altitude"
              fill="url(#altitudeGradient)"
              stroke="#FF6B6B"
              name="Raw Altitude"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="smoothAltitude"
              stroke="#4CAF50"
              strokeWidth={3}
              dot={false}
              name="Trend"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default AltitudeChart