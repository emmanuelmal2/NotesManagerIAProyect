// Página de tareas con calendario
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import { isSameDay, parseISO } from "date-fns";
import axios from "../api/axios";
import "../styles/tasks.css";

export default function TaskPage() {
  const [tasks, setTasks] = useState([]);             // todas las tareas
  const [selectedDate, setSelectedDate] = useState(new Date()); // día seleccionado en el calendario
  const navigate = useNavigate();

  // Cargar tareas desde el backend al montar el componente
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/notes", {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: "task" }, // solo tareas (no notas)
        });
        setTasks(res.data);
      } catch (err) {
        console.error("Error cargando tareas:", err);
      }
    })();
  }, []);

  // Agrupa tareas por día (clave: toDateString) para poder marcar el calendario
  const tasksByDay = useMemo(
    () =>
      tasks.reduce((acc, t) => {
        if (!t.dueDate) return acc; // sin fecha → no la usamos para el calendario

        const day = new Date(t.dueDate).toDateString();
        acc[day] = acc[day] || [];
        acc[day].push(t);
        return acc;
      }, {}),
    [tasks]
  );

  // Tareas que corresponden exactamente al día seleccionado
  const tasksForSelectedDay = tasks.filter(t =>
    t.dueDate && isSameDay(parseISO(t.dueDate), selectedDate)
  );

  // Marcar tarea como hecha: en este caso, la eliminamos
  async function handleDone(id) {
    const ok = confirm("¿Marcar esta tarea como hecha y eliminarla?");
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Actualizamos estado local quitando la tarea
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error("Error al eliminar tarea:", err);
      alert("No se pudo eliminar la tarea.");
    }
  }

  return (
    <div className="container tasks-page">
      {/* Encabezado: título + botón para crear tarea */}
      <div className="tasks-header">
        <h2>Tareas</h2>
        <button className="btn" onClick={() => navigate("/tasks/new")}>
          Crear tarea
        </button>
      </div>

      {/* Layout de dos columnas: calendario / lista */}
      <div className="tasks-layout">
        {/* Columna izquierda: calendario */}
        <div className="tasks-calendar">
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            // Agrega la clase "has-task-day" a los días que tienen tareas
            tileClassName={({ date }) => {
              const key = date.toDateString();
              return tasksByDay[key] ? "has-task-day" : undefined;
            }}
          />
        </div>

        {/* Columna derecha: lista de tareas del día seleccionado */}
        <div className="tasks-list">
          <h3>
            {tasksForSelectedDay.length > 0
              ? `Tareas para el ${selectedDate.toLocaleDateString()}`
              : `No hay tareas para el ${selectedDate.toLocaleDateString()}`}
          </h3>

          <ul className="tasks-list-items">
            {tasksForSelectedDay.map(t => {
              // Clase según prioridad: low/medium/high
              const priorityClass = (t.priority || "medium").toLowerCase();

              return (
                <li
                  key={t._id}
                  className={`task-item task-item--${priorityClass}`}
                >
                  <div className="task-item-main">
                    <strong className="task-item-title">{t.title}</strong>

                    <p className="muted">
                      Prioridad: {t.priority} · Estado: {t.status}
                    </p>

                    {t.content && (
                      <p className="task-item-body">{t.content}</p>
                    )}
                  </div>

                  <div className="task-item-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDone(t._id)}
                    >
                      Hecha
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
