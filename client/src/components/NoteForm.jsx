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
  showCancel = true,
  cancelTo = "/dashboard",
  showTypeSelector = true,
}) {
  //  Maneja inputs de texto/select de forma genérica
  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    // Soporte para checkbox si luego agregas pinned/archived
    const nextValue = type === "checkbox" ? checked : value;

    setNote(prev => ({
      ...prev,
      [name]: nextValue,
    }));
  }

  // Select “tipo”: mapea "nota"/"tarea" → boolean isTask
  function handleTaskSelect(e) {
    const value = e.target.value;         // "nota" | "tarea"
    const isTask = value === "tarea";
    setNote(prev => ({ ...prev, isTask }));
  }

  // Agregar tag al presionar Enter
  function handleTagKeyDown(e) {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();
      const newTag = e.target.value.trim();

      setNote(prev => ({
        ...prev,
        tags: prev.tags.includes(newTag)
          ? prev.tags                // evita duplicados
          : [...prev.tags, newTag],
      }));

      e.target.value = "";
    }
  }

  // Eliminar tag por índice
  function removeTag(index) {
    setNote(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className={`noteform-wrap ${note.isTask ? "is-task" : "is-note"}`}>

    <h2 className="noteform-title">
      {note.isTask ? "Tarea" : "Nota"}
    </h2>




      {error && <p className="alert">{error}</p>}

      <form className="form stack" onSubmit={onSubmit} aria-busy={isSubmitting} noValidate>
        {/* Título */}
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

        {/* Contenido */}
        <div className="field field--full">
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

        {/* Tipo: nota/tarea (opcional) */}
        {showTypeSelector && (
          <div className="field">
            <label htmlFor="tipo">Tipo</label>
            <select
              className="input"
              id="tipo"
              name="tipo"
              value={note.isTask ? "tarea" : "nota"}
              onChange={handleTaskSelect}
              disabled={isSubmitting}
            >
              <option value="nota">Nota</option>
              <option value="tarea">Tarea</option>
            </select>
          </div>
        )}

        {/* Campos de tarea (solo si isTask) */}
        {note.isTask && (
          <fieldset>
            <legend>Configuración de tarea</legend>

            <div className="field">
              <label htmlFor="priority">Prioridad</label>
              <select
                className="input"
                id="priority"
                name="priority"
                value={note.priority}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="status">Estado</label>
              <select
                className="input"
                id="status"
                name="status"
                value={note.status}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="todo">Pendiente</option>
                <option value="doing">En progreso</option>
                <option value="done">Completada</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="dueDate">Fecha límite</label>
              <input
                className="input"
                id="dueDate"
                name="dueDate"
                type="date"
                value={note.dueDate ? note.dueDate : ""}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </fieldset>
        )}

        {/* Tags */}
        <div className="field field--full">
          <label htmlFor="tags">Tags</label>
          <div className="tags-container">
            {(note.tags ?? []).map((tag, i) => (
              <span key={tag} className="tag">
                {tag}
                <button type="button" onClick={() => removeTag(i)} aria-label={`Eliminar ${tag}`}>
                  ×
                </button>
              </span>
            ))}
            <input
              className="input"
              id="tags"
              type="text"
              placeholder="Presiona Enter para agregar"
              onKeyDown={handleTagKeyDown}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Acciones */}
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
