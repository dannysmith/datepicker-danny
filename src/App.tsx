import { useState } from "react";
import { addDays } from "date-fns";
import { DatePicker } from "@/components/datepicker";

export function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [constrainedDate, setConstrainedDate] = useState<Date>(new Date());

  // Constrain to -3 days to +14 days from today
  const minDate = addDays(new Date(), -3);
  const maxDate = addDays(new Date(), 14);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h1 className="text-lg font-semibold text-zinc-100">Unconstrained</h1>
            <p className="text-sm text-zinc-400">
              Selected: {selectedDate.toDateString()}
            </p>
          </div>

          <DatePicker
            value={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              console.log("Selected:", date.toDateString());
            }}
          />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h1 className="text-lg font-semibold text-zinc-100">Constrained</h1>
            <p className="text-xs text-zinc-500">
              {minDate.toLocaleDateString()} - {maxDate.toLocaleDateString()}
            </p>
            <p className="text-sm text-zinc-400">
              Selected: {constrainedDate.toDateString()}
            </p>
          </div>

          <DatePicker
            value={constrainedDate}
            minDate={minDate}
            maxDate={maxDate}
            onChange={(date) => {
              setConstrainedDate(date);
              console.log("Constrained selected:", date.toDateString());
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
