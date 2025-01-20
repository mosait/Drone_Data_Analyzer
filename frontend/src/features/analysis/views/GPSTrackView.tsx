// src/features/analysis/views/GPSTrackView.tsx
import { useState, useCallback } from "react";
import { DroneData } from "@/api/types";
import { FlightMap } from "../components/map/FlightMap";
import { AnalysisDataTable } from "../components/table/AnalysisDataTable";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";

interface GPSTrackViewProps {
  data1: DroneData[];
  data2?: DroneData[];
  fileName1: string;
  fileName2?: string;
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

  // Handler for sync state changes for both tables
  const handleSyncChange = useCallback((isSynced: boolean, state: SharedTableState, _table: 'table1' | 'table2') => {
    setIsTablesSynced(isSynced);
    if (isSynced) {
      setSyncedState({
        ...state,
        isTableSynced: true
      });
    } else {
      // If sync is turned off, reset everything
      setSyncedState(defaultState);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Map Section */}
      <FlightMap 
        data1={data1}
        data2={data2}
        fileName1={fileName1}
        fileName2={fileName2}
      />

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