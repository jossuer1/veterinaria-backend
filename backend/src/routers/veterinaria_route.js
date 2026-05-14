import { Router } from 'express'
import {  comprobarTokenPassword, confirmarMail, crearNuevoPassword, recuperarPassword, registro } from '../controllers/veterinario_controller.js'

const router = Router()

// Rutas personalizadas
router.post("/registro", registro)

router.get("/confirmar/:token",confirmarMail)


router.post("/recuperarPassword",recuperarPassword)
router.post("/recuperarPassword/:token",comprobarTokenPassword)
router.post("/nuevopassword",crearNuevoPassword)


export default router