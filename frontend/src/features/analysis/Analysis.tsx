// src/features/analysis/Analysis.tsx
import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
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
    selectedFile,
    setCurrentFile 
  } = useDataStore();

  // Load data if we have a selected file but no current data
  useEffect(() => {
    if (selectedFile && !currentData) {
      setCurrentFile(selectedFile);
    }
  }, [selectedFile, currentData, setCurrentFile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 py-20">
        <Loader className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading analysis...</span>
      </div>
    );
  }

  if (!currentData || !currentFile) {
    return (
      <div className="p-6 py-20">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a flight data file to analyze.
          </AlertDescription>
        </Alert>
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

  return (
    <div className="space-y-8 p-8 mb-24 py-20">
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
            {processedData && (
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
          {processedData && <AltitudeChart data={processedData} />}
        </TabsContent>

        <TabsContent value="radar" className="space-y-4 mt-4">
          {processedData && <RadarChart data={processedData} />}
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