// main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./routers/App";
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
      <App />
  </BrowserRouter>
);
