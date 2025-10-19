import express from "express"
import auth from "../middleware/auth.js"
import Note from "../models/Note.js"

const router =  express.Router();

// ruta para crear una nueva nota 
router.post("/notes", auth, async (req, res) =>{
    const { title, content, isTask, priority, status, dueDate, remindAt, remindSent, tags, pinned, archived } = req.body;

    const newItem = new Item({
        title,
        content,
        userId: req.user.id,
        isTask: isTask || false, // si no, será nota
        priority,
        status,
        dueDate,
        remindAt,
        remindSent,
        tags,
        pinned,
        archived
    });

    try{
        await newNote.save();
        res.json({message:"Nota creada exitosamente"})
    }catch(error){
        res.status(500).json({error:"Error al crear la nota"})
    }
});

// Se muestran los items segun su tipo 
router.get("/notes", auth, async (req, res) =>{
    const {type, status} = req.query
    const filter = {};

    // Se agregan las condiciones segun vayan existiendo 
    if (type === "task") filter.isTask = true;
    if (type === "note") filter.isTask = false;
    if (status) filter.status = status;

    const items = await Note.find(filter);
    res.json(items);

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

router.delete("/notes/:id", auth, async (req, res)=>{
    try{
        const eliminatedNote = await Note.findOneAndDelete({user: req.user.id, _id: req.params.id})
        if(eliminatedNote){
            res.json({message: "Nota eliminada correctamente"})
        }else{
            res.json({error: "No se encontro ninguna nota asocidada"})
        }
    }catch(error){
        res.status(400).json({error:"Formato de id invalido"})
    }
})

// PATCH /api/items/:id  (actualización parcial y segura)
router.patch("/items/:id", auth, async (req, res) => {
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
        updates.remindAt = new Date(updates.remindAt);
    }
    if (updates.remindAt) {
        updates.remindAt = new Date(updates.remindAt);
    }

    // Actualiza si el item pertenece al usuario autenticado
    const item = await Note.findOneAndUpdate(
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

