import express from "express";
import auth from "../middleware/auth.js";
import Item from "../models/Note.js";
import { uploadPdf } from "../config/cloudinary.js";

const router = express.Router();

// Obtener una nota por id (del usuario autenticado)
router.get("/notes/:id", auth, async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!item) {
      return res.status(404).json({ error: "Item no encontrado" });
    }

    res.json(item);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Formato de id inválido" });
    }
    console.error("GET /notes/:id error:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Crear una nueva nota/tarea
router.post("/notes", auth, async (req, res) => {
  try {
    const {
      title,
      content,
      isTask,
      priority,
      status,
      dueDate,
      remindAt,
      tags,
      pinned,
      archived,
    } = req.body;

    const newItem = new Item({
      title,
      content,
      userId: req.user.id,
      isTask: isTask || false, // por defecto es nota
      priority,
      status,
      dueDate,
      remindAt,
      tags,
      pinned,
      archived,
    });

    await newItem.save();
    res.json({ message: "Item creado exitosamente" });
  } catch (error) {
    console.error("POST /notes error:", error);
    res.status(500).json({ error: "Error al crear el item" });
  }
});

// Listar notas/tareas según filtros (tipo, estado, búsqueda)
router.get("/notes", auth, async (req, res) => {
  try {
    const { type, status, query } = req.query;

    const filter = { userId: req.user.id };
    if (type === "task") filter.isTask = true;
    if (type === "note") filter.isTask = false;
    if (status) filter.status = status;
    if (query) filter.title = { $regex: query, $options: "i" }; // búsqueda simple por título

    const items = await Item.find(filter).sort({
      pinned: -1,
      updatedAt: -1,
    });

    res.json(items);
  } catch (error) {
    console.error("GET /notes error:", error);
    res.status(500).json({ error: "Error al listar items" });
  }
});

// Subir un PDF y crear nota asociada
router.post(
  "/notes/pdf",
  auth,
  uploadPdf.single("file"),
  async (req, res) => {
    try {
      const userId = req.user?.id || req.user?._id || req.user?.userId;
      if (!userId) {
        console.warn("Auth sin userId. req.user =", req.user);
        return res.status(401).json({ error: "No autorizado (token inválido)" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Falta el archivo PDF" });
      }

      console.log("PDF subido a Cloudinary:", req.file);

      const { originalname, mimetype } = req.file;

      // URL devuelta por Cloudinary
      const url = req.file.secure_url || req.file.path || req.file.url;
      if (!url) {
        return res.status(500).json({ error: "Cloudinary no devolvió URL" });
      }

      const title =
        req.body.title?.trim() || originalname.replace(/\.pdf$/i, "");

      // Crea una nota ligada al PDF
      const item = await Item.create({
        userId,
        title,
        isTask: false,
        content: "",
        file: {
          isPdf: true,
          name: originalname,
          url,
          mime: mimetype || "application/pdf",
        },
      });

      res.json(item);
    } catch (err) {
      console.error("POST /notes/pdf error:", err);
      res.status(500).json({ error: "No se pudo subir el PDF" });
    }
  }
);

// Eliminar nota/tarea por id
router.delete("/notes/:id", auth, async (req, res) => {
  try {
    const deleted = await Item.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Item no encontrado" });
    }

    res.json({ message: "Item eliminado correctamente" });
  } catch (error) {
    console.error("DELETE /notes/:id error:", error);
    res.status(400).json({ error: "Error al eliminar el item" });
  }
});

// Actualizar nota/tarea de forma parcial (PATCH)
router.patch("/notes/:id", auth, async (req, res) => {
  try {
    // Campos permitidos
    const allowed = [
      "title",
      "content",
      "priority",
      "status",
      "dueDate",
      "remindAt",
      "tags",
      "pinned",
      "archived",
    ];

    const updates = {};
    for (const k of allowed) {
      if (k in req.body) updates[k] = req.body[k];
    }

    // Campos protegidos
    if (
      "isTask" in req.body ||
      "userId" in req.body ||
      "remindSent" in req.body
    ) {
      return res.status(400).json({ error: "Campos no editables" });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No hay campos a actualizar" });
    }

    // Normaliza fechas
    if (updates.dueDate) {
      updates.dueDate = new Date(updates.dueDate);
    }
    if (updates.remindAt) {
      updates.remindAt = new Date(updates.remindAt);
    }

    // Solo actualiza si el item pertenece al usuario
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ error: "Item no encontrado" });
    }

    return res.json(item);
  } catch (err) {
    console.error("PATCH /notes/:id error:", err);
    return res.status(500).json({ error: "Error al actualizar el item" });
  }
});

export default router;
