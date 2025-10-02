import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import axios from "../api/axios"

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/notes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sortedNotes = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setNotes(sortedNotes);
      } catch (error) {
        console.error("Error al obtener las notas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  async function handleDelete(id) {
    const confirmDelete = window.confirm("¿Seguro que quieres borrar esta nota?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      if (error.response?.status === 404) {
        setNotes((prev) => prev.filter((n) => n._id !== id));
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/login");
      } else {
        console.error(error);
      }
    }
  }

  return (
    <div className="container dashboard" aria-busy={loading}>
      <div className="dashboard-header">
        <button className="btn" onClick={() => navigate("/new")}>Crear nota</button>
      </div>

      {loading ? (
        <p className="muted">Cargando notas…</p>
      ) : notes.length === 0 ? (
        <div className="card empty">
          <p>No hay notas aún.</p>
          <button className="btn" onClick={() => navigate("/new")}>Crear nota</button>
        </div>
      ) : (
        <section className="notes">
          {notes.map((note) => {
            const wordCount = (note.content || "").split(" ").length;

            return (
              <article className="card note" key={note._id}>
                <header className="note-header">
                  <h2 className="note-title">{note.title}</h2>
                  <p className="note-date">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </header>

                <section className="note-body">
                  <p>{note.content}</p>
                </section>

                {wordCount >= 140 && (
                  <button className="btn btn-outline" onClick={() => navigate(`/summary/${note._id}`)}>
                    Resumen
                  </button>
                )}

                <footer className="note-footer">
                  <button className="btn" onClick={() => navigate(`/edit/${note._id}`)}>
                    Editar
                  </button>
                  <button className="btn btn-outline btn-danger" onClick={() => handleDelete(note._id)}>
                    Borrar
                  </button>
                </footer>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default Dashboard;
