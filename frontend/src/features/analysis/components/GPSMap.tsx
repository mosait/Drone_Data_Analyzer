// src/features/analysis/components/GPSMap.tsx
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import type { DroneData } from "../../../api/types"

interface GPSMapProps {
  data: DroneData[]
}

export const GPSMap = ({ data }: GPSMapProps) => {
  const mapData = data.map(item => ({
    longitude: item.gps.longitude,
    latitude: item.gps.latitude
  }))

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>GPS Track</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="longitude" 
              type="number" 
              name="longitude"
              label={{ value: 'Longitude', position: 'bottom' }} 
            />
            <YAxis 
              dataKey="latitude" 
              type="number" 
              name="latitude"
              label={{ value: 'Latitude', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="GPS Points" data={mapData} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}