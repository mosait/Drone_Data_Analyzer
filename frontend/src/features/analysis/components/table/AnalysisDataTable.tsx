// src/features/analysis/components/table/AnalysisDataTable.tsx
import { useState } from 'react';
import { DataTableComponent } from '@/features/data-table/components/DataTableComponent';
import { DroneData } from "@/api/types";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";

interface AnalysisDataTableProps {
  data: DroneData[];
  title: string;
  className?: string;  // We can keep this but won't pass it to DataTableComponent
}

export function AnalysisDataTable({ 
  data, 
  title,
  className  // Keep receiving it but don't pass it down
}: AnalysisDataTableProps) {
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [isSynced, setIsSynced] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className={className}>
      <DataTableComponent 
        data={data} 
        title={title}
        fileId={title}
        pageSize={pageSize}
        pageIndex={pageIndex}
        onPageSizeChange={setPageSize}
        onPageIndexChange={setPageIndex}
        isSynced={isSynced}
        hasBothFiles={false}
        globalFilter={globalFilter}
        columnFilters={columnFilters}
        onGlobalFilterChange={setGlobalFilter}
        onColumnFiltersChange={setColumnFilters}
        onIsSyncedChange={setIsSynced}
        sorting={sorting}
        onSortingChange={(updaterOrValue) => {
          if (typeof updaterOrValue === 'function') {
            setSorting(updaterOrValue(sorting));
          } else {
            setSorting(updaterOrValue);
          }
        }}
        showFilters={showFilters}
        onShowFiltersChange={setShowFilters}
      />
    </div>
  );
}