// src/features/data-table/components/ColumnFilter.tsx
import { useState, useEffect } from "react";
import { Column } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";

interface ColumnFilterProps<TData> {
  column: Column<TData>;
}

export function ColumnFilter<TData>({ column }: ColumnFilterProps<TData>) {
  const [value, setValue] = useState<string>('');
  const debouncedValue = useDebounce<string>(value, 300);

  useEffect(() => {
    column.setFilterValue(debouncedValue);
  }, [debouncedValue, column]);

  useEffect(() => {
    setValue(String(column.getFilterValue() || ''));
  }, [column.getFilterValue()]);

  return (
    <div className="flex items-center justify-center px-2 mb-2">
      <div className="relative w-[130px]">
        <Input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={`Filter...`}
          className="h-8 text-xs pr-6"
        />
        {value && (
          <Button
            variant="ghost"
            onClick={() => {
              setValue('');
              column.setFilterValue('');
            }}
            className="h-8 w-6 p-0 absolute right-0 top-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}