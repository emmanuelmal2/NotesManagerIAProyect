// Página de inicio / landing después de login
// Muestra un saludo personalizado y accesos rápidos a notas y tareas

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/home.css";

function Home() {
  const [user, setUser] = useState(null);   // datos del usuario autenticado
  const navigate = useNavigate();

  // Carga los datos del usuario (/me) al montar el componente
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
        // Si no hay token, redirige al login
          navigate("/login");
          return;
        }

        // Llama al backend para obtener info del usuario actual
        const { data } = await axios.get("/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(data);
      } catch (err) {
        console.error("Error cargando /me:", err);
        navigate("/login");
      }
    })();
  }, [navigate]);

  // Obtiene solo el primer nombre para el saludo ("Emmanuel Maldonado" → "Emmanuel)
  const firstName = user?.name?.trim().split(" ")[0] || "";

  return (
    <div className="home-wrapper">
      <div className="home-inner">
        {/* Columna izquierda: sección principal */}
        <section className="home-hero">
          <p className="home-pill">Gestor de estudio</p>

          {/* Título con efecto de escritura */}
          <div className="typing-container">
            <h1 className="typing-text">
              <span>Hola {firstName} 👋</span>
            </h1>
          </div>

          <p className="home-subtitle">
            Organiza tus notas, tareas y documentos en un solo lugar,
            sin perder el enfoque en lo importante.
          </p>

          {/* Acciones principales de navegación */}
          <div className="home-actions">
            <button className="btn" onClick={() => navigate("/dashboard")}>
              Ver notas
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/tasks")}
            >
              Ver tareas
            </button>
          </div>
        </section>

        {/* tarjetas de features */}
        <section className="home-features">
          <div className="home-feature-card">
            <h3>Notas rápidas</h3>
            <p>
              Crea y organiza notas con tags para tus materias, proyectos o ideas.
            </p>
          </div>

          <div className="home-feature-card">
            <h3>Tareas por fecha</h3>
            <p>
              Visualiza tus tareas en un calendario y mantén el control de tus
              entregas y exámenes.
            </p>
          </div>

          <div className="home-feature-card">
            <h3>Puedes subir PDFs</h3>
            <p>
              Guarda tu historial académico, guías o apuntes en PDF y consúltalos
              cuando los necesites.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
