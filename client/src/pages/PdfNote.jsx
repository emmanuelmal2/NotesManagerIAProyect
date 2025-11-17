// src/pages/PdfNote.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/pdf.css";

function PdfNote() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");   // <- blob URL para el visor
  const [error, setError] = useState("");

  // 1) Cargar la nota
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNote(data);
      } catch (e) {
        setError(e.response?.data?.error || e.message);
      }
    })();
  }, [id]);

  // 2) Cuando haya nota y haya file.url, traer el PDF y crear blob URL
  useEffect(() => {
    let objectUrl;

    async function loadPdf() {
      if (!note?.file?.url) return;

      try {
        const res = await fetch(note.file.url);
        const buf = await res.arrayBuffer();
        const blob = new Blob([buf], { type: "application/pdf" });
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (e) {
        console.error("Error cargando PDF:", e);
        setError("No se pudo cargar el PDF");
      }
    }

    loadPdf();

    // limpiar el blob cuando salgamos de la página o cambie la nota
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [note]);

  // 3) Descargar bonito (con nombre .pdf correcto)
  async function handleDownload() {
    if (!note?.file?.url) return;
    try {
      const res = await fetch(note.file.url);
      const buf = await res.arrayBuffer();
      const blob = new Blob([buf], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const filename =
        (note.file.name && note.file.name.endsWith(".pdf"))
          ? note.file.name
          : `${note.file.name || note.title || "documento"}.pdf`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error al descargar PDF:", e);
      alert("No se pudo descargar el PDF.");
    }
  }

  // 4) Estados de carga / error
  if (error) {
    return (
      <div className="container pdf-page">
        <p className="alert error">Error: {error}</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="container pdf-page">
        <p className="muted">Cargando nota…</p>
      </div>
    );
  }

  return (
    <div className="pdf-page">
      <header className="pdf-header">
        <button className="btn" onClick={() => navigate("/dashboard")}>
          ← Regresar
        </button>

        <div className="pdf-title-area">
          <span className="pdf-title">{note.title}</span>
          {note.file?.isPdf && <span className="badge badge--pdf">PDF</span>}
        </div>

        {note.file?.url && (
          <button className="btn btn-outline" onClick={handleDownload}>
            Descargar
          </button>
        )}
      </header>

      <div className="pdf-frame-wrapper">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={note.title}
            className="pdf-frame"
          />
        ) : (
          <p className="muted">Cargando PDF…</p>
        )}
      </div>
    </div>
  );
}

export default PdfNote;
