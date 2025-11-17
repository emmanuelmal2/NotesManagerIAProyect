import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Nombre del usuario
  name: {
    type: String,
    required: true,
  },

  // Email único para login
  email: {
    type: String,
    required: true,
    unique: true,
  },

  // Hash de contraseña
  password: {
    type: String,
    required: true,
  },

  // Fecha de registro
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Modelo de usuario
const User = mongoose.model("User", userSchema);

export default User;
