// Página principal de notas (Dashboard)
// Muestra todas las notas del usuario (solo type "note")
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);       // lista de notas
  const [loading, setLoading] = useState(true); // estado de carga inicial
  const navigate = useNavigate();

  // Carga inicial de notas al montar el componente
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");

        // Trae solo notas (no tareas) usando el query param type=note
        const res = await axios.get("/notes", {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: "note" },
        });

        // Ordenar por fecha de actualización (más recientes primero)
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

  // Eliminar una nota por ID
  async function handleDelete(id) {
    if (!confirm("¿Borrar nota?")) return;

    const token = localStorage.getItem("token");

    await axios.delete(`/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Quita la nota eliminada del estado local
    setNotes(prev => prev.filter(n => n._id !== id));
  }

  // Descarga de un PDF
  async function handleDownloadPdf(note) {
    try {
      if (!note.file?.url) return;

      const res = await fetch(note.file.url);
      const arrayBuffer = await res.arrayBuffer();

      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      // Nombre de archivo legible
      const filename =
        note.file.name && note.file.name.endsWith(".pdf")
          ? note.file.name
          : `${note.file.name || note.title || "documento"}.pdf`;

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
      {/* Barra de acciones del dashboard */}
      <div className="dashboard-header">
        <button className="btn" onClick={() => navigate("/new")}>
          Crear nota
        </button>
      </div>

      {/* Estados de la UI: cargando / vacío / con notas */}
      {loading ? (
        <p className="muted">Cargando…</p>
      ) : notes.length === 0 ? (
        <div className="card empty">
          <p>No hay notas aún.</p>
        </div>
      ) : (
        <section className="notes-grid">
          {notes.map(note => {
            const isPdf = !!note.file?.isPdf; // bandera para saber si es PDF

            return (
              <article
                key={note._id}
                // Solo las notas normales se marcan como "clickables"
                className={`card note ${!isPdf ? "note-clickable" : ""}`}
                // Click en la tarjeta → solo navega a editar si NO es PDF
                onClick={() => {
                  if (!isPdf) {
                    navigate(`/edit/${note._id}`);
                  }
                }}
              >
                {/* Botón de borrar flotante (no debe disparar el onClick del article) */}
                <button
                  className="note-delete"
                  onClick={e => {
                    e.stopPropagation(); // evita navegar al hacer click en borrar
                    handleDelete(note._id);
                  }}
                  aria-label="Eliminar nota"
                >
                  ×
                </button>

                {/* Encabezado de la tarjeta */}
                <header className="note-header">
                  <div className="note-header-main">
                    <h2 className="note-title">
                      {note.title}
                      {/* Badge visual si la nota tiene un PDF asociado */}
                      {isPdf && (
                        <span className="badge badge--pdf">PDF</span>
                      )}
                    </h2>

                    {/* Fecha de creación en formato local */}
                    <p className="note-date">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </header>

                {/* Cuerpo de la nota */}
                <section className="note-body">
                  {isPdf ? (
                    // Para PDFs, solo mostramos un texto genérico
                    <p className="muted">Documento PDF</p>
                  ) : (
                    // Para notas normales, preview del contenido
                    <p className="ellipsis-4">{note.content}</p>
                  )}
                </section>

                {/* Acciones especiales para notas con PDF */}
                {isPdf && (
                  <footer className="note-footer">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={e => {
                        e.stopPropagation();        // solo abre visor, no edita
                        navigate(`/pdf/${note._id}`);
                      }}
                    >
                      Ver
                    </button>

                    <button
                      className="btn btn-outline btn-sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleDownloadPdf(note);
                      }}
                    >
                      Descargar
                    </button>
                  </footer>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
