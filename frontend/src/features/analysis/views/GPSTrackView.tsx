// src/features/analysis/views/GPSTrackView.tsx
import { useState, useCallback } from "react";
import { DroneData } from "@/api/types";
import { FlightMap } from "../components/map/FlightMap";
import { AnalysisDataTable } from "../components/table/AnalysisDataTable";
import { VisibilityControls } from "@/components/shared/VisibilityControls";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";

interface GPSTrackViewProps {
  data1: DroneData[];
  data2?: DroneData[];
  fileName1: string;
  fileName2?: string;
}

interface FileVisibility {
  [key: string]: boolean;
}

interface SharedTableState {
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  sorting: SortingState;
  showFilters: boolean;
  pageSize: number;
  pageIndex: number;
  isTableSynced: boolean;
}

const defaultState: SharedTableState = {
  globalFilter: "",
  columnFilters: [],
  sorting: [],
  showFilters: false,
  pageSize: 10,
  pageIndex: 0,
  isTableSynced: false
};

export function GPSTrackView({
  data1,
  data2,
  fileName1,
  fileName2,
}: GPSTrackViewProps) {
  const hasBothFiles = Boolean(data1 && data2);
  const [syncedState, setSyncedState] = useState<SharedTableState>(defaultState);
  const [isTablesSynced, setIsTablesSynced] = useState(false);
  
  // Add visibility state
  const [fileVisibility, setFileVisibility] = useState<FileVisibility>(() => ({
    [fileName1]: true,
    ...(fileName2 ? { [fileName2]: true } : {}),
  }));

  // Handle sync state changes for both tables
  const handleSyncChange = useCallback((isSynced: boolean, state: SharedTableState, _table: 'table1' | 'table2') => {
    setIsTablesSynced(isSynced);
    if (isSynced) {
      setSyncedState({
        ...state,
        isTableSynced: true
      });
    } else {
      setSyncedState(defaultState);
    }
  }, []);

  // Handle visibility toggle
  const handleVisibilityChange = (fileName: string) => {
    setFileVisibility(prev => ({
      ...prev,
      [fileName]: !prev[fileName],
    }));
  };

  // Process data based on visibility
  const visibleData1 = fileVisibility[fileName1] ? data1 : [];
  const visibleData2 = fileName2 && fileVisibility[fileName2] ? data2 : [];

  return (
    <div className="space-y-6">
      {/* Visibility Controls */}
      <VisibilityControls
        fileName1={fileName1}
        fileName2={fileName2}
        visibility={fileVisibility}
        onVisibilityChange={handleVisibilityChange}
      />

      {/* Map Section */}
      {(visibleData1.length > 0 || (visibleData2 && visibleData2.length > 0)) ? (
        <FlightMap 
          data1={visibleData1}
          data2={visibleData2}
          fileName1={fileName1}
          fileName2={fileName2}
        />
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Select at least one file to view data</p>
          </CardContent>
        </Card>
      )}

      {/* Tables Section */}
      <div className={hasBothFiles ? "grid grid-cols-2 gap-6" : "w-full"}>
        <AnalysisDataTable 
          data={data1}
          title={fileName1}
          hasSyncPartner={hasBothFiles}
          onSyncChange={(isSynced, state) => handleSyncChange(isSynced, state, 'table1')}
          syncedState={isTablesSynced ? syncedState : undefined}
        />
        {data2 && fileName2 && (
          <AnalysisDataTable 
            data={data2}
            title={fileName2}
            hasSyncPartner={hasBothFiles}
            onSyncChange={(isSynced, state) => handleSyncChange(isSynced, state, 'table2')}
            syncedState={isTablesSynced ? syncedState : undefined}
          />
        )}
      </div>
    </div>
  );
}