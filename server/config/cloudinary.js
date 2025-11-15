// server/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage ESPECÍFICO para PDFs
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const baseName = file.originalname.replace(/\.[^.]+$/, "");

    return {
      folder: "notes_pdfs",
      resource_type: "raw",           // ⬅️ FORZAMOS RAW
      type: "upload",                 // público
      public_id: `${Date.now()}-${baseName}`,
      // NO forzamos format, Cloudinary dejará .pdf tal cual
    };
  },
});

export const uploadPdf = multer({ storage: pdfStorage });
