import { Router } from 'express'
import { 
    registrarPaciente, 
    listarPacientes, 
    obtenerPaciente, 
    actualizarPaciente, 
    eliminarPaciente 
} from "../controllers/paciente_controller.js"
// Usamos el middleware que importas
import { verificarTokenJWT } from '../middlewares/JWT.js' 

const router = Router()

// ========================================================
// Rutas Generales de Pacientes
// ========================================================

// POST: Registrar un nuevo paciente
router.post('/paciente/registro', verificarTokenJWT, registrarPaciente)

// GET: Listar todos los pacientes del veterinario autenticado
router.get('/paciente/listar', verificarTokenJWT, listarPacientes) 

// ========================================================
// Rutas específicas por ID (CRUD)
// ========================================================
router.route("/paciente/:id")
    .get(verificarTokenJWT, obtenerPaciente)     
    .put(verificarTokenJWT, actualizarPaciente)    
    .delete(verificarTokenJWT, eliminarPaciente)  

export default router