import { Router } from 'express'
import {
  confirmarMail,
  crearNuevoPassword,
  recuperarPassword,
  registro
} from '../controllers/veterinario_controller.js'

const router = Router()

// Registro
router.post("/registro", registro)

// Confirmar cuenta
router.get("/confirmar/:token", confirmarMail)

// Recuperar password (envía email)
router.post("/recuperarPassword", recuperarPassword)

// Cambiar password directamente
router.post("/nuevopassword/:token", crearNuevoPassword)

export default router