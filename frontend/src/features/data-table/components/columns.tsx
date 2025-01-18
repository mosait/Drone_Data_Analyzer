// src/features/data-table/components/Columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { DroneData } from "@/api/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

const columnClass = "flex items-center justify-center min-w-[130px]";
const headerButtonClass = "h-8 font-medium flex items-center justify-center";

// Helper functions for numeric filtering (keeping the existing ones)
const parseNumberComparison = (value: string) => {
  const ops = ["<=", ">=", "<", ">", "="];
  let operator = "=";
  let number = value;

  for (const op of ops) {
    if (value.startsWith(op)) {
      operator = op;
      number = value.substring(op.length);
      break;
    }
  }

  const num = parseFloat(number);
  if (isNaN(num)) return null;

  return { operator, number: num };
};

const numericFilter = (value: number, filterValue: string): boolean => {
  const comparison = parseNumberComparison(filterValue);
  if (!comparison) return true;

  switch (comparison.operator) {
    case "<=": return value <= comparison.number;
    case ">=": return value >= comparison.number;
    case "<": return value < comparison.number;
    case ">": return value > comparison.number;
    case "=": return value === comparison.number;
    default: return true;
  }
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
    filterFn: (row, id, filterValue) => {
      const value = row.original.gps?.latitude;
      if (value === undefined) return true;
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
    filterFn: (row, id, filterValue) => {
      const value = row.original.gps?.longitude;
      if (value === undefined) return true;
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
    filterFn: (row, id, filterValue) => {
      const value = row.original.gps?.altitude;
      if (value === undefined) return true;
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
    filterFn: (row, id, filterValue) => {
      const value = row.original.radar?.distance;
      if (value === undefined) return true;
      return numericFilter(value, filterValue);
    },
  },
];