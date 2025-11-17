import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";
import "../styles/components.css";
import "../styles/layout.css";
import "../styles/tasks.css"; 

// Pantalla de registro de usuario
function Register() {
  // Estado controlado del formulario de registro
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // Mensaje de error a mostrar en caso de fallo
  const [error, setError] = useState(null);

  // Indica si se está procesando el envío
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Maneja cambios en los inputs (name, email, password)
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  // Maneja el envío del formulario de registro
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Envía los datos al endpoint de registro
      await axios.post("/register", form);

      // Si todo sale bien, redirige al login
      navigate("/login");
    } catch (err) {
      // Intenta mostrar el mensaje del backend, si no, uno genérico
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card card">
        <h2 className="auth-title">Crear cuenta</h2>

        {/* Mensaje de error si hay problema al registrarse */}
        {error && <p className="alert">{error}</p>}

        {/* Formulario de registro */}
        <form className="form stack" onSubmit={handleSubmit} noValidate>
          {/* Campo: Nombre */}
          <div className="field">
            <label htmlFor="name">Nombre</label>
            <input
              className="input"
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
            />
          </div>

          {/* Campo: Email */}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          {/* Campo: Contraseña */}
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              className="input"
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              minLength={6}
              required
            />
          </div>

          {/* Botón principal de registro */}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        {/* Enlace para ir a login si ya tiene cuenta */}
        <div className="auth-actions">
          <span className="muted">¿Ya tienes cuenta?</span>
          <Link to="/login" className="link">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
