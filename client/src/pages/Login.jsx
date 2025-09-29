import React, { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import "../styles/auth.css"
import "../styles/components.css"
import "../styles/layout.css"

function Login() {
  const [form, setForm] = useState({ email: "", password: "" })
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
      const { data } = await axios.post("/login", form)
      localStorage.setItem("token", data.token)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card card">
        <h2 className="auth-title">Iniciar sesión</h2>

        {error && <p className="alert">{error}</p>}

        <form className="form stack" onSubmit={handleSubmit} noValidate>
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

          <div className="auth-actions">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
            <span className="muted">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="link">Regístrate</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
