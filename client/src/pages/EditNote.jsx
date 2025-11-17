// Página para editar una nota o tarea existente
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import NoteForm from "../components/NoteForm";
import "../styles/noteform.css";
import "../styles/layout.css";
import "../styles/components.css";

function EditNote() {
  // ID de la nota/tarea tomado de la URL (/edit/:id)
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado de la nota a editar
  const [note, setNote] = useState({
    title: "",
    content: "",
    isTask: false,
    priority: "medium",
    status: "todo",
    dueDate: "",
    remindAt: "",
    tags: [],
    pinned: false,
    archived: false,
    file: undefined, // info del archivo asociado (si existe)
  });

  const [error, setError] = useState(null);        // mensaje de error
  const [loadingFetch, setLoadingFetch] = useState(true); // cargado de datos iniciales
  const [isSubmitting, setIsSubmitting] = useState(false); // guardando cambios

  // Carga la nota desde el backend al montar el componente o cuando cambia el id
  useEffect(() => {
    async function fetchNote() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(`/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });


        // Se normalizan los valores para evitar undefined
        setNote({
          title: res.data.title || "",
          content: res.data.content || "",
          isTask: !!res.data.isTask,
          priority: res.data.priority || "medium",
          status: res.data.status || "todo",
          dueDate: res.data.dueDate || "",
          remindAt: res.data.remindAt || "",
          tags: res.data.tags || [],
          pinned: !!res.data.pinned,
          archived: !!res.data.archived,
          file: res.data.file,
        });

        setError(null);
      } catch (err) {
        console.error("[EditNote] error al cargar:", err);
        const status = err.response?.status;

        // Manejo de errores según status HTTP
        if (status === 404) {
          // Nota no encontrada → regresa al dashboard
          navigate("/dashboard");
          return;
        }
        if (status === 401 || status === 403) {
          // No autorizado → al login
          navigate("/login");
          return;
        }

        setError(err.response?.data?.error || err.message);
      } finally {
        setLoadingFetch(false);
      }
    }

    fetchNote();
  }, [id, navigate]);

  // Maneja el envío del formulario para guardar cambios
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Validación simple
    if (!note.title.trim() || !note.content.trim()) {
      setError("Completa título y contenido");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Solo se envían los campos editables
      const payload = {
        title: note.title,
        content: note.content,
        priority: note.priority,
        status: note.status,
        dueDate: note.dueDate,
        remindAt: note.remindAt,
        tags: note.tags,
        pinned: note.pinned,
        archived: note.archived,
      };

      await axios.patch(`/notes/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Después de guardar, regresa al dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("[EditNote] error al guardar:", err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Estado de carga mientras se obtiene la nota del backend
  if (loadingFetch) {
    return (
      <div className="container">
        <div className="card noteform-card" aria-busy="true">
          <p className="muted">Cargando nota…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Título de la página, indica si es nota o tarea */}
      <h1 style={{ color: "#fff", marginBottom: "1rem" }}>
        Editar {note.isTask ? "tarea" : "nota"}
      </h1>

      <div className="card noteform-card">
        <NoteForm
          heading={note.isTask ? "Editar tarea" : "Editar nota"}
          note={note}
          setNote={setNote}
          error={error}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Guardar cambios"
          disabled={
            isSubmitting ||
            !note.title?.trim() ||
            !note.content?.trim()
          }
          showCancel
          cancelTo="/dashboard"
          showTypeSelector={false} 
        />
      </div>
    </div>
  );
}

export default EditNote;
