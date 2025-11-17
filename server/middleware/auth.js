import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

dotenv.config();

// Verifica que el cliente envíe un token válido en el header 
const auth = async (req, res, next) => {
  try {
    // Se extrae el token del header
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Token inválido o ausente" });
    }
    // Se verifica el token con jwt 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Si el token no trae email, no podemos autenticar
    if (!decoded?.email) {
      return res.status(401).json({ error: "Token inválido (sin email)" });
    }


    // Se busca el usuario en la bd 
    const user = await User.findOne({ email: decoded.email })
      .select("_id name email")  // limitamos los campos expuestos
      .lean();

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    // Agregar usuario a req.user 
    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
    };

    // Continuar con el siguiente middleware/route
    next();

  } catch (error) {
    console.error("AUTH error:", error);
    return res.status(401).json({ error: "Token inválido o ausente" });
  }
};

export default auth;
