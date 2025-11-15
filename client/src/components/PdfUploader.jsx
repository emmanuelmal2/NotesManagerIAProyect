// src/components/PdfUploader.jsx
import { useState } from "react";
import axios from "../api/axios";

export default function PdfUploader({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function upload() {
    try {
      setErr("");
      if (!file) return;
      setBusy(true);

      const fd = new FormData();
      fd.append("file", file);

      const token = localStorage.getItem("token");
      const { data } = await axios.post("/notes/pdf", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setFile(null);
      onUploaded?.(data);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display:"flex", gap: 8, alignItems:"center" }}>
      <input
        type="file"
        accept="application/pdf"
        onChange={e => setFile(e.target.files?.[0] || null)}
      />
      <button className="btn" onClick={upload} disabled={!file || busy}>
        {busy ? "Subiendo…" : "Subir PDF"}
      </button>
      {err && <span className="alert">{err}</span>}
    </div>
  );
}
