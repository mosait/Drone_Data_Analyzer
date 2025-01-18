// src/features/analysis/views/AllDataView.tsx
import { useState } from 'react';
import { CombinedAltitudeChart } from '../components/charts/CombinedAltitudeChart';
import { CombinedRadarChart } from '../components/charts/CombinedRadarChart';
import { FlightMap } from '../components/map/FlightMap';
import { DroneData } from '@/api/types';
import { ChartWrapper } from '../components/charts/ChartWrapper';

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

export function AllDataView({
  data1,
  data2,
  fileName1,
  fileName2,
}: AllDataViewProps) {
  // State for chart synchronization
  const [syncedChartState, setSyncedChartState] = useState<ChartSyncState>({
    activeIndex: null,
    mouseX: 0,
    mouseY: 0
  });

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
          mouseY: 0
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        <ChartWrapper onSync={syncHoverProps.onHover} syncState={syncHoverProps.syncState}>
          <CombinedAltitudeChart 
            data1={data1}
            data2={data2}
            fileName1={fileName1}
            fileName2={fileName2}
            syncHover={syncHoverProps}
          />
        </ChartWrapper>

        <ChartWrapper onSync={syncHoverProps.onHover} syncState={syncHoverProps.syncState}>
          <CombinedRadarChart 
            data1={data1}
            data2={data2}
            fileName1={fileName1}
            fileName2={fileName2}
            syncHover={syncHoverProps}
          />
        </ChartWrapper>
      </div>

      {/* Map Section */}
      <FlightMap 
        data1={data1}
        data2={data2}
        fileName1={fileName1}
        fileName2={fileName2}
      />
    </div>
  );
}