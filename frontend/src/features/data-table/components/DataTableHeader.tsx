// src/features/data-table/components/DataTableHeader.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Download, Filter, X } from 'lucide-react';

interface DataTableHeaderProps {
  title: string;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onExport: (format: 'csv' | 'json') => Promise<void>;
  isExporting: boolean;
  hasBothFiles: boolean;
  isSynced: boolean;
  onIsSyncedChange?: (checked: boolean) => void;
  fileId: string;
}

export function DataTableHeader({
  title,
  globalFilter,
  onGlobalFilterChange,
  showFilters,
  onToggleFilters,
  onExport,
  isExporting,
  hasBothFiles,
  isSynced,
  onIsSyncedChange,
  fileId,
}: DataTableHeaderProps) {
  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className={showFilters ? 'bg-accent' : ''}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('csv')}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('json')}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center flex-1">
          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
          <div className="relative flex-1 max-w-sm">
            <Input
              placeholder="Search all columns..."
              value={globalFilter ?? ""}
              onChange={(event) => onGlobalFilterChange(event.target.value)}
              className="w-full text-sm pr-7"
            />
            {globalFilter && (
              <Button
                variant="ghost"
                onClick={() => onGlobalFilterChange("")}
                className="h-full px-2 absolute right-0 top-0 hover:bg-transparent"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Checkbox
            id={`sync-${fileId}`}
            checked={isSynced}
            onCheckedChange={(checked) => onIsSyncedChange?.(checked as boolean)}
            disabled={!hasBothFiles}
          />
          <label
            htmlFor={`sync-${fileId}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Sync Tables
          </label>
        </div>
      </div>
    </>
  );
}