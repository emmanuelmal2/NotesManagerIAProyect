// src/pages/CreateNote.jsx
import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import NoteForm from "../components/NoteForm";
import PdfUploader from "../components/PdfUploader";
import "../styles/noteform.css";
import "../styles/layout.css";
import "../styles/components.css";

// evitar que la fecha se guarde un día antes
function buildDueDate(dateStr) {
  if (!dateStr) return null;
  return new Date(`${dateStr}T12:00:00`);
}

function CreateNote() {
  const [note, setNote] = useState({
    title: "",
    content: "",
    isTask: false,        // 👈 nota fija
    priority: "medium",
    status: "todo",
    dueDate: "",
    tags: [],
    pinned: false,
    archived: false,
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function handlePdfUploaded(newItem) {
    console.log("PDF subido:", newItem);
    navigate("/dashboard");
  }

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
      if (!token) return navigate("/login");

      const payload = {
        ...note,
        isTask: false,                    // 👈 aseguramos que es nota
        dueDate: buildDueDate(note.dueDate),
      };

      await axios.post("/notes", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="card noteform-card">
        <h2 style={{ marginBottom: "1rem" }}>Subir documento PDF</h2>
        <PdfUploader onUploaded={handlePdfUploaded} />

        <hr style={{ margin: "2rem 0", borderColor: "#333" }} />

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
          showTypeSelector={false}   // 👈 solo “nota”
        />
      </div>
    </div>
  );
}

export default CreateNote;
