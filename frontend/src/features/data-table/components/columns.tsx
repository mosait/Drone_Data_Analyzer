// src/features/data-table/components/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { DroneData } from "@/api/types"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

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
      return row.getValue("timestamp")
    },
  },
  {
    id: "waypoint",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Waypoint
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row, table }) => {
      // Get row index within the current page
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      const rowIndex = row.index;
      const globalIndex = pageIndex * pageSize + rowIndex;
      return `#${globalIndex + 1}`;
    },
    sortingFn: (rowA, rowB) => {
      return rowA.index - rowB.index;
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
      const latitude = row.original.gps?.latitude
      return latitude !== undefined ? latitude.toFixed(6) : 'N/A'
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
      const longitude = row.original.gps?.longitude
      return longitude !== undefined ? longitude.toFixed(6) : 'N/A'
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
      const altitude = row.original.gps?.altitude
      return altitude !== undefined ? `${altitude.toFixed(1)} m` : 'N/A'
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
          Distance (m)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const distance = row.original.radar?.distance
      return distance !== undefined ? `${distance.toFixed(1)} m` : 'N/A'
    },
  },
]