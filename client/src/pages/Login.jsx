import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";
import "../styles/components.css";
import "../styles/layout.css";

// Pantalla de inicio de sesión
function Login() {
  // Estado controlado del formulario
  const [form, setForm] = useState({ email: "", password: "" });

  // Mensaje de error a mostrar bajo el título
  const [error, setError] = useState(null);

  // Indica si se está enviando el formulario 
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Maneja cambios en los inputs email/password
  function handleChange(e) {
    const { name, value } = e.target;
    // Actualiza solo la propiedad cambiada, preservando el resto
    setForm(prev => ({ ...prev, [name]: value }));
  }

  // Maneja el submit del formulario de login
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Enviar credenciales al backend
      const { data } = await axios.post("/login", form);

      // Validación básica de la respuesta
      if (!data?.token) {
        throw new Error("Respuesta inválida del servidor");
      }

      // Guardar token en localStorage para futuras peticiones
      localStorage.setItem("token", data.token);

      // Redirigir a la pantalla principal
      navigate("/home");
    } catch (err) {
      // Intentar mostrar primero el mensaje del backend, si existe
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
        <h2 className="auth-title">Iniciar sesión</h2>

        {/* Mensaje de error, si existe */}
        {error && <p className="alert">{error}</p>}

        {/* Formulario de login */}
        <form className="form stack" onSubmit={handleSubmit} noValidate>
          {/* Campo: Email */}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
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
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              required
              minLength={6}
            />
          </div>

          {/* Acciones: botón de login + enlace a registro */}
          <div className="auth-actions">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>

            <span className="muted">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="link">
                Regístrate
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
