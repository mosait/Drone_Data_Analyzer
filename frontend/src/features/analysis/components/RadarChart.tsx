// src/features/analysis/components/RadarChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DroneData } from "../../../api/types"

interface RadarChartProps {
  data: DroneData[]
}

export const RadarChart = ({ data }: RadarChartProps) => {
  const chartData = data.map(item => ({
    timestamp: new Date(item.timestamp).toLocaleTimeString(),
    distance: item.radar.distance,
    velocity: item.radar.velocity
  }))

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Radar Data</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis yAxisId="left" label={{ value: 'Distance (m)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Velocity (m/s)', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="distance" 
              stroke="#8884d8" 
              dot={false}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="velocity" 
              stroke="#82ca9d" 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}