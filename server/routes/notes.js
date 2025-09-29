import express from "express"
import auth from "../middleware/auth.js"
import Note from "../models/Note.js"

const router =  express.Router();

router.post("/notes", auth, async (req, res) =>{
    const newNote = new Note({
        title: req.body.title,
        content: req.body.content,
        user : req.user.id
    });
    try{
        await newNote.save();
        res.json({message:"Nota creada exitosamente"})
    }catch(error){
        res.status(500).json({error:"Error al crear la nota"})
    }
});

router.get("/notes", auth, async (req, res) =>{
    const notes = await Note.find({user:req.user.id}).sort({createdAt:-1})
    res.json(notes);
});

//endpoint para buscar una sola nota
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

router.put("/notes/:id", auth, async (req, res)=>{

    const updatedFields =  {};
    if(req.body.title){
        updatedFields.title = req.body.title
    }
    if(req.body.content){
        updatedFields.content = req.body.content
    }

    if(Object.keys(updatedFields).length == 0){
        res.status(400).json({error:"No hay campos a actualizar"})
        
    }else{
        try{
            const result = await Note.updateOne(
                { user: req.user.id, _id: req.params.id },
                updatedFields
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: "Nota no encontrada" });
            }

            res.json({ message: "Nota actualizada correctamente" });

        }catch(error){
            res.status(500).json({error:"Error al actualizar la nota"})
        }

    }

});

export default router;

