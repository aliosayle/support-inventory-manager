
import React from "react";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define the interface without extending HTMLAttributes to avoid conflicts
interface DateRangePickerProps {
  className?: string;
  value?: DateRange | undefined;
  onChange?: (value: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  value,
  onChange,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    value || {
      from: new Date(),
      to: addDays(new Date(), 7),
    }
  );

  React.useEffect(() => {
    if (value) {
      setDate(value);
    }
  }, [value]);

  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);
    onChange?.(newDate);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function CalendarDateRangePicker({
  className,
  value,
  onChange,
}: DateRangePickerProps) {
  return <DateRangePicker className={className} value={value} onChange={onChange} />;
}
