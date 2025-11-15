// src/pages/EditNote.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import NoteForm from "../components/NoteForm";
import "../styles/noteform.css";
import "../styles/layout.css";
import "../styles/components.css";

function EditNote() {
  const { id } = useParams();
  const navigate = useNavigate();

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
    file: undefined,
  });

  const [error, setError] = useState(null);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchNote() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        console.log("[EditNote] GET /notes/" + id);
        const res = await axios.get(`/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("[EditNote] nota cargada:", res.data);
        setNote({
          // me aseguro de tener valores por defecto
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
        if (status === 404) {
          navigate("/dashboard");
          return;
        }
        if (status === 401 || status === 403) {
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

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

      console.log("[EditNote] PATCH /notes/" + id, payload);

      await axios.patch(`/notes/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("[EditNote] error al guardar:", err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

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
      {/* Este título es solo para verificar que estás en EditNote */}
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
