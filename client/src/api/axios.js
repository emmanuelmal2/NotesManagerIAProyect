import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL + "/api";
axios.defaults.timeout = 15000;         

console.log("API BASE:", axios.defaults.baseURL); // para verificar en Vercel
export default axios;
