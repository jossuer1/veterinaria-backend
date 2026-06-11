import { Router } from 'express'
import { registrarPaciente, listarPacientes } from '../controllers/paciente_controller.js' // <-- Corregido e importado
import { verificarTokenJWT } from '../middlewares/JWT.js'

const router = Router()

router.post('/paciente/registro', verificarTokenJWT, registrarPaciente)
router.get('/listarPaciente', verificarTokenJWT, listarPacientes) // <-- Corregido el nombre

export default router