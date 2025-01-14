// src/components/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { DroneData } from "@/api/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

// Common header button class
const headerButtonClass = "w-full justify-center font-semibold";
const columnClass = "w-[200px]"; // Fixed width for all columns

// Helper function to parse number comparison
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

// Custom filter function for numeric values
const numericFilter = (value: number, filterValue: string): boolean => {
  const comparison = parseNumberComparison(filterValue);
  if (!comparison) return true;

  switch (comparison.operator) {
    case "<=":
      return value <= comparison.number;
    case ">=":
      return value >= comparison.number;
    case "<":
      return value < comparison.number;
    case ">":
      return value > comparison.number;
    case "=":
      return value === comparison.number;
    default:
      return true;
  }
};

export const columns: ColumnDef<DroneData>[] = [
  {
    id: "waypoint",
    accessorFn: (_row, rowIndex) => rowIndex + 1, // Compute global waypoint index
    header: ({ column }) => (
      <div className={`text-center ${columnClass}`}>
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={`${headerButtonClass} flex items-center justify-center gap-1`}
        >
          <span className="inline-block">Waypoint</span>
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className={`text-center ${columnClass}`}>
        <span className="inline-block w-[40px]">{`#${row.index + 1}`}</span>
      </div>
    ),
    sortingFn: (rowA, rowB) => rowA.index - rowB.index, // Sort by computed index
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <div className={`text-center ${columnClass}`}>
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
      <div className={`text-center ${columnClass}`}>{row.getValue("timestamp")}</div>
    ),
  },
  {
    accessorKey: "gps.latitude",
    header: ({ column }) => (
      <div className={`text-center ${columnClass}`}>
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
      const latitude = row.original.gps?.latitude;
      return (
        <div className={`text-center ${columnClass}`}>
          {latitude !== undefined ? latitude.toFixed(6) : "N/A"}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const value = row.original.gps?.latitude;
      if (value === undefined) return true;
      return numericFilter(value, filterValue);
    },
  },
  {
    accessorKey: "gps.longitude",
    header: ({ column }) => (
      <div className={`text-center ${columnClass}`}>
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
      const longitude = row.original.gps?.longitude;
      return (
        <div className={`text-center ${columnClass}`}>
          {longitude !== undefined ? longitude.toFixed(6) : "N/A"}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const value = row.original.gps?.longitude;
      if (value === undefined) return true;
      return numericFilter(value, filterValue);
    },
  },
  {
    accessorKey: "gps.altitude",
    header: ({ column }) => (
      <div className={`text-center ${columnClass}`}>
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
      const altitude = row.original.gps?.altitude;
      return (
        <div className={`text-center ${columnClass}`}>
          {altitude !== undefined ? `${altitude.toFixed(1)} m` : "N/A"}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const value = row.original.gps?.altitude;
      if (value === undefined) return true;
      return numericFilter(value, filterValue);
    },
  },
  {
    accessorKey: "radar.distance",
    header: ({ column }) => (
      <div className={`text-center ${columnClass}`}>
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
      const distance = row.original.radar?.distance;
      return (
        <div className={`text-center ${columnClass}`}>
          {distance !== undefined ? `${distance.toFixed(1)} m` : "N/A"}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const value = row.original.radar?.distance;
      if (value === undefined) return true;
      return numericFilter(value, filterValue);
    },
  },
];
