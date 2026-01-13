/**
 * Isolated entry point - NO Tailwind CSS imported
 *
 * This renders IsolatedTestPage without any external CSS,
 * so we can see exactly how the DatePicker looks with only its own styles.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { IsolatedTestPage } from "./IsolatedTestPage";

// Note: We deliberately do NOT import "./index.css" here
// The only CSS should come from the DatePicker component itself

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IsolatedTestPage />
  </StrictMode>
);
