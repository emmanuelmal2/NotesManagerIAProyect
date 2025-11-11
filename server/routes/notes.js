import express from "express"
import auth from "../middleware/auth.js"
import Item from "../models/Note.js"

const router =  express.Router();

// ruta para crear una nueva nota 
router.post("/notes", auth, async (req, res) =>{
 
    try{
        const { title, content, isTask, priority, status, dueDate, remindAt, tags, pinned, archived } = req.body;

        const newItem = new Item({
            title,
            content,
            userId: req.user.id,
            isTask: isTask || false, // si no, será nota
            priority,
            status,
            dueDate,
            remindAt,
            tags,
            pinned,
            archived
        });

        await newItem.save();
        res.json({message:"Item creado exitosamente"})
    }catch(error){
        res.status(500).json({error:"Error al crear el item"})
    }
});

// Se muestran los items segun su tipo 
router.get("/notes", auth, async (req, res) => {
  try {
    const { type, status, query } = req.query;

    const filter = { userId: req.user.id };
    if (type === "task") filter.isTask = true;
    if (type === "note") filter.isTask = false;
    if (status) filter.status = status;
    if (query) filter.title = { $regex: query, $options: "i" }; // simple búsqueda por título

    const items = await Item.find(filter).sort({ pinned: -1, updatedAt: -1 });
    res.json(items);
  } catch (error) {
    console.error("GET /notes error:", error);
    res.status(500).json({ error: "Error al listar items" });
  }
});


//endpoint para buscar una sola nota
/*
router.get("/notes/:id", auth, async(req,res) => {
    try{
        const searchedNote = await Note.findOne({_id: req.params.id, user: req.user.id });
        if(searchedNote){
            res.json(searchedNote)
        }else{
            res.status(404).json({error: "No se encontro ninguna nota asociada"})
        }
    }catch(error){
        if(error.name === "CastError"){
            res.status(400).json({error: "Formato de id inválido"})
        }
        else{
            res.status(500).json({error: "Error del servidor"})
        }
    }
})
*/

// DELETE
router.delete("/notes/:id", auth, async (req, res) => {
  try {
    const deleted = await Item.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ error: "Item no encontrado" });
    res.json({ message: "Item eliminado correctamente" });
  } catch (error) {
    console.error("DELETE /notes/:id error:", error);
    res.status(400).json({ error: "Error al eliminar el item" });
  }
});

// PATCH   (actualización parcial y segura)
router.patch("/notes/:id", auth, async (req, res) => {
  try {
    // Campos que puede tocar el usuario
    const allowed = [
      "title",
      "content",
      "priority",   // si es tarea
      "status",     // si es tarea
      "dueDate",    // si es tarea
      "remindAt",   
      "tags",
      "pinned",
      "archived",
    ];

    // Construye el objeto de updates solo con campos permitidos
    const updates = {};
    for (const k of allowed) {
      if (k in req.body) updates[k] = req.body[k];
    }

    // No permitir cambios de tipo o de propietario
    if ("isTask" in req.body || "userId" in req.body || "remindSent" in req.body) {
      return res.status(400).json({ error: "Campos no editables" });
    }

    // Nada que actualizar
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No hay campos a actualizar" });
    }

    // Normaliza fechas si vienen como string
    if (updates.dueDate) {
        updates.dueDate = new Date(updates.dueDate);
    }
    if (updates.remindAt) {
        updates.remindAt = new Date(updates.remindAt);
    }

    // Actualiza si el item pertenece al usuario autenticado
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true } // devuelve el doc actualizado y respeta enums, etc.
    );

    if (!item) return res.status(404).json({ error: "Item no encontrado" });

    return res.json(item);

  } catch (err) {
    return res.status(500).json({ error: "Error al actualizar el item" });
  }
});

export default router;

