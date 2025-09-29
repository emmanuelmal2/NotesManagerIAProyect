import { Link } from "react-router-dom";
import "../styles/noteform.css";
import "../styles/components.css";
import "../styles/layout.css";

function NoteForm({
  note,
  setNote,
  error,
  onSubmit,
  isSubmitting,
  submitLabel = "Guardar",
  disabled = false,
  heading = "Nota",
  showCancel = true,
  cancelTo = "/dashboard",
}) {
  function handleChange(event) {
    const { name, value } = event.target;
    setNote(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div className="noteform-wrap">
      <h2 className="noteform-title">{heading}</h2>

      {error && <p className="alert">{error}</p>}

      <form className="form stack" onSubmit={onSubmit} aria-busy={isSubmitting} noValidate>
        <div className="field">
          <label htmlFor="title">Título</label>
          <input
            className="input"
            type="text"
            id="title"
            name="title"
            value={note.title}
            onChange={handleChange}
            placeholder="Dale un título a tu nota"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="field">
          <label htmlFor="content">Contenido</label>
          <textarea
            className="textarea"
            id="content"
            name="content"
            value={note.content}
            onChange={handleChange}
            placeholder="Escribe aquí…"
            required
            disabled={isSubmitting}
            rows={8}
          />
        </div>

        <div className="noteform-actions">
          {showCancel && (
            <Link to={cancelTo} className="btn btn-outline">
              Cancelar
            </Link>
          )}
          <button type="submit" className="btn" disabled={disabled || isSubmitting}>
            {isSubmitting ? "Guardando…" : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NoteForm;
