import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DateRangePicker({ dateRange, onDateRangeChange, className }) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-normal ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-[280px] justify-start text-left",
          !dateRange && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="h-4 w-4" />
        {dateRange?.from ? (
          dateRange.to ? (
            <>
              {format(dateRange.from, "LLL dd, y")} -{" "}
              {format(dateRange.to, "LLL dd, y")}
            </>
          ) : (
            format(dateRange.from, "LLL dd, y")
          )
        ) : (
          <span>Pick a date range</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={onDateRangeChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
