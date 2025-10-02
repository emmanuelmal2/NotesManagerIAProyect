import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import noteRoutes from "./routes/notes.js";

dotenv.config();

const mongo_url = process.env.MONGO_URL;
const port = process.env.PORT || 5000;

// Conexión Mongo con logs de error
try {
  await mongoose.connect(mongo_url);
  console.log("Mongo conectado");
} catch (e) {
  console.error("Error conectando a Mongo:", e.message);
}

const app = express();
app.use(express.json());


// Lista blanca de orígenes (prod + dev)
const whitelist = [
  "http://localhost:5173",
  "https://notes-manager-ia-proyect.vercel.app" 
].filter(Boolean);

// CORS seguro con whitelist (acepta requests sin origin como Postman)
app.use(cors({
  origin(origin, cb) {
    try {
      if (!origin) return cb(null, true);
      const host = new URL(origin).hostname;
      const ok = whitelist.includes(origin) || host.endsWith(".vercel.app");
      return ok ? cb(null, true) : cb(new Error("CORS: " + origin));
    } catch { return cb(new Error("CORS parse error")); }
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  // credentials: true, // solo si usas cookies
  optionsSuccessStatus: 204
}));
app.options("*", cors());

// Log global: ver TODAS las requests que llegan
app.use((req, _res, next) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});

// Healthcheck para probar desde el navegador
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Rutas 
app.use("/api", authRoutes);
app.use("/api", noteRoutes);

// 404 explícito al final (si no coincide ninguna ruta)
app.use((req, res) => {
  console.warn("404 ->", req.method, req.path);
  res.status(404).json({ error: "Not found" });
});

app.listen(port, () => console.log("Server started on port " + port));
