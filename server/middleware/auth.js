import dotenv from "dotenv"
import jwt from "jsonwebtoken";

dotenv.config();


const auth = (req, res, next) => {

  const token = req.headers.authorization?.split(" ")[1];
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next(); 
  }catch(error){
    res.status(401).json({error: "Token invalido o ausente"})
  }

};


export default auth 