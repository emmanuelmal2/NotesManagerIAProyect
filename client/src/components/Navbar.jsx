import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";


function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");  // borrar token
    navigate("/login");                // redirigir al login
  }

return (
  <nav className="navbar">
    <div className="navbar-inner">
      <div className="brand">
        <Link to="/home">Mi App</Link>
      </div>

      <div className="nav-actions">
        <Link to="/dashboard">Notas</Link>
        <Link to="/tasks">Tareas</Link>

        <button onClick={handleLogout} className="btn btn-outline">
          Cerrar sesión
        </button>
      </div>
    </div>
  </nav>
);
}

export default Navbar;
