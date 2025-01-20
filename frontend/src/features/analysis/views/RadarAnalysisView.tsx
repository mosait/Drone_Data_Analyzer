// src/features/analysis/views/RadarAnalysisView.tsx
import { useState, useCallback } from "react";
import { DroneData } from "@/api/types";
import { SingleRadarChart } from "../components/charts/SingleRadarChart";
import { AnalysisDataTable } from "../components/table/AnalysisDataTable";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";

interface RadarAnalysisViewProps {
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

export function RadarAnalysisView({
  data1,
  data2,
  fileName1,
  fileName2,
}: RadarAnalysisViewProps) {
  const hasBothFiles = Boolean(data1 && data2);
  const [syncedState, setSyncedState] = useState<SharedTableState>(defaultState);
  const [isTablesSynced, setIsTablesSynced] = useState(false);

  // Handler for sync state changes for both tables
  const handleSyncChange = useCallback((isSynced: boolean, state: SharedTableState, table: 'table1' | 'table2') => {
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
      {/* Charts Section */}
      <div className={hasBothFiles ? "grid grid-cols-2 gap-6" : "w-full"}>
        <div className={hasBothFiles ? "" : "w-full"}>
          <SingleRadarChart 
            data={data1}
            fileName={fileName1}
            index={0}
          />
        </div>
        {data2 && fileName2 && (
          <SingleRadarChart 
            data={data2}
            fileName={fileName2}
            index={1}
          />
        )}
      </div>

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