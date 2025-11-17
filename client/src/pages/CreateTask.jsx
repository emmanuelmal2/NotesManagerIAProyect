// Página para crear una nueva tarea
import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import NoteForm from "../components/NoteForm";
import "../styles/noteform.css";
import "../styles/layout.css";
import "../styles/components.css";


// Normaliza la fecha para evitar un desfase de -1 día por la zona horaria
function buildDueDate(dateStr) {
  if (!dateStr) return null;
  return new Date(`${dateStr}T12:00:00`);
}

function CreateTask() {
  // Estado inicial de la tarea
  const [note, setNote] = useState({
    title: "",
    content: "",
    isTask: true,           // siempre es tarea
    priority: "medium",
    status: "todo",
    dueDate: "",
    tags: [],
    pinned: false,
    archived: false,
  });

  const [error, setError] = useState(null);           // mensaje de error
  const [isSubmitting, setIsSubmitting] = useState(false); // estado de envío
  const navigate = useNavigate();

  // Maneja el submit del formulario para crear una tarea
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Validación mínima de campos
    if (!note.title.trim() || !note.content.trim()) {
      setError("Completa título y contenido");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      // Construimos el payload final que va al backend
      const payload = {
        ...note,
        isTask: true,                       
        dueDate: buildDueDate(note.dueDate) // evita problemas de timezone
      };

      // Crear la tarea en el backend
      await axios.post("/notes", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Redirige al listado de tareas
      navigate("/tasks");

    } catch (err) {
      // Captura errores del backend o errores de red
      setError(err.response?.data?.error || err.message);

    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="card noteform-card">

        {/* Formulario reutilizable para crear una tarea */}
        <NoteForm
          heading="Crear tarea"
          note={note}
          setNote={setNote}
          error={error}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Crear tarea"
          
          // Deshabilitar el botón si está enviando o si faltan campos obligatorios
          disabled={
            isSubmitting ||
            !note.title.trim() ||
            !note.content.trim()
          }

          showTypeSelector={false}  // no deja cambiar entre nota/tarea
        />
      </div>
    </div>
  );
}

export default CreateTask;
