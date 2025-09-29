import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NoteForm from "../components/NoteForm";
import "../styles/noteform.css";
import "../styles/layout.css";
import "../styles/components.css";

axios.defaults.baseURL = "http://localhost:5000/api";

function EditNote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState({ title: "", content: "" });
  const [error, setError] = useState(null);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchNote() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const res = await axios.get(`/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNote({ title: res.data.title, content: res.data.content });
        setError(null);
      } catch (err) {
        if (err.response?.status === 404) return navigate("/dashboard");
        if (err.response?.status === 401 || err.response?.status === 403) return navigate("/login");
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
      if (!token) return navigate("/login");

      await axios.put(
        `/notes/${id}`,
        { title: note.title, content: note.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/dashboard");
    } catch (err) {
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
      <div className="card noteform-card">
        <NoteForm
          heading="Editar nota"
          note={note}
          setNote={setNote}
          error={error}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Guardar cambios"
          disabled={isSubmitting || !note.title.trim() || !note.content.trim()}
          showCancel
          cancelTo="/dashboard"
        />
      </div>
    </div>
  );
}

export default EditNote;
