import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
}

const presetRanges = [
  {
    label: 'Last 7 days',
    range: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date()
    }
  },
  {
    label: 'Last 30 days',
    range: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    }
  },
  {
    label: 'Last 90 days',
    range: {
      from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      to: new Date()
    }
  },
  {
    label: 'This year',
    range: {
      from: new Date(new Date().getFullYear(), 0, 1),
      to: new Date()
    }
  }
];

export const DateRangePicker = ({
  dateRange,
  onDateRangeChange,
  className
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDateRange = (range: DateRange) => {
    if (!range.from) {
      return 'Pick a date';
    }
    if (!range.to) {
      return format(range.from, 'LLL dd, y');
    }
    return `${format(range.from, 'LLL dd, y')} - ${format(range.to, 'LLL dd, y')}`;
  };

  const handlePresetSelect = (preset: typeof presetRanges[0]) => {
    onDateRangeChange(preset.range);
    setIsOpen(false);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full sm:w-[280px] justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 max-w-[90vw]" align="start">
          <div className="flex flex-col sm:flex-row">
            <div className="border-r-0 sm:border-r border-b sm:border-b-0">
              <div className="p-3">
                <div className="text-sm font-medium mb-2">Quick ranges</div>
                <div className="space-y-1">
                  {presetRanges.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs sm:text-sm"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  if (range) {
                    onDateRangeChange(range);
                    if (range.from && range.to) {
                      setIsOpen(false);
                    }
                  }
                }}
                numberOfMonths={window.innerWidth > 768 ? 2 : 1}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};