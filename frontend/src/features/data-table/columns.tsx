// src/features/data-table/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { DroneData } from '@/api/types';

export const columns: ColumnDef<DroneData>[] = [
  {
    accessorKey: "timestamp",
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
      const timestamp = row.getValue<string>("timestamp");
      return timestamp ? new Date(timestamp).toLocaleTimeString() : 'N/A';
    },
  },
  {
    accessorKey: "gps.latitude",
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
      const latitude = row.original.gps?.latitude;
      return latitude !== undefined ? latitude.toFixed(6) : 'N/A';
    },
  },
  {
    accessorKey: "gps.longitude",
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
      const longitude = row.original.gps?.longitude;
      return longitude !== undefined ? longitude.toFixed(6) : 'N/A';
    },
  },
  {
    accessorKey: "gps.altitude",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Altitude (m)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const altitude = row.original.gps?.altitude;
      return altitude !== undefined ? `${altitude.toFixed(1)} m` : 'N/A';
    },
  },
  {
    accessorKey: "radar.distance",
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
      const distance = row.original.radar?.distance;
      return distance !== undefined ? `${distance.toFixed(1)} m` : 'N/A';
    },
  },
];