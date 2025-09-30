import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NoteForm from "../components/NoteForm";
import "../styles/noteform.css"
import "../styles/layout.css"
import "../styles/components.css"

axios.defaults.baseURL = import.meta.env.VITE_API_URL + "/api"
function CreateNote() {
  const [note, setNote] = useState({ title: "", content: "" });
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
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post("/notes", note, {
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
        <NoteForm
          note={note}
          setNote={setNote}
          error={error}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Crear nota"
          disabled={isSubmitting || !note.title.trim() || !note.content.trim()}
        />
      </div>
    </div>
  );

}
 
export default CreateNote;
