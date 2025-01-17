// src/features/data-table/DataTable.tsx
import { useState } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader, AlertCircle } from 'lucide-react';
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { DataTableComponent } from './components/DataTableComponent';
import { MetricsCards } from './components/MetricsCards';

export default function DataTable() {
  const { currentDataMap, metricsMap, fileSlots, isLoading } = useDataStore();
  const [sharedPageSize, setSharedPageSize] = useState(10);
  const [sharedPageIndex, setSharedPageIndex] = useState(0);
  const [isSynced, setIsSynced] = useState(false);
  const [syncedGlobalFilter, setSyncedGlobalFilter] = useState("");
  const [syncedColumnFilters, setSyncedColumnFilters] = useState<ColumnFiltersState>([]);
  const [syncedSorting, setSyncedSorting] = useState<SortingState>([]);
  const [syncedShowFilters, setSyncedShowFilters] = useState(false);

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
            Please select a flight data file to view the data table.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSyncChange = (checked: boolean) => {
    setIsSynced(checked);
    if (!checked) {
      setSyncedGlobalFilter("");
      setSyncedColumnFilters([]);
      setSyncedSorting([]);
      setSyncedShowFilters(false);
    }
  };

  const renderTableSection = (fileId: string, fileName: string) => {
    const data = currentDataMap[fileId];
    const metrics = metricsMap[fileId]?.flightMetrics;

    if (!data || !metrics) return null;

    return (
      <div className="space-y-4">
        <MetricsCards metrics={metrics} />
        <DataTableComponent 
          data={data} 
          title={fileName} 
          fileId={fileId}
          pageSize={sharedPageSize}
          pageIndex={sharedPageIndex}
          onPageSizeChange={setSharedPageSize}
          onPageIndexChange={setSharedPageIndex}
          isSynced={isSynced}
          hasBothFiles={Boolean(fileSlots.slot1 && fileSlots.slot2)}
          globalFilter={syncedGlobalFilter}
          columnFilters={syncedColumnFilters}
          onGlobalFilterChange={setSyncedGlobalFilter}
          onColumnFiltersChange={(updater) => setSyncedColumnFilters(updater)}
          onIsSyncedChange={handleSyncChange}
          sorting={isSynced ? syncedSorting : undefined}
          onSortingChange={(updaterOrValue) => {
            if (typeof updaterOrValue === 'function') {
              setSyncedSorting(updaterOrValue);
            } else {
              setSyncedSorting(updaterOrValue);
            }
          }}
          showFilters={isSynced ? syncedShowFilters : undefined}
          onShowFiltersChange={isSynced ? setSyncedShowFilters : undefined}
        />
      </div>
    );
  };

  const hasBothFiles = Boolean(fileSlots.slot1 && fileSlots.slot2);

  return (
    <div className="space-y-6 p-6">
      <div className={`grid ${hasBothFiles ? 'grid-cols-2 gap-8' : 'grid-cols-1'}`}>
        {fileSlots.slot1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">File 1: {fileSlots.slot1.filename}</h2>
            {renderTableSection(fileSlots.slot1.id, fileSlots.slot1.filename)}
          </div>
        )}
        {fileSlots.slot2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">File 2: {fileSlots.slot2.filename}</h2>
            {renderTableSection(fileSlots.slot2.id, fileSlots.slot2.filename)}
          </div>
        )}
      </div>
    </div>
  );
}