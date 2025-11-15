import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    //  Dueño del item
    userId: {
      type: String,
      required: true,
    },

    // Contenido en notas y tareas
    title: {
      type: String,
      default: "",
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },

    // Tipo de ítem: false = Nota, true = Tarea
    isTask: {
      type: Boolean,
      default: false,
    },

    // Campos de tareas
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "doing", "done"],
      default: "todo",
    },
    dueDate: {
      type: Date,
    },

    // Recordatorios
    remindAt: {
      type: Date,
    },
    remindSent: {
      type: Boolean,
      default: false,
    },

    // Organización
    tags: {
      type: [String],
      default: [],
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },

    // New feature: subida de PDF´s
    file: {
      isPdf: { type: Boolean, default: false },
      name: String,
      url: String,
      mime: String,
      size: Number,
    },    
  },
  {
    timestamps: true, // crea automáticamente createdAt y updatedAt
  }
);

const Item = mongoose.model("Item", itemSchema);
export default Item;
