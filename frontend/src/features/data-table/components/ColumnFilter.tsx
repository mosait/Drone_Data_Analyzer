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
    <div className="flex items-center justify-center px-2 mb-2">
      <div className="relative w-[130px]">
        <Input
          type="text"
          value={(columnFilterValue ?? '') as string}
          onChange={(event) => column.setFilterValue(event.target.value)}
          placeholder={`Filter...`}
          className="h-8 text-xs pr-6"
        />
        {columnFilterValue ? (
          <Button
            variant="ghost"
            onClick={() => column.setFilterValue('')}
            className="h-8 w-6 p-0 absolute right-0 top-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}