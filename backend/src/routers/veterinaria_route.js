import { Router } from 'express'
import {
  confirmarMail,
  crearNuevoPassword,
  recuperarPassword,
  comprobarTokenPassword, // ← Corregido: Importación añadida
  registro,
  login
} from '../controllers/veterinario_controller.js'

const router = Router()

// Registro
router.post("/registro", registro)

// Confirmar cuenta
router.get("/confirmar/:token", confirmarMail)

// Recuperar password (envía email de recuperación)
router.post("/reset", recuperarPassword)

// Verificar el token desde la URL del correo (VISTA RESET)
router.get("/reset/:token", comprobarTokenPassword) // ← Corregido: Ruta añadida

// Cambiar password directamente (FORMULARIO RESET)
router.post("/nuevopassword/:token", crearNuevoPassword)

// Login
router.post('/login', login)

export default router