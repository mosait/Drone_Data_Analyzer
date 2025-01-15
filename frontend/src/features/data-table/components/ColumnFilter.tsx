// src/features/data-table/components/ColumnFilter.tsx
import { Column } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

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
        onChange={(event) => column.setFilterValue(event.target.value)}
        placeholder={`Filter ${column.id}...`}
        className="h-8 w-[150px]"
      />
      {columnFilterValue ? (
        <Button
          variant="ghost"
          onClick={() => column.setFilterValue('')}
          className="h-8 px-2"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}