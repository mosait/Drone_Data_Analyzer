// src/features/analysis/components/table/AnalysisDataTable.tsx
import { useState, useCallback } from 'react';
import { DataTableComponent } from '@/features/data-table/components/DataTableComponent';
import { DroneData } from "@/api/types";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { OnChangeFn } from '@tanstack/react-table';
import { api } from '@/api/endpoints';
import { useDataStore } from '@/store/useDataStore';

interface AnalysisDataTableProps {
  data: DroneData[];
  title: string;
  className?: string;
  hasSyncPartner?: boolean;
  onSyncChange?: (isSynced: boolean, state: any) => void;
  syncedState?: {
    globalFilter: string;
    columnFilters: ColumnFiltersState;
    sorting: SortingState;
    showFilters: boolean;
    pageSize: number;
    pageIndex: number;
    isTableSynced: boolean;
  };
}

export function AnalysisDataTable({ 
  data, 
  title,
  className,
  hasSyncPartner = false,
  onSyncChange,
  syncedState
}: AnalysisDataTableProps) {
  const { fileSlots } = useDataStore();
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [isSynced, setIsSynced] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Get the actual fileId from fileSlots based on the filename
  const getFileId = useCallback((filename: string) => {
    const slot1 = fileSlots.slot1;
    const slot2 = fileSlots.slot2;
    if (slot1 && slot1.filename === filename) return slot1.id;
    if (slot2 && slot2.filename === filename) return slot2.id;
    return null;
  }, [fileSlots]);

  // Handle export with proper fileId
  const handleExport = useCallback(async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true);
      const fileId = getFileId(title);
      
      if (!fileId) {
        console.error('File ID not found for:', title);
        return;
      }

      const blob = await api.analysis.export(fileId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drone_data_${title.toLowerCase().replace(/\s+/g, '_')}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
    } finally {
      setIsExporting(false);
    }
  }, [title, getFileId]);

  // Get current state
  const getCurrentState = useCallback(() => ({
    globalFilter,
    columnFilters,
    sorting,
    showFilters,
    pageSize,
    pageIndex,
    isTableSynced: isSynced
  }), [globalFilter, columnFilters, sorting, showFilters, pageSize, pageIndex, isSynced]);

  // Handle sync change
  const handleSyncChange = useCallback((checked: boolean) => {
    setIsSynced(checked);
    if (onSyncChange) {
      onSyncChange(checked, getCurrentState());
    }
  }, [onSyncChange, getCurrentState]);

  // Handle filter change
  const handleGlobalFilterChange = useCallback((value: string) => {
    setGlobalFilter(value);
    if (isSynced && onSyncChange) {
      onSyncChange(true, { ...getCurrentState(), globalFilter: value });
    }
  }, [isSynced, onSyncChange, getCurrentState]);

  // Handle column filters change
  const handleColumnFiltersChange = useCallback((updater: (old: ColumnFiltersState) => ColumnFiltersState) => {
    setColumnFilters(current => {
      const newFilters = updater(current);
      if (isSynced && onSyncChange) {
        onSyncChange(true, { ...getCurrentState(), columnFilters: newFilters });
      }
      return newFilters;
    });
  }, [isSynced, onSyncChange, getCurrentState]);

  // Handle sorting change
  const handleSortingChange: OnChangeFn<SortingState> = useCallback((updaterOrValue) => {
    setSorting(old => {
      const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(old) : updaterOrValue;
      if (isSynced && onSyncChange) {
        onSyncChange(true, { ...getCurrentState(), sorting: newSorting });
      }
      return newSorting;
    });
  }, [isSynced, onSyncChange, getCurrentState]);

  // Handle filters visibility
  const handleShowFiltersChange = useCallback((show: boolean) => {
    setShowFilters(show);
    if (!show) {
      setColumnFilters([]);
      setGlobalFilter("");
    }
    if (isSynced && onSyncChange) {
      onSyncChange(true, { 
        ...getCurrentState(), 
        showFilters: show,
        columnFilters: !show ? [] : columnFilters,
        globalFilter: !show ? "" : globalFilter
      });
    }
  }, [isSynced, onSyncChange, getCurrentState, columnFilters, globalFilter]);

  return (
    <div className={className}>
      <DataTableComponent 
        data={data} 
        title={title}
        fileId={getFileId(title) || title} 
        pageSize={syncedState?.pageSize ?? pageSize}
        pageIndex={syncedState?.pageIndex ?? pageIndex}
        onPageSizeChange={setPageSize}
        onPageIndexChange={setPageIndex}
        isSynced={syncedState?.isTableSynced ?? isSynced}
        hasBothFiles={hasSyncPartner}
        globalFilter={syncedState?.globalFilter ?? globalFilter}
        columnFilters={syncedState?.columnFilters ?? columnFilters}
        onGlobalFilterChange={handleGlobalFilterChange}
        onColumnFiltersChange={handleColumnFiltersChange}
        onIsSyncedChange={handleSyncChange}
        sorting={syncedState?.sorting ?? sorting}
        onSortingChange={handleSortingChange}
        showFilters={syncedState?.showFilters ?? showFilters}
        onShowFiltersChange={handleShowFiltersChange}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  );
}