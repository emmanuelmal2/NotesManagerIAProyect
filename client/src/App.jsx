import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard  from "./pages/Dashboard";
import CreateNote from "./pages/CreateNote";
import EditNote   from "./pages/EditNote";
import Login      from "./pages/Login";
import Register   from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import TasksPage from "./pages/TaskPage";
import CreateTask from "./pages/CreateTask";
import Home from "./pages/Home";


function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new" element={<CreateNote />} />
        <Route path="/edit/:id" element={<EditNote />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/new" element={<CreateTask />} />
      </Route>

      {/* Raíz y fallback */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
