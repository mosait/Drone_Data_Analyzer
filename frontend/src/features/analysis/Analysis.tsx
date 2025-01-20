// src/features/analysis/Analysis.tsx
import { useState } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader } from 'lucide-react';
import { AllDataView } from './views/AllDataView';
import { AltitudeAnalysisView } from './views/AltitudeAnalysisView';
import { RadarAnalysisView } from './views/RadarAnalysisView';
import { GPSTrackView } from './views/GPSTrackView';
import { MetricsCards } from '@/components/shared/MetricsCards';

export default function Analysis() {
  const { 
    currentDataMap, 
    metricsMap, 
    fileSlots,
    isLoading,
  } = useDataStore();

  const [activeTab, setActiveTab] = useState("all");

  // Get data and file information
  const data1 = fileSlots.slot1 ? currentDataMap[fileSlots.slot1.id] : undefined;
  const data2 = fileSlots.slot2 ? currentDataMap[fileSlots.slot2.id] : undefined;
  const fileName1 = fileSlots.slot1?.filename;
  const fileName2 = fileSlots.slot2?.filename;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!fileSlots.slot1 && !fileSlots.slot2) {
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

  // Ensure we have at least one set of valid data
  if (!data1 && !data2) {
    return (
      <div className="p-6 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No valid data found for analysis. Please try uploading the files again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderMetrics = (fileId: string) => {
    const metrics = metricsMap[fileId]?.flightMetrics;
    const otherFileId = Object.values(fileSlots)
      .find(file => file && file.id !== fileId)?.id;
    
    const otherMetrics = otherFileId && metricsMap[otherFileId]?.flightMetrics 
      ? metricsMap[otherFileId].flightMetrics 
      : undefined;

    if (!metrics) return null;

    return (
        <MetricsCards 
          metrics={metrics}
          otherMetrics={otherMetrics}
          hasBothFiles={Boolean(fileSlots.slot1 && fileSlots.slot2)}
        />
    );
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Force reflow when switching tabs
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Metrics Section */}
      <div className={`grid ${fileSlots.slot1 && fileSlots.slot2 ? 'grid-cols-2 gap-8' : 'grid-cols-1'}`}>
        {fileSlots.slot1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">File 1: {fileSlots.slot1.filename}</h2>
            {renderMetrics(fileSlots.slot1.id)}
          </div>
        )}
        {fileSlots.slot2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">File 2: {fileSlots.slot2.filename}</h2>
            {renderMetrics(fileSlots.slot2.id)}
          </div>
        )}
      </div>

      {/* Analysis Tabs */}
      <Tabs 
        defaultValue="all" 
        className="space-y-4"
        value={activeTab}
        onValueChange={handleTabChange}
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
          <div className="all-data-container isolate">
            {data1 && (
              <AllDataView 
                data1={data1}
                data2={data2}
                fileName1={fileName1!}
                fileName2={fileName2}
                key={`all-data-${activeTab}`}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="altitude" className="space-y-8 mt-4">
          {data1 && (
            <AltitudeAnalysisView 
              data1={data1}
              data2={data2}
              fileName1={fileName1!}
              fileName2={fileName2}
            />
          )}
        </TabsContent>

        <TabsContent value="radar" className="space-y-8 mt-4">
          {data1 && (
            <RadarAnalysisView 
              data1={data1}
              data2={data2}
              fileName1={fileName1!}
              fileName2={fileName2}
            />
          )}
        </TabsContent>

        <TabsContent value="gps" className="space-y-8 mt-4">
          {data1 && (
            <GPSTrackView 
              data1={data1}
              data2={data2}
              fileName1={fileName1!}
              fileName2={fileName2}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}