// src/features/data-table/DataTable.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Download, Search, Loader } from 'lucide-react';
import { columns } from './columns';
import { DroneData } from '@/api/types';
import { useDataStore } from '@/store/useDataStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function DataTable() {
  const { currentData, metrics, isLoading, error } = useDataStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: currentData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const handleExport = () => {
    if (!currentData?.length) return;
    
    // Create CSV content
    const headers = ['timestamp', 'latitude', 'longitude', 'altitude', 'radar_distance'];
    const rows = currentData.map(row => [
      row.timestamp,
      row.gps.latitude.toFixed(6),
      row.gps.longitude.toFixed(6),
      row.gps.altitude,
      row.radar.distance
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drone_data.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

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

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentData || currentData.length === 0) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a flight data file to view the data table.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-8">
      {/* Flight Metrics Summary */}
      {metrics?.flightMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Flight Duration</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">{metrics.flightMetrics.duration} min</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Max Altitude</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">{metrics.flightMetrics.maxAltitude} m</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Distance</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">{metrics.flightMetrics.avgDistance} m</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Data Points</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">{metrics.flightMetrics.totalPoints}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Flight Data</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
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
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} row(s) total
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}