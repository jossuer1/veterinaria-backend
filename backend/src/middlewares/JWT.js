import jwt from "jsonwebtoken"
import Veterinario from "../models/Veterinario.js"
import Paciente from "../models/Paciente.js"

const crearTokenJWT = (id, rol) => {
    return jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: "1d" })
}

const verificarTokenJWT = async (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) return res.status(401).json({ msg: "Acceso denegado: token no proporcionado" })
    
    try {
        const token = authorization.split(" ")[1]
        const { id, rol } = jwt.verify(token, process.env.JWT_SECRET)
        
        // 🔄 Convertimos el rol a minúsculas para que sea inmune a "Veterinario" o "VETERINARIO"
        const rolNormalizado = rol ? rol.toLowerCase() : "";

        if (rolNormalizado === "veterinario") {
            const veterinarioBDD = await Veterinario.findById(id).lean().select("-password")
            if (!veterinarioBDD) return res.status(401).json({ msg: "Usuario no encontrado" })
            
            req.veterinarioHeader = veterinarioBDD
            return next() // Colocamos return para asegurar que corte la ejecución aquí
        } 
        else if (rolNormalizado === "paciente") { // 💡 Es mejor validar explícitamente el paciente en lugar de un else abierto
            const pacienteBDD = await Paciente.findById(id).lean().select("-password")
            if (!pacienteBDD) return res.status(401).json({ msg: "Usuario no encontrado" })
            
            req.pacienteHeader = pacienteBDD
            return next()
        } 
        else {
            return res.status(401).json({ msg: "Rol no autorizado o inválido" })
        }

    } catch (error) {
        console.log(error)
        return res.status(401).json({ msg: `❌ Token inválido o expirado - ${error}` })
    }
}

export { 
    crearTokenJWT,
    verificarTokenJWT 
}