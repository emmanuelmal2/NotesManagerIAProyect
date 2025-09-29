import express from "express"
import bcrypt from "bcrypt"
import User from "../models/User.js"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import auth from "../middleware/auth.js"

dotenv.config();

const router =  express.Router();
const saltRounds = 10;

router.post("/register", async (req, res) =>{
    try{
        const {name, email, password} = req.body

        // Verificando que los campos no estan vacios 
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Faltan campos" });
        }
        else{
            const existingUser = await User.findOne({email:email}).exec();
            // Comprobando si ya existe un usuario con ese email
            if(existingUser){
                res.status(400).json({error:"Usuario ya registrado"})
            }else{
                const hashedPassword =  await bcrypt.hash(password, saltRounds);

                const newUser = new User({name:name, email:email, password: hashedPassword })
                await newUser.save();

                res.json({message: "Usuario registrado con exito"})
            }
        }
   
    }catch(error){
        res.status(500).json({ error: "Error en el servidor" });

    }
})

router.post("/login", async (req,res) =>{
    try{
        const {email, password}= req.body;
        
        if(!email || !password){
            res.status(400).json({error: "Faltan campos"})
        }else{
            // Checando si la constraseña coincide
            const user = await User.findOne({ email: email }).select("email password");
            if (user){
                const match = await bcrypt.compare(password, user.password)
                // Contraseña correcta o incorrecta
                if(match){
                    const token = jwt.sign({ email: user.email}, process.env.JWT_SECRET, {
                    expiresIn: "1h"
                    });
                    res.json({token:token})
                }else{
                    return res.json({error: "Contraseña incorrecta"});
                }


            }else{
                return res.json({error: "La dirección email no se encuentra registrada"});
            }

        }
    }
    catch(error){
        res.status(500).json({ error: "Error en el servidor" });
    }

});


router.get("/me", auth, (req,res)=>{
    res.json({token:req.user})
})

export default router;