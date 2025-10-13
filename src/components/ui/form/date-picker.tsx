"use client";
import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../feedback/popover";
import { Input } from "./input";
export interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}
export function DatePicker({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  className,
  disabled = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const formatToVietnamese = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isValid(date)) {
        return format(date, "dd/MM/yyyy", { locale: vi });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
    }
    return "";
  };
  const parseFromVietnamese = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = parse(dateString, "dd/MM/yyyy", new Date(), { locale: vi });
      if (isValid(date)) {
        return format(date, "yyyy-MM-dd");
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
    return "";
  };
  React.useEffect(() => {
    if (value) {
      setInputValue(formatToVietnamese(value));
    } else {
      setInputValue("");
    }
  }, [value]);
  const selectedDate = value ? new Date(value) : undefined;
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = format(date, "yyyy-MM-dd");
      setInputValue(formatToVietnamese(dateString));
      onChange?.(dateString);
      setIsOpen(false);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (dateRegex.test(inputVal)) {
      const internalFormat = parseFromVietnamese(inputVal);
      if (internalFormat) {
        onChange?.(internalFormat);
      }
    }
  };
  const handleInputBlur = () => {
    if (inputValue) {
      const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
      if (dateRegex.test(inputValue)) {
        const internalFormat = parseFromVietnamese(inputValue);
        if (internalFormat) {
          const formattedDate = formatToVietnamese(internalFormat);
          setInputValue(formattedDate);
          onChange?.(internalFormat);
        }
      } else {
        if (value) {
          setInputValue(formatToVietnamese(value));
        } else {
          setInputValue("");
        }
      }
    }
  };
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={disabled}
        className={cn("pl-10", className)}
        onFocus={() => {
        }}
      />
      {/* Calendar picker button - single icon on the left */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer z-10"
            disabled={disabled}
            aria-label="Chọn ngày từ lịch"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(!isOpen);
            }}
          >
            <CalendarIcon className="h-4 w-4 text-gray-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border border-gray-200 shadow-lg rounded-lg" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
            locale={vi}
            classNames={{
              months: "flex flex-col sm:flex-row gap-2",
              month: "flex flex-col gap-4",
              caption: "flex justify-center pt-1 relative items-center w-full",
              caption_label: "text-sm font-medium text-gray-900",
              nav: "flex items-center gap-1",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-gray-300 rounded hover:bg-gray-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-x-1",
              head_row: "flex",
              head_cell: "text-gray-500 rounded-md w-8 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
              day: "h-8 w-8 p-0 font-normal hover:bg-gray-100 rounded-md transition-colors",
              day_selected: "bg-[#FD8B51] text-white hover:bg-[#CB6040] focus:bg-[#FD8B51]",
              day_today: "bg-gray-100 text-gray-900 font-semibold",
              day_outside: "text-gray-400 opacity-50",
              day_disabled: "text-gray-300 opacity-50 cursor-not-allowed",
              day_hidden: "invisible",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}