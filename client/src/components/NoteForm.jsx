import { Link } from "react-router-dom";
import "../styles/noteform.css";
import "../styles/components.css";
import "../styles/layout.css";

// Componente de formulario reutilizable para crear/editar notas y tareas
function NoteForm({
  note,             // Objeto con los datos de la nota/tarea (title, content, isTask, etc.)
  setNote,          
  error,            // Mensaje de error a mostrar (string) si algo falla
  onSubmit,         // Función que se ejecuta al enviar el formulario
  isSubmitting,     
  submitLabel = "Guardar",   // Texto del botón principal
  disabled = false,          // Permite deshabilitar manualmente el botón de submit
  showCancel = true,         // Muestra u oculta el botón de "Cancelar"
  cancelTo = "/dashboard",   // Ruta a la que se navega al cancelar
  showTypeSelector = true,   // Muestra u oculta el select para elegir Nota/Tarea
}) {

  // Maneja cambios en inputs de texto, selects y checkboxes de forma genérica
  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    // Si en el futuro hay checkboxes (p.ej. pinned/archived), se usa checked
    const nextValue = type === "checkbox" ? checked : value;

    // Actualiza la nota conservando el resto de propiedades
    setNote(prev => ({
      ...prev,
      [name]: nextValue,
    }));
  }

  // Maneja el select "Tipo": convierte "nota"/"tarea" al booleano isTask
  function handleTaskSelect(e) {
    const value = e.target.value;         // "nota" | "tarea"
    const isTask = value === "tarea";

    setNote(prev => ({ ...prev, isTask }));
  }

  // Agrega un tag cuando el usuario presiona Enter en el input de tags
  function handleTagKeyDown(e) {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();
      const newTag = e.target.value.trim();

      setNote(prev => ({
        ...prev,
        // Evita duplicados: si ya existe el tag, deja la lista igual
        tags: prev.tags.includes(newTag)
          ? prev.tags
          : [...prev.tags, newTag],
      }));

      // Limpia el input después de agregar el tag
      e.target.value = "";
    }
  }

  // Elimina un tag según su índice en el arreglo
  function removeTag(index) {
    setNote(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  }

  return (
    // Cambia la clase según sea nota o tarea para aplicar estilos distintos
    <div className={`noteform-wrap ${note.isTask ? "is-task" : "is-note"}`}>

      {/* Título dinámico del formulario: "Tarea" o "Nota" */}
      <h2 className="noteform-title">
        {note.isTask ? "Tarea" : "Nota"}
      </h2>

      {/* Mensaje de error general del formulario */}
      {error && <p className="alert">{error}</p>}

      {/* Formulario principal */}
      <form
        className="form stack"
        onSubmit={onSubmit}
        aria-busy={isSubmitting}  // Accesibilidad: indica que está procesando
        noValidate                // Evita validación HTML por defecto 
      >
        {/* Campo: Título de la nota/tarea */}
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

        {/* Campo: Contenido */}
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

        {/* Selector de tipo: Nota / Tarea (si está habilitado por props) */}
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

        {/* Configuración adicional sólo cuando la nota es una tarea */}
        {note.isTask && (
          <fieldset>
            <legend>Configuración de tarea</legend>

            {/* Campo: Prioridad */}
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

            {/* Campo: Estado */}
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

            {/* Campo: Fecha límite */}
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

        {/* Gestión de tags (lista + input para agregar) */}
        <div className="field field--full">
          <label htmlFor="tags">Tags</label>
          <div className="tags-container">
            {(note.tags ?? []).map((tag, i) => (
              <span key={tag} className="tag">
                {tag}
                {/* Botón para eliminar tag individual */}
                <button
                  type="button"
                  onClick={() => removeTag(i)}
                  aria-label={`Eliminar ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}

            {/* Input para escribir un nuevo tag (se agrega con Enter) */}
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

        {/* Botones de acción: Cancelar y Guardar */}
        <div className="noteform-actions">
          {showCancel && (
            <Link to={cancelTo} className="btn btn-outline">
              Cancelar
            </Link>
          )}

          <button
            type="submit"
            className="btn"
            disabled={disabled || isSubmitting}
          >
            {isSubmitting ? "Guardando…" : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NoteForm;
