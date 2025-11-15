// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/home.css";

function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const { data } = await axios.get("/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(data); // { id, name, email }
      } catch (err) {
        console.error("Error cargando /me:", err);
        navigate("/login");
      }
    })();
  }, [navigate]);

  const firstName = user?.name?.trim().split(" ")[0] || "";

  return (
    <div className="home-wrapper">
      <div className="home-inner">
        {/* Columna izquierda: hero */}
        <section className="home-hero">
          <p className="home-pill">Gestor de estudio</p>

      
        <div class="typing-container">
            <h1 class="typing-text"><span>Hola {firstName}  👋</span></h1>
        </div>

          <p className="home-subtitle">
            Organiza tus notas, tareas y documentos en un solo lugar,
            sin perder el enfoque en lo importante.
          </p>

          <div className="home-actions">
            <button className="btn" onClick={() => navigate("/dashboard")}>
              Ver notas
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/tasks")}>
              Ver tareas
            </button>
          </div>
        </section>

        {/* Columna derecha: features */}
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
