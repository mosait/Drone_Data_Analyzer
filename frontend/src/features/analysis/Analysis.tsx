// src/features/analysis/Analysis.tsx
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Loader } from 'lucide-react'
import { useDataStore } from '@/store/useDataStore'
import { AltitudeChart } from './components/AltitudeChart'
import { RadarChart } from './components/RadarChart'
import GPSMap from './components/GPSMap'

const Analysis = () => {
  const { 
    currentData, 
    currentFile, 
    processedData, 
    isLoading,
    error,
  } = useDataStore();

  // Validate data
  const isDataValid = currentData && currentData.length > 0 && 
                     currentData[0]?.timestamp && 
                     currentData[0]?.gps && 
                     currentData[0]?.radar;

  const isProcessedDataValid = processedData && 
                              processedData.summary && 
                              processedData.timeSeries &&
                              processedData.timeSeries.points;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 py-20">
        <div className="text-center space-y-4">
          <Loader className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-lg">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 py-20">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentFile || !isDataValid) {
    return (
      <div className="p-6 py-20">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a valid flight data file to analyze.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate duration
  const startTime = new Date(currentData[0].timestamp);
  const endTime = new Date(currentData[currentData.length - 1].timestamp);
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // minutes

  // Calculate distance
  const totalDistance = currentData.reduce((sum, d) => sum + d.radar.distance, 0);

  return (
    <div className="space-y-8 p-8 mb-24">
      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Duration</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{duration.toFixed(1)} min</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Max Altitude</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{processedData?.summary.altitude.max.toFixed(1)}m</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Distance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{(totalDistance / 1000).toFixed(2)}km</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Points</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{currentData.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="border-b">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All Data</TabsTrigger>
            <TabsTrigger value="altitude">Altitude Analysis</TabsTrigger>
            <TabsTrigger value="radar">Radar Data</TabsTrigger>
            <TabsTrigger value="gps">GPS Track</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-6">
            {isProcessedDataValid && (
              <>
                <div>
                  <AltitudeChart data={processedData} />
                </div>
                <div>
                  <RadarChart data={processedData} />
                </div>
              </>
            )}
            <div className="col-span-2">
              <Card className="h-[650px]">
                <GPSMap data={currentData} />
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="altitude" className="space-y-4 mt-4">
          {isProcessedDataValid && <AltitudeChart data={processedData} />}
        </TabsContent>

        <TabsContent value="radar" className="space-y-4 mt-4">
          {isProcessedDataValid && <RadarChart data={processedData} />}
        </TabsContent>

        <TabsContent value="gps" className="space-y-4 mt-4">
          <Card className="h-[650px]">
            <GPSMap data={currentData} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analysis;