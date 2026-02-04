# NotesManager v2.0📝

Un gestor inteligente de notas y tareas con autenticación, visor de PDF y calendario integrado.
[Demo en linea](https://notes-manager-ia-proyect.vercel.app)


## Características principales 
- Registro e inicio de sesión de usuarios
- Crear, editar, eliminar y organizar notas
- Subida y visualización de archivos PDF (Cloudinary + Visor interno)
- Módulo de tareas con calendario interactivo
- Prioridades y estados de notas/tareas
- Arquitectura separada:
  - client/ → Frontend (React + Vite)
  - server/ → Backend (Node + Express + MongoDB)

## Tecnologías utilizadas
Frontend
- React 19 + Vite
- React Router
- Cloudinary Uploads
- react-pdf viewer
- CSS modularizado (dashboard, auth, home, tasks, variables…)

Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary SDK
- Multer (manejo de archivos)

## Instalación en local
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/emmanuelmal2/NotesManagerIAProyect.git
   cd NotesManagerIAProyect
2. Instalar dependencias del cliente
    ```bash
    cd client
    npm install
    npm start
3. Instalar dependencias del servidor 
    ```bash
    cd server
    npm install
    npm start

## 🔧 Variables de entorno 
📍 Archivo: server/.env
   ```bash
      PORT=5000
      MONGO_URI=tu_cadena_mongo
      JWT_SECRET=lo_que_quieras
      CLOUDINARY_CLOUD_NAME=xxxx
      CLOUDINARY_API_KEY=xxxx
      CLOUDINARY_API_SECRET=xxxx
   ```
📍 Archivo: client/.env (En producción cambiarás VITE_API_URL a tu backend deployado)
   ```bash
      VITE_API_URL=http://localhost:5000/api
   ```
