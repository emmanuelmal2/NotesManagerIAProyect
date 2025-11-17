// Ruta protegida: solo permite acceder si el usuario tiene token válido
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

function ProtectedRoute() {
  // Token guardado en localStorage indica sesión iniciada
  const token = localStorage.getItem("token");

  // Hook para obtener la ruta actual y permitir lógica basada en ella
  const location = useLocation();

  // Si no hay token, se fuerza navegación al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Definición de rutas individuales donde no se debe mostrar el navbar
  const hideNavbar = location.pathname === "/home";

  return (
    <>
      {/* Navbar visible solo si la ruta no está en la lista de ocultar */}
      {!hideNavbar && <Navbar />}

      {/* Renderiza la ruta hija protegida */}
      <Outlet />
    </>
  );
}

export default ProtectedRoute;
