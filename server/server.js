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
    if (!origin || whitelist.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS: " + origin));
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// Healthcheck para probar desde el navegador
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Rutas 
app.use("/api", authRoutes);
app.use("/api", noteRoutes);

app.listen(port, () => console.log("Server started on port " + port));
