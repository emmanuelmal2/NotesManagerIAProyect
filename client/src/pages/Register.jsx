import React, { useState } from "react"
import axios from "../api/axios"
import { useNavigate, Link } from "react-router-dom"
import "../styles/auth.css"
import "../styles/components.css"
import "../styles/layout.css"

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await axios.post("/register", form)
      navigate("/login")
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card card">
        <h2 className="auth-title">Crear cuenta</h2>

        {error && <p className="alert">{error}</p>}

        <form className="form stack" onSubmit={handleSubmit} noValidate>
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

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className="auth-actions">
          <span className="muted">¿Ya tienes cuenta?</span>
          <Link to="/login" className="link">Inicia sesión</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
