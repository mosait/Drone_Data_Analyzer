// src/features/analysis/views/AllDataView.tsx
import { useState, useEffect, useRef } from 'react';
import { CombinedAltitudeChart } from '../components/charts/CombinedAltitudeChart';
import { CombinedRadarChart } from '../components/charts/CombinedRadarChart';
import { FlightMap } from '../components/map/FlightMap';
import { DroneData } from '@/api/types';
import { ChartWrapper } from '../components/charts/ChartWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Layers } from 'lucide-react';

interface ChartSyncState {
  activeIndex: number | null;
  mouseX: number;
  mouseY: number;
}

interface AllDataViewProps {
  data1: DroneData[];
  data2?: DroneData[];
  fileName1: string;
  fileName2?: string;
}

interface FileVisibility {
  [key: string]: boolean;
}

export function AllDataView({
  data1,
  data2,
  fileName1,
  fileName2,
}: AllDataViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [syncedChartState, setSyncedChartState] = useState<ChartSyncState>({
    activeIndex: null,
    mouseX: 0,
    mouseY: 0,
  });

  // State for file visibility
  const [fileVisibility, setFileVisibility] = useState<FileVisibility>(() => ({
    [fileName1]: true,
    ...(fileName2 ? { [fileName2]: true } : {}),
  }));

  // Handle visibility toggle
  const handleVisibilityChange = (fileName: string) => {
    setFileVisibility(prev => ({
      ...prev,
      [fileName]: !prev[fileName],
    }));
  };

  // Sync hover props for charts
  const syncHoverProps = {
    activeTooltipIndex: syncedChartState.activeIndex,
    syncState: syncedChartState,
    onHover: (state: ChartSyncState | null) => {
      if (state) {
        setSyncedChartState(state);
      } else {
        setSyncedChartState({
          activeIndex: null,
          mouseX: 0,
          mouseY: 0,
        });
      }
    }
  };

  // Process data based on visibility
  const visibleData1 = fileVisibility[fileName1] ? data1 : [];
  const visibleData2 = fileName2 && fileVisibility[fileName2] ? data2 : [];

  // Force reflow map when visibility changes
  useEffect(() => {
    if (mapContainerRef.current) {
      const map = mapContainerRef.current.getElementsByClassName('leaflet-container')[0];
      if (map) {
        setTimeout(() => {
          // @ts-ignore
          map._leaflet_map?.invalidateSize();
        }, 100);
      }
    }
  }, [fileVisibility]);

  return (
    <div className="space-y-6">
      {/* Layer Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Visible Layers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`visibility-${fileName1}`}
                checked={fileVisibility[fileName1]}
                onCheckedChange={() => handleVisibilityChange(fileName1)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label 
                htmlFor={`visibility-${fileName1}`}
                className="text-base font-medium flex items-center gap-2"
              >
                {fileName1}
                <div className="w-3 h-3 rounded-full bg-purple-600" />
              </Label>
            </div>

            {fileName2 && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`visibility-${fileName2}`}
                  checked={fileVisibility[fileName2]}
                  onCheckedChange={() => handleVisibilityChange(fileName2)}
                  className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label 
                  htmlFor={`visibility-${fileName2}`}
                  className="text-base font-medium flex items-center gap-2"
                >
                  {fileName2}
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                </Label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      {(visibleData1.length > 0 || (visibleData2 && visibleData2.length > 0)) ? (
        <div className="grid grid-cols-2 gap-6">
          <ChartWrapper onSync={syncHoverProps.onHover} syncState={syncHoverProps.syncState}>
            <CombinedAltitudeChart 
              data1={visibleData1}
              data2={visibleData2}
              fileName1={fileName1}
              fileName2={fileName2}
              syncHover={syncHoverProps}
            />
          </ChartWrapper>

          <ChartWrapper onSync={syncHoverProps.onHover} syncState={syncHoverProps.syncState}>
            <CombinedRadarChart 
              data1={visibleData1}
              data2={visibleData2}
              fileName1={fileName1}
              fileName2={fileName2}
              syncHover={syncHoverProps}
            />
          </ChartWrapper>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Select at least one file to view data</p>
          </CardContent>
        </Card>
      )}

      {/* Map Section */}
      <div 
        ref={mapContainerRef}
        className="map-container relative z-[1]"
      >
        <FlightMap 
          data1={visibleData1}
          data2={visibleData2}
          fileName1={fileName1}
          fileName2={fileName2}
        />
      </div>
    </div>
  );
}