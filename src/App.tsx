import { useState } from "react";
import { DatePicker } from "@/components/datepicker";

export function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-xl font-semibold text-zinc-100">DatePicker Demo</h1>

        <DatePicker
          value={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            console.log("Selected:", date.toDateString());
          }}
        />

        <p className="text-sm text-zinc-400">
          Selected: {selectedDate.toDateString()}
        </p>
      </div>
    </div>
  );
}

export default App;
