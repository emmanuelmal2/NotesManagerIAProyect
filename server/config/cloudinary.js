
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

/* 
   Se inicializa usando variables de entorno del backend (.env)
   para evitar exponer credenciales.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


/* 
   Storage para PDFs
   - Usamos CloudinaryStorage para que Multer guarde el archivo
     directamente en Cloudinary sin pasar por el disco.
   - resource_type: "raw" es CRUCIAL porque:
       Cloudinary por defecto trata los archivos como "image".
       RAW permite subir PDFs, ZIPs, DOCX y otros binarios.
   - public_id: se arma con timestamp para evitar colisiones.
   - folder: organizamos todos los PDFs en una carpeta dedicada.
 */
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {

    // Eliminamos la extensión del nombre original
    const baseName = file.originalname.replace(/\.[^.]+$/, "");

    return {
      folder: "notes_pdfs",        // carpeta en tu cuenta Cloudinary
      resource_type: "raw",        // obligatorio para PDFs
      type: "upload",              // acceso público estándar
      public_id: `${Date.now()}-${baseName}`, // nombre único y legible

      // No especificamos "format" → Cloudinary conserva el .pdf original
    };
  },
});


/* 
   Envuelve el storage y genera un middleware listo para usar
   en cualquier endpoint Express.
 */
export const uploadPdf = multer({ storage: pdfStorage });
