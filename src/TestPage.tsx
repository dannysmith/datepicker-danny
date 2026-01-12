import { useState } from "react";
import { format } from "date-fns";
import { DatePicker } from "@/components/datepicker";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

export function TestPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const handleCommit = (newDate: Date) => {
    setDate(newDate);
    setOpen(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button variant="outline" className="justify-start gap-1">
              <CalendarIcon className="size-4 text-zinc-400" />
              <span>{format(date, "d MMM")}</span>
            </Button>
          }
        />
        <PopoverContent className="w-[200px]">
          <DatePicker
            value={date}
            onChange={() => {
              // Don't update the actual date during navigation - only on commit
            }}
            onCommit={handleCommit}
            placeholder="Select date"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default TestPage;
