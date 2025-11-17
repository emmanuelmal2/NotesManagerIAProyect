import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";  // Estilos específicos del navbar

// Componente de navegación principal
function Navbar() {
  const navigate = useNavigate();  // Hook para redirecciones 

  // Maneja el cierre de sesión del usuario
  function handleLogout() {
    localStorage.removeItem("token");  // Elimina el token almacenado (logout)
    navigate("/login");              
  }

  return (
    <nav className="navbar"> {/* Contenedor principal del navbar */}
      <div className="navbar-inner"> {/* Wrapper interno para distribución */}
        
  
        <div className="brand">
          <Link to="/home">Mi App</Link> {/* Link al inicio */}
        </div>

        {/* Acciones del menú */}
        <div className="nav-actions">
          <Link to="/dashboard">Notas</Link> 
          <Link to="/tasks">Tareas</Link>   

          {/* Botón para cerrar sesión */}
          <button onClick={handleLogout} className="btn btn-outline">
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
