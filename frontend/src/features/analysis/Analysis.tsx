// src/features/analysis/Analysis.tsx
import { useEffect } from 'react'
import { useDataStore } from '../../store/useDataStore'
import { AltitudeChart } from './components/AltitudeChart'
import { RadarChart } from './components/RadarChart'
import { GPSMap } from './components/GPSMap'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export default function Analysis() {
  const { currentData, currentFileId, error } = useDataStore()

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Analysis</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentData || !currentFileId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Analysis</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Please select a file from the dashboard to analyze.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analysis</h1>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Flight Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Max Altitude</p>
              <p className="text-2xl font-bold">
                {Math.max(...currentData.map(d => d.altitude)).toFixed(1)}m
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Velocity</p>
              <p className="text-2xl font-bold">
                {Math.max(...currentData.map(d => d.radar.velocity)).toFixed(1)}m/s
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Flight Duration</p>
              <p className="text-2xl font-bold">
                {((new Date(currentData[currentData.length - 1].timestamp).getTime() - 
                   new Date(currentData[0].timestamp).getTime()) / 60000).toFixed(1)}min
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AltitudeChart data={currentData} />
        <RadarChart data={currentData} />
        <div className="lg:col-span-2">
          <GPSMap data={currentData} />
        </div>
      </div>
    </div>
  )
}