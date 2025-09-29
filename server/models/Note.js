import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true 
    },
    content:{
        type: String,
        required:true
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

})

const Note = new mongoose.model("Note", noteSchema)

export default Note