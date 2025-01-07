// src/features/analysis/Analysis.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle } from 'lucide-react'
import { useDataStore } from '@/store/useDataStore'
import { AltitudeChart } from './components/AltitudeChart'
import { RadarChart } from './components/RadarChart'
import GPSMap from './components/GPSMap'

// Will be removed when API is integrated
import { mockFlightData } from '@/utils/mockData'

const Analysis = () => {
  const { currentData } = useDataStore()
  
  // Use mock data for now, will be replaced with real data
  const data = currentData || mockFlightData

  if (!data.length) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a flight data file to analyze.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Calculate flight summary
  const flightDuration = new Date(data[data.length - 1].timestamp).getTime() - 
                        new Date(data[0].timestamp).getTime()
  const durationMinutes = Math.floor(flightDuration / (1000 * 60))

  return (
    <div className="space-y-6 p-6">
      {/* Flight Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Flight Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Duration</p>
              <p className="text-2xl font-bold">{durationMinutes} min</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Max Altitude</p>
              <p className="text-2xl font-bold">
                {Math.max(...data.map(d => d.altitude)).toFixed(1)}m
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Avg Distance</p>
              <p className="text-2xl font-bold">
                {(data.reduce((sum, d) => sum + d.radar.distance, 0) / data.length).toFixed(1)}m
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Data Points</p>
              <p className="text-2xl font-bold">{data.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="border-b">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All Data
            </TabsTrigger>
            <TabsTrigger value="altitude" className="flex items-center gap-2">
              Altitude Analysis
            </TabsTrigger>
            <TabsTrigger value="radar" className="flex items-center gap-2">
              Radar Data
            </TabsTrigger>
            <TabsTrigger value="gps" className="flex items-center gap-2">
              GPS Track
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Left column */}
            <div>
              <AltitudeChart data={data} />
            </div>
            {/* Right column */}
            <div>
              <RadarChart data={data} />
            </div>
            {/* Full width bottom */}
            <div className="col-span-2">
              <Card className="h-[600px]">
                <CardContent className="p-0">
                  <GPSMap data={data} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="altitude" className="space-y-4 mt-4">
          <AltitudeChart data={data} />
        </TabsContent>

        <TabsContent value="radar" className="space-y-4 mt-4">
          <RadarChart data={data} />
        </TabsContent>

        <TabsContent value="gps" className="space-y-4 mt-4">
          <Card className="h-[600px]">
            <CardContent className="p-0">
              <GPSMap data={data} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Analysis