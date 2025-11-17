// Página para crear una nueva nota
import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import NoteForm from "../components/NoteForm";
import PdfUploader from "../components/PdfUploader";
import "../styles/noteform.css";
import "../styles/layout.css";
import "../styles/components.css";


// Ajusta la fecha límite para evitar que se guarde un día antes por zona horaria
function buildDueDate(dateStr) {
  if (!dateStr) return null;
  return new Date(`${dateStr}T12:00:00`); // fija hora media para evitar desfase
}

function CreateNote() {
  // Estado inicial de la nota (siempre es nota, nunca tarea)
  const [note, setNote] = useState({
    title: "",
    content: "",
    isTask: false,        // Es Nota
    priority: "medium",
    status: "todo",
    dueDate: "",
    tags: [],
    pinned: false,
    archived: false,
  });

  const [error, setError] = useState(null);         // mensaje de error
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const navigate = useNavigate();

  // Cuando el usuario sube un PDF
  function handlePdfUploaded(newItem) {
    console.log("PDF subido:", newItem);
    navigate("/dashboard"); 
  }

  // Maneja el envío del formulario de creación
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
      if (!token) return navigate("/login");

      // Construimos el payload final que se enviará al backend
      const payload = {
        ...note,
        isTask: false,                        
        dueDate: buildDueDate(note.dueDate),  // normaliza la fecha
      };

      // Enviar la nota al backend
      await axios.post("/notes", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Volver al dashboard si salió bien
      navigate("/dashboard");

    } catch (err) {
      // Mostrar error del backend o uno genérico
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="card noteform-card">

        {/* Sección para subir PDF opcional */}
        <h2 style={{ marginBottom: "1rem" }}>Subir documento PDF</h2>
        <PdfUploader onUploaded={handlePdfUploaded} />

        {/* Separador visual */}
        <hr style={{ margin: "2rem 0", borderColor: "#333" }} />

        {/* Formulario principal para crear la nota */}
        <NoteForm
          heading="Crear nota"
          note={note}
          setNote={setNote}
          error={error}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Crear nota"
          disabled={
            isSubmitting ||
            !note.title.trim() ||
            !note.content.trim()
          }
          showTypeSelector={false}   
        />
      </div>
    </div>
  );
}

export default CreateNote;
