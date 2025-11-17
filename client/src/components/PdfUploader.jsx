// Componente para subir un archivo PDF al servidor
import { useState } from "react";
import axios from "../api/axios";

export default function PdfUploader({ onUploaded }) {
  // Archivo PDF seleccionado
  const [file, setFile] = useState(null);

  // Indica si se está realizando la carga
  const [busy, setBusy] = useState(false);

  // Mensaje de error si falla la subida
  const [err, setErr] = useState("");

  // Maneja el proceso de subir el archivo al backend
  async function upload() {
    try {
      setErr("");            // Limpia errores previos
      if (!file) return;     // No hay archivo → nada que subir

      setBusy(true);         // Activa estado de "cargando"

      // Crea el FormData que se enviará al servidor
      const fd = new FormData();
      fd.append("file", file); // el backend espera el campo "file"

      // Obtiene token de autenticación
      const token = localStorage.getItem("token");

      // Realiza la petición POST al endpoint /notes/pdf
      const { data } = await axios.post("/notes/pdf", fd, {
        headers: {
          Authorization: `Bearer ${token}`,        // autenticación
          "Content-Type": "multipart/form-data",   // necesario para subir archivos
        },
      });

      // Limpia el archivo del input
      setFile(null);

      // Notifica al componente padre que la subida fue exitosa
      onUploaded?.(data); // `data` suele contener la URL o información del PDF procesado

    } catch (e) {
      // Captura mensajes del backend o errores genéricos
      setErr(e.response?.data?.error || e.message);
    } finally {
      // Termina el estado de carga sin importar si hubo error
      setBusy(false);
    }
  }

  return (
    // Contenedor simple con flex para alinear el input y el botón
    <div style={{ display:"flex", gap: 8, alignItems:"center" }}>

      {/* Input para seleccionar PDF */}
      <input
        type="file"
        accept="application/pdf"   // restringe a PDFs
        onChange={e => setFile(e.target.files?.[0] || null)}
      />

      {/* Botón de carga */}
      <button
        className="btn"
        onClick={upload}
        disabled={!file || busy}  // deshabilitado si no hay archivo o está cargando
      >
        {busy ? "Subiendo…" : "Subir PDF"}
      </button>

      {/* Mostrar error si ocurre alguno */}
      {err && <span className="alert">{err}</span>}
    </div>
  );
}
