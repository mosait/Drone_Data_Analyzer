// Analysis.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { AltitudeChart } from './components/AltitudeChart';
import { RadarChart } from './components/RadarChart';
import GPSMap from './components/GPSMap';

// Define interfaces for chart synchronization
interface ChartSyncState {
  activeIndex: number | null;
  mouseX: number;
  mouseY: number;
}

interface SyncHoverProps {
  activeTooltipIndex: number | null;
  onHover: (state: ChartSyncState | null) => void;
  syncState: ChartSyncState;
}

const Analysis = () => {
  const { 
    currentData, 
    currentFile,
    metrics,
    isLoading,
    error,
  } = useDataStore();

  const [activeTabValue, setActiveTabValue] = useState("all");
  const [syncedChartState, setSyncedChartState] = useState<ChartSyncState>({
    activeIndex: null,
    mouseX: 0,
    mouseY: 0
  });

  // Configure chart synchronization props
  const syncHoverProps: SyncHoverProps = {
    activeTooltipIndex: syncedChartState.activeIndex,
    syncState: syncedChartState,
    onHover: (state: ChartSyncState | null) => {
      if (state) {
        setSyncedChartState(state);
      } else {
        setSyncedChartState({
          activeIndex: null,
          mouseX: 0,
          mouseY: 0
        });
      }
    }
  };

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

  if (!currentFile || !currentData || !metrics?.flightMetrics || !metrics?.timeSeries || !metrics?.summary) {
    return (
      <div className="p-6 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a flight data file to analyze.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { flightMetrics, timeSeries, summary } = metrics;

  return (
    <div className="space-y-8 p-8 mb-24">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Duration</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{flightMetrics.duration} min</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Max Altitude</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{flightMetrics.maxAltitude}m</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Distance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{flightMetrics.maxDistance}m</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Data Points</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{flightMetrics.totalPoints}</p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Tabs */}
      <Tabs 
        defaultValue="all" 
        className="space-y-4"
        value={activeTabValue}
        onValueChange={setActiveTabValue}
      >
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
            <div>
              <AltitudeChart 
                timeSeries={timeSeries} 
                summary={summary} 
                syncHover={syncHoverProps}
              />
            </div>
            <div>
              <RadarChart 
                timeSeries={timeSeries} 
                summary={summary} 
                syncHover={syncHoverProps}
              />
            </div>
            <div className="col-span-2">
              <Card className="h-[750px]">
                <GPSMap data={currentData} />
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="altitude" className="space-y-4 mt-4">
          <AltitudeChart timeSeries={timeSeries} summary={summary} />
        </TabsContent>

        <TabsContent value="radar" className="space-y-4 mt-4">
          <RadarChart timeSeries={timeSeries} summary={summary} />
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
