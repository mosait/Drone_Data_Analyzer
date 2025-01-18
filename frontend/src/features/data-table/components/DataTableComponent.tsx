// src/features/data-table/components/DataTableComponent.tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  SortingState,
  flexRender,
  OnChangeFn,
} from "@tanstack/react-table";
import { columns } from './Columns';
import { Button } from '@/components/ui/button';
import { api } from '@/api/endpoints';
import { ColumnFilter } from './ColumnFilter';
import { DataTableHeader } from './DataTableHeader';
import { TablePagination } from './TablePagination';
import { DroneData } from '@/api/types';

interface DataTableComponentProps {
  data: DroneData[];
  title: string;
  fileId: string;
  pageSize: number;
  pageIndex: number;
  onPageSizeChange: (newSize: number) => void;
  onPageIndexChange: (newIndex: number) => void;
  isSynced: boolean;
  hasBothFiles: boolean;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  onGlobalFilterChange: (value: string) => void;
  onColumnFiltersChange: (updater: (old: ColumnFiltersState) => ColumnFiltersState) => void;
  onIsSyncedChange?: (checked: boolean) => void;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  showFilters?: boolean;
  onShowFiltersChange?: (show: boolean) => void;
}

export function DataTableComponent({ 
  data,
  title,
  fileId,
  pageSize,
  pageIndex,
  onPageSizeChange,
  onPageIndexChange,
  isSynced,
  hasBothFiles,
  globalFilter: syncedGlobalFilter,
  columnFilters: syncedColumnFilters,
  onGlobalFilterChange,
  onColumnFiltersChange,
  onIsSyncedChange,
  sorting: syncedSorting,
  onSortingChange,
  showFilters: syncedShowFilters,
  onShowFiltersChange,
}: DataTableComponentProps) {
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const [localGlobalFilter, setLocalGlobalFilter] = useState("");
  const [localColumnFilters, setLocalColumnFilters] = useState<ColumnFiltersState>([]);
  const [localShowFilters, setLocalShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Use either synced or local state based on isSynced flag
  const effectiveGlobalFilter = isSynced ? syncedGlobalFilter : localGlobalFilter;
  const effectiveColumnFilters = isSynced ? syncedColumnFilters : localColumnFilters;
  const effectiveSorting = isSynced && syncedSorting ? syncedSorting : localSorting;
  const effectiveShowFilters = isSynced && syncedShowFilters !== undefined ? syncedShowFilters : localShowFilters;

  const handleGlobalFilterChange = (value: string) => {
    if (isSynced) {
      onGlobalFilterChange(value);
    } else {
      setLocalGlobalFilter(value);
    }
  };

  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    if (isSynced && onSortingChange) {
      onSortingChange(updaterOrValue);
    } else {
      setLocalSorting(
        typeof updaterOrValue === 'function' 
          ? updaterOrValue(localSorting)
          : updaterOrValue
      );
    }
  };

  const handleShowFiltersChange = (show: boolean) => {
    if (isSynced && onShowFiltersChange) {
      onShowFiltersChange(show);
    } else {
      setLocalShowFilters(show);
    }
  };

  const handleColumnFiltersChange = (updaterOrValue: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
    if (isSynced) {
      if (typeof updaterOrValue === 'function') {
        onColumnFiltersChange(updaterOrValue);
      } else {
        onColumnFiltersChange(() => updaterOrValue);
      }
    } else {
      if (typeof updaterOrValue === 'function') {
        setLocalColumnFilters(updaterOrValue);
      } else {
        setLocalColumnFilters(() => updaterOrValue);
      }
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true);
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
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    state: {
      sorting: effectiveSorting,
      columnFilters: effectiveColumnFilters,
      globalFilter: effectiveGlobalFilter,
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex: pageIndex,
          pageSize: pageSize,
        });
        if (newState.pageIndex !== pageIndex) {
          onPageIndexChange(newState.pageIndex);
        }
        if (newState.pageSize !== pageSize) {
          onPageSizeChange(newState.pageSize);
        }
      } else {
        if (updater.pageIndex !== pageIndex) {
          onPageIndexChange(updater.pageIndex);
        }
        if (updater.pageSize !== pageSize) {
          onPageSizeChange(updater.pageSize);
        }
      }
    },
  });

  return (
    <Card className="p-2">
      <CardContent className="p-4 space-y-6">
        <DataTableHeader
          title={title}
          globalFilter={effectiveGlobalFilter}
          onGlobalFilterChange={handleGlobalFilterChange}
          showFilters={effectiveShowFilters}
          onToggleFilters={() => handleShowFiltersChange(!effectiveShowFilters)}
          onExport={handleExport}
          isExporting={isExporting}
          hasBothFiles={hasBothFiles}
          isSynced={isSynced}
          onIsSyncedChange={onIsSyncedChange}
          fileId={fileId}
        />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id} 
                      className={hasBothFiles ? "h-10 px-0.5 min-w-0" : "h-11 px-4"}
                    >
                      {header.isPlaceholder
                        ? null
                        : (
                          <div>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {effectiveShowFilters && (
                              <div className="mt-1">
                                <ColumnFilter column={header.column} />
                              </div>
                            )}
                          </div>
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id}
                        className={hasBothFiles ? "py-2 px-0.5 min-w-0" : "p-4"}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination 
          table={table}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
        />
      </CardContent>
    </Card>
  );
}