// src/features/data-table/components/Columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { DroneData } from "@/api/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

const columnClass = "flex items-center justify-center min-w-[130px]";
const headerButtonClass = "h-8 font-medium flex items-center justify-center";

// Improved number comparison parsing
const parseNumberComparison = (value: string): { operator: string; number: number } | null => {
  // Trim whitespace and convert to lowercase
  const trimmedValue = value.trim().toLowerCase();
  
  // Regular expression to match the pattern: operator followed by number
  const pattern = /^(<=|>=|<|>|=)?\s*(-?\d+\.?\d*)$/;
  const match = trimmedValue.match(pattern);
  
  if (!match) return null;
  
  const [, operator = '=', numberStr] = match;
  const number = parseFloat(numberStr);
  
  if (isNaN(number)) return null;
  
  return { operator, number };
};

// Improved numeric filter function
const numericFilter = (value: number, filterValue: string): boolean => {
  if (!filterValue?.trim()) return true;

  const comparison = parseNumberComparison(filterValue);
  if (!comparison) return false;

  const { operator, number } = comparison;

  switch (operator) {
    case '<=': return value <= number;
    case '>=': return value >= number;
    case '<': return value < number;
    case '>': return value > number;
    case '=': return value === number;
    default: return value === number;
  }
};

// String filter function
const stringFilter = (value: string, filterValue: string): boolean => {
  return value.toLowerCase().includes(filterValue.toLowerCase());
};

export const columns: ColumnDef<DroneData>[] = [
  {
    id: "waypoint",
    accessorFn: (_row, rowIndex) => rowIndex + 1,
    header: ({ column }) => (
      <div className={columnClass}>
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={headerButtonClass}
        >
          Waypoint
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className={columnClass}>
        #{row.index + 1}
      </div>
    ),
    filterFn: (row, _columnId, filterValue) => {
      const value = row.index + 1;
      return numericFilter(value, filterValue);
    },
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <div className={columnClass}>
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={headerButtonClass}
        >
          Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className={columnClass}>
        {row.getValue("timestamp")}
      </div>
    ),
    filterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId) as string;
      return stringFilter(value, filterValue);
    },
  },
  {
    accessorKey: "gps.latitude",
    header: ({ column }) => (
      <div className={columnClass}>
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={headerButtonClass}
        >
          Latitude
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.original.gps?.latitude;
      return (
        <div className={columnClass}>
          {value !== undefined ? value.toFixed(6) : "N/A"}
        </div>
      );
    },
    filterFn: (row, _columnId, filterValue) => {
      const value = row.original.gps?.latitude;
      if (value === undefined) return false;
      return numericFilter(value, filterValue);
    },
  },
  {
    accessorKey: "gps.longitude",
    header: ({ column }) => (
      <div className={columnClass}>
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={headerButtonClass}
        >
          Longitude
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.original.gps?.longitude;
      return (
        <div className={columnClass}>
          {value !== undefined ? value.toFixed(6) : "N/A"}
        </div>
      );
    },
    filterFn: (row, _columnId, filterValue) => {
      const value = row.original.gps?.longitude;
      if (value === undefined) return false;
      return numericFilter(value, filterValue);
    },
  },
  {
    accessorKey: "gps.altitude",
    header: ({ column }) => (
      <div className={columnClass}>
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={headerButtonClass}
        >
          Altitude (m)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.original.gps?.altitude;
      return (
        <div className={columnClass}>
          {value !== undefined ? `${value.toFixed(1)} m` : "N/A"}
        </div>
      );
    },
    filterFn: (row, _columnId, filterValue) => {
      const value = row.original.gps?.altitude;
      if (value === undefined) return false;
      return numericFilter(value, filterValue);
    },
  },
  {
    accessorKey: "radar.distance",
    header: ({ column }) => (
      <div className={columnClass}>
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={headerButtonClass}
        >
          Distance (m)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.original.radar?.distance;
      return (
        <div className={columnClass}>
          {value !== undefined ? `${value.toFixed(1)} m` : "N/A"}
        </div>
      );
    },
    filterFn: (row, _columnId, filterValue) => {
      const value = row.original.radar?.distance;
      if (value === undefined) return false;
      return numericFilter(value, filterValue);
    },
  },
];
