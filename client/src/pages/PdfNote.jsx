// Página para ver una nota con PDF en un visor embebido (iframe)
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/pdf.css";

function PdfNote() {
  // ID de la nota que viene de la ruta (/pdf/:id)
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);     // datos de la nota
  const [pdfUrl, setPdfUrl] = useState("");   // URL del blob para el iframe
  const [error, setError] = useState("");     // mensaje de error, si ocurre algo

  // Cargar la nota desde el backend
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

  //Cuando haya nota y note.file.url, descargar el PDF y crear un blob URL
  useEffect(() => {
    let objectUrl; // referencia para poder limpiar la URL luego

    async function loadPdf() {
      // Si la nota no tiene archivo o no es PDF, no hacemos nada
      if (!note?.file?.url) return;

      try {
        // Descarga el archivo original desde la URL guardada
        const res = await fetch(note.file.url);
        const buf = await res.arrayBuffer();

        // Crea un Blob de tipo PDF en memoria
        const blob = new Blob([buf], { type: "application/pdf" });

        // Genera una URL temporal que el iframe puede usar
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (e) {
        console.error("Error cargando PDF:", e);
        setError("No se pudo cargar el PDF");
      }
    }

    loadPdf();

    // Limpia el blob URL cuando el componente se desmonta
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [note]);

  // Descargar el PDF con un nombre amigable (asegurando extensión .pdf)
  async function handleDownload() {
    if (!note?.file?.url) return;

    try {
      const res = await fetch(note.file.url);
      const buf = await res.arrayBuffer();
      const blob = new Blob([buf], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Determina el nombre del archivo:
      // - Usa note.file.name si termina en .pdf
      // - Si no, agrega .pdf al nombre disponible (file.name, title o "documento")
      const filename =
        (note.file.name && note.file.name.endsWith(".pdf"))
          ? note.file.name
          : `${note.file.name || note.title || "documento"}.pdf`;

      // Crea un enlace temporal para disparar la descarga
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Libera la URL temporal
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error al descargar PDF:", e);
      alert("No se pudo descargar el PDF.");
    }
  }

  // Estados de carga / error
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
      {/* Barra superior: volver, título y acción de descarga */}
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

      {/* Área del visor PDF */}
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
