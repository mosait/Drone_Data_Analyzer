// src/features/data-table/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { DroneDataRow } from '@/api/types';

export const columns: ColumnDef<DroneDataRow>[] = [
  {
    accessorKey: "time",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      // Format the timestamp to be more readable
      const date = new Date(row.getValue("time"));
      return date.toLocaleTimeString();
    },
  },
  {
    accessorKey: "latitude",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Latitude
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return row.getValue<number>("latitude").toFixed(4);
    },
  },
  {
    accessorKey: "longitude",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Longitude
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return row.getValue<number>("longitude").toFixed(4);
    },
  },
  {
    accessorKey: "gps_altitude",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GPS Altitude (m)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return `${row.getValue<number>("gps_altitude").toFixed(1)} m`;
    },
  },
  {
    accessorKey: "radar_distance",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Radar Distance (m)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return `${row.getValue<number>("radar_distance").toFixed(1)} m`;
    },
  },
  {
    accessorKey: "altitude",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Altitude Sea Level/Drone (m)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return `${row.getValue<number>("altitude").toFixed(1)} m`;
    },
  }
];