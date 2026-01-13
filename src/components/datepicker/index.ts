export { DatePicker } from "./DatePicker";
export type { DatePickerProps } from "./types";

// CSS is imported by DatePicker.tsx, but also re-exported here
// so consumers can import it separately if needed:
// import "@your-package/datepicker/datepicker.css"
import "./datepicker.css";
