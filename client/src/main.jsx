import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

/* Globales (se aplican a toda la app) */
import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/layout.css";
import "./styles/components.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
