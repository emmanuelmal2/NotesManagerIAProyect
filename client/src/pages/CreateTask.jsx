// src/pages/CreateTask.jsx
import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import NoteForm from "../components/NoteForm";
import "../styles/noteform.css";
import "../styles/layout.css";
import "../styles/components.css";

function buildDueDate(dateStr) {
  if (!dateStr) return null;
  return new Date(`${dateStr}T12:00:00`);
}

function CreateTask() {
  const [note, setNote] = useState({
    title: "",
    content: "",
    isTask: true,          // 👈 tarea fija
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
        isTask: true,                     // 👈 aseguramos que es tarea
        dueDate: buildDueDate(note.dueDate),
      };

      await axios.post("/notes", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/tasks");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="card noteform-card">
        <NoteForm
          heading="Crear tarea"
          note={note}
          setNote={setNote}
          error={error}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Crear tarea"
          disabled={
            isSubmitting ||
            !note.title.trim() ||
            !note.content.trim()
          }
          showTypeSelector={false}   // 👈 solo “tarea”
        />
      </div>
    </div>
  );
}

export default CreateTask;
