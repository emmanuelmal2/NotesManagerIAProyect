import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";

/* Estilos globales
   Se cargan una sola vez al inicio.
   - reset.css     → normaliza estilos nativos del navegador
   - variables.css → define colores, tipografías y spacings globales
   - layout.css    → contenedores, tarjetas y helpers de layout
   - components.css→ estilos base de botones, inputs, alerts, etc.
*/
import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/layout.css";
import "./styles/components.css";


/* Punto de Entrada de la aplicacion 
   React 18 usa createRoot (concurrent features)
   BrowserRouter envuelve toda la app para habilitar rutas.
   StrictMode activa validaciones adicionales en desarrollo.
*/
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Habilita el enrutamiento con React Router */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
