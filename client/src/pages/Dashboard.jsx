// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/notes", {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: "note" }, // solo notas
        });

        const sorted = res.data.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setNotes(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleDelete(id) {
    if (!confirm("¿Borrar nota?")) return;
    const token = localStorage.getItem("token");
    await axios.delete(`/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotes((prev) => prev.filter((n) => n._id !== id));
  }

  // ---- PREVIEW PDF EN NUEVA PESTAÑA ----
  async function handlePreviewPdf(note) {
    try {
      if (!note.file?.url) return;

      const res = await fetch(note.file.url);
      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      window.open(blobUrl, "_blank"); // abre visor PDF del navegador
    } catch (err) {
      console.error("Error al previsualizar PDF:", err);
      alert("No se pudo abrir el PDF.");
    }
  }

  // ---- DESCARGAR PDF CON NOMBRE BONITO ----
  async function handleDownloadPdf(note) {
    try {
      if (!note.file?.url) return;

      const res = await fetch(note.file.url);
      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      // nombre sugerido para el archivo
      const filename =
        (note.file.name && note.file.name.endsWith(".pdf")
          ? note.file.name
          : `${note.file.name || note.title || "documento"}.pdf`);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error al descargar PDF:", err);
      alert("No se pudo descargar el PDF.");
    }
  }


  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <button className="btn" onClick={() => navigate("/new")}>
          Crear nota
        </button>
      </div>

      {loading ? (
        <p className="muted">Cargando…</p>
      ) : notes.length === 0 ? (
        <div className="card empty">
          <p>No hay notas aún.</p>
        </div>
      ) : (
        <section className="notes-grid">
          {notes.map((note) => (
            <article
              key={note._id}
              className="card note note-clickable"
              onClick={() => navigate(`/edit/${note._id}`)}
            >
              {/* Botón de borrar flotante */}
              <button
                className="note-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(note._id);
                }}
                aria-label="Eliminar nota"
              >
                ×
              </button>

              <header className="note-header">
                <div className="note-header-main">
                  <h2 className="note-title">
                    {note.title}
                    {note.file?.isPdf && (
                      <span className="badge badge--pdf">PDF</span>
                    )}
                  </h2>
                  <p className="note-date">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </header>

              <section className="note-body">
                {note.file?.isPdf ? (
                  <p className="muted">Documento PDF</p>
                ) : (
                  <p className="ellipsis-4">{note.content}</p>
                )}
              </section>

          {note.file?.isPdf && (
            <footer className="note-footer">
              <button
                className="btn btn-outline btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewPdf(note);
                }}
              >
                Ver
              </button>

              <button
                className="btn btn-outline btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadPdf(note);
                }}
              >
                Descargar
              </button>
            </footer>
          )}


            </article>
          ))}
        </section>
      )}
    </div>
  );
}
