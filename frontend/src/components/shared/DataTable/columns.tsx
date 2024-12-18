// src/components/shared/DataTable/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { DroneData } from "../../../api/types"

export const columns: ColumnDef<DroneData>[] = [
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ row }) => {
      return new Date(row.getValue("timestamp")).toLocaleString()
    },
  },
  {
    accessorKey: "altitude",
    header: "Altitude (m)",
    cell: ({ row }) => {
      return `${row.getValue("altitude")} m`
    },
  },
  {
    accessorFn: (row) => row.gps.latitude,
    header: "Latitude",
    cell: ({ row }) => {
      return row.original.gps.latitude.toFixed(6)
    },
  },
  {
    accessorFn: (row) => row.gps.longitude,
    header: "Longitude",
    cell: ({ row }) => {
      return row.original.gps.longitude.toFixed(6)
    },
  },
  {
    accessorFn: (row) => row.radar.distance,
    header: "Radar Distance (m)",
    cell: ({ row }) => {
      return `${row.original.radar.distance.toFixed(2)} m`
    },
  },
  {
    accessorFn: (row) => row.radar.velocity,
    header: "Velocity (m/s)",
    cell: ({ row }) => {
      return `${row.original.radar.velocity.toFixed(2)} m/s`
    },
  },
]