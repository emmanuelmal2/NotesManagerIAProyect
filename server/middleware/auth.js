// middleware/auth.js
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

dotenv.config();

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Token inválido o ausente" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Siempre buscamos en BD por email para tener name, id y email
    if (!decoded?.email) {
      return res.status(401).json({ error: "Token inválido (sin email)" });
    }

    const user = await User.findOne({ email: decoded.email })
      .select("_id name email")
      .lean();

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("AUTH error:", error);
    return res.status(401).json({ error: "Token inválido o ausente" });
  }
};

export default auth;
