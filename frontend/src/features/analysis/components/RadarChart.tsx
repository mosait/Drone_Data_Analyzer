// src/features/analysis/components/RadarChart.tsx
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
import type { DroneData } from "@/api/types"

interface RadarChartProps {
  data: DroneData[]
  fileId?: string
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const RadarChart = ({ data, fileId = '1' }: RadarChartProps) => {
  // Calculate the average once for all data points
  const avgDistance = data.reduce((sum, d) => sum + d.radar.distance, 0) / data.length

  // Transform data for the chart
  const chartData = data.map(item => ({
    timestamp: new Date(item.timestamp).toLocaleTimeString(),
    [`distance_${fileId}`]: item.radar.distance,
    [`avg_${fileId}`]: avgDistance, // Same average for all points
  }))

  // Calculate statistics
  const stats = {
    max: Math.max(...data.map(d => d.radar.distance)),
    min: Math.min(...data.map(d => d.radar.distance)),
    avg: avgDistance,
    change: calculateChange(data.map(d => d.radar.distance))
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
        {payload.map((entry: any, index: number) => (
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
        <CardTitle>Radar Distance Analysis</CardTitle>
        <CardDescription>Object detection and distance trends</CardDescription>
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
              <linearGradient id={`colorDistance${fileId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="timestamp"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
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
            <Tooltip content={CustomTooltip} />
            <Legend 
              verticalAlign="top"
              height={36}
            />
            <Area 
              type="monotone" 
              dataKey={`distance_${fileId}`}
              name="Current Distance"
              stackId="1"
              stroke="#8884d8" 
              fill={`url(#colorDistance${fileId})`}
              strokeWidth={1}
            />
            <Line
              type="monotone"
              dataKey={`avg_${fileId}`}
              name="Average Distance"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#82ca9d' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default RadarChart