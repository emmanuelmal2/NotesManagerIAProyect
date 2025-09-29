import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import noteRoutes from "./routes/notes.js";

dotenv.config();

const mongo_url = process.env.MONGO_URL;
const port = process.env.PORT || 5000;

await mongoose.connect(mongo_url);

const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// NO usar app.options("*", cors()) en Express 5

app.use("/api", authRoutes);
app.use("/api", noteRoutes);

app.listen(port, () => console.log("Server started on port " + port));
