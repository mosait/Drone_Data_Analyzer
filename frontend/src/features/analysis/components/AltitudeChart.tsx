// src/features/analysis/components/AltitudeChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DroneData } from "../../../api/types"

interface AltitudeChartProps {
  data: DroneData[]
}

export const AltitudeChart = ({ data }: AltitudeChartProps) => {
  const chartData = data.map(item => ({
    timestamp: new Date(item.timestamp).toLocaleTimeString(),
    altitude: item.altitude
  }))

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Altitude Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis label={{ value: 'Altitude (m)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="altitude" 
              stroke="#8884d8" 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}