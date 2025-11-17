import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";

dotenv.config();

const router = express.Router();
const saltRounds = 10;

// Validador simple de email
const isEmail = (s) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").toLowerCase());

// Ruta para registrar a un usuario 
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body || {};
    name = String(name || "").trim();
    email = String(email || "").trim().toLowerCase();
    password = String(password || "");

    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Faltan campos" });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ message: "Email inválido" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Evitar duplicados
    const existingUser = await User.findOne({ email }).lean().exec();
    if (existingUser) {
      return res.status(400).json({ message: "Usuario ya registrado" });
    }

    // Hash y creación
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    // Error de índice único
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Usuario ya registrado" });
    }
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para iniciar sesion
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body || {};
    email = String(email || "").trim().toLowerCase();
    password = String(password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Faltan campos" });
    }

    // Buscar al usuario
    const user = await User
      .findOne({ email })
      .select("_id email password")
      .exec();

    const invalidMsg = "Credenciales inválidas";
    if (!user) return res.status(401).json({ message: invalidMsg });

    // Comparación de contraseña
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: invalidMsg });

    // Crear token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para obtener el perfil del usuario 
router.get("/me", auth, async (req, res) => {
  try {
    // Respuesta directa desde el middleware
    return res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });
  } catch (err) {
    console.error("/me error:", err);
    return res.status(500).json({ error: "Error al obtener perfil" });
  }
});

export default router;
