import { format, isValid, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { ChangeEvent, ChangeEventHandler } from "react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

function calendarEndMonth(): Date {
  const y = new Date().getFullYear();

  return new Date(y + 50, 11, 1);
}

function parseYmd(value: string): Date | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const d = parseISO(trimmed);

  return isValid(d) ? d : undefined;
}

export interface DatePickerProps {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function DatePicker({
  value,
  onValueChange,
  id,
  disabled,
  required,
  className,
}: DatePickerProps) {
  const selected = useMemo(() => parseYmd(value), [value]);
  const [month, setMonth] = useState<Date>(() => parseYmd(value) ?? new Date());

  const handleCalendarChange = (
    v: string | number,
    event: ChangeEventHandler<HTMLSelectElement>,
  ) => {
    const newEvent = {
      target: {
        value: String(v),
      },
    } as ChangeEvent<HTMLSelectElement>;
    event(newEvent);
  };

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      onValueChange("");

      return;
    }

    onValueChange(format(date, "yyyy-MM-dd"));
  };

  return (
    <div className={cn("w-full", className)}>
      {required && (
        <input aria-hidden type="hidden" value={value} required />
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground",
            )}
            disabled={disabled}
            id={id}
            type="button"
            variant="outline"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected ? format(selected, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            captionLayout="dropdown"
            endMonth={calendarEndMonth()}
            components={{
              MonthCaption: (props) => <>{props.children}</>,
              DropdownNav: (props) => (
                <div className="flex w-full items-center gap-2">
                  {props.children}
                </div>
              ),
              Dropdown: (props) => (
                <Select
                  onValueChange={(v) => {
                    if (props.onChange) {
                      handleCalendarChange(v, props.onChange);
                    }
                  }}
                  value={String(props.value)}
                >
                  <SelectTrigger className="first:flex-1 last:shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {props.options?.map((option) => (
                      <SelectItem
                        disabled={option.disabled}
                        key={option.value}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ),
            }}
            hideNavigation
            mode="single"
            month={month}
            onMonthChange={setMonth}
            onSelect={handleSelect}
            selected={selected}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
