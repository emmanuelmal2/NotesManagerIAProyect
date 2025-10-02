import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";

dotenv.config();

const router = express.Router();
const saltRounds = 10;

const isEmail = (s) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").toLowerCase());

/* -------- REGISTER -------- */
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body || {};
    name = String(name || "").trim();
    email = String(email || "").trim().toLowerCase();
    password = String(password || "");

    // Validaciones
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Faltan campos" });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ message: "Email inválido" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Existencia
    const existingUser = await User.findOne({ email }).lean().exec();
    if (existingUser) {
      return res.status(400).json({ message: "Usuario ya registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    // Manejar duplicado por índice único (ver modelo abajo)
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Usuario ya registrado" });
    }
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

/* -------- LOGIN -------- */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body || {};
    email = String(email || "").trim().toLowerCase();
    password = String(password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Faltan campos" });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ message: "Email inválido" });
    }

    const user = await User.findOne({ email }).select("email password").exec();
    // Mensaje genérico para no revelar si el email existe
    const invalidMsg = "Credenciales inválidas";

    if (!user) {
      return res.status(401).json({ message: invalidMsg });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: invalidMsg });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({ token });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

/* -------- PROFILE -------- */
router.get("/me", auth, (req, res) => {
  res.json({ token: req.user });
});

export default router;
