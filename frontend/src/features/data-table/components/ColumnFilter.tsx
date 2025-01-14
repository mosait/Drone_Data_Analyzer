// src/features/data-table/components/ColumnFilter.tsx
import { Column } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface ColumnFilterProps<TData> {
  column: Column<TData>
}

export function ColumnFilter<TData>({ column }: ColumnFilterProps<TData>) {
  const columnFilterValue = column.getFilterValue()

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={(event) =>
          column.setFilterValue(event.target.value)
        }
        placeholder={`Filter ${column.id}...`}
        className="h-8 w-[150px]"
      />
      {columnFilterValue ? (
        <Badge 
          variant="secondary" 
          className="cursor-pointer"
          onClick={() => column.setFilterValue(null)}
        >
          <X className="h-3 w-3" />
        </Badge>
      ) : null}
    </div>
  )
}