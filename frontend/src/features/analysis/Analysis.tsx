// src/features/analysis/Analysis.tsx
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Loader } from 'lucide-react'
import { useDataStore } from '@/store/useDataStore'
import { AltitudeChart } from './components/AltitudeChart'
import { RadarChart } from './components/RadarChart'
import GPSMap from './components/GPSMap'
import { api } from '@/api/endpoints'
import type { ProcessedFlightData } from '@/api/types'

const Analysis = () => {
  const { currentData, currentFile } = useDataStore();
  const [processedData, setProcessedData] = useState<ProcessedFlightData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProcessedData = async () => {
      if (!currentFile?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.flightData.getProcessedData(currentFile.id);
        setProcessedData(response.data);
      } catch (err) {
        setError('Failed to load flight data');
        console.error('Error fetching processed data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcessedData();
  }, [currentFile?.id]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading analysis...</span>
      </div>
    );
  }

  if (error || !processedData) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Failed to process flight data'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 mb-24 py-20">
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
            <div>
              <AltitudeChart data={processedData} />
            </div>
            <div>
              <RadarChart data={processedData} />
            </div>
            <div className="col-span-2">
              <Card className="h-[650px]">
                <GPSMap data={currentData} />
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="altitude" className="space-y-4 mt-4">
          <AltitudeChart data={processedData} />
        </TabsContent>

        <TabsContent value="radar" className="space-y-4 mt-4">
          <RadarChart data={processedData} />
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