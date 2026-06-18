import { sendMailToOwner } from "../helpers/sendMail.js"
import { subirBase64Cloudinary, subirImagenCloudinary } from "../helpers/uploadCloudinary.js"
import Paciente from "../models/Paciente.js"
import mongoose from "mongoose"

// ==========================================
// 1. CREAR: Registrar Paciente
// ==========================================
const registrarPaciente = async (req, res) => {
    try {
        const { emailPropietario } = req.body

        // Validación simple de campos vacíos
        if (Object.values(req.body).includes("")) {
            return res.status(400).json({ msg: "Debes llenar todos los campos" })
        }

        const emailExistente = await Paciente.findOne({ emailPropietario })
        if (emailExistente) {
            return res.status(400).json({ msg: "El email ya se encuentra registrado" })
        }

        const password = Math.random().toString(36).toUpperCase().slice(2, 5)

        // Creamos la instancia primero con la data limpia y el veterinario autenticado
        const nuevoPaciente = new Paciente({
            ...req.body,
            veterinario: req.veterinarioHeader._id
        })

        // Encriptamos usando el método del modelo
        nuevoPaciente.passwordPropietario = await nuevoPaciente.encryptPassword("VET" + password)

        // Híbrido: Subida manual desde el ordenador
        if (req.files?.imagen) {
            const { secure_url, public_id } = await subirImagenCloudinary(req.files.imagen.tempFilePath)
            nuevoPaciente.avatarMascota = secure_url
            nuevoPaciente.avatarMascotaID = public_id
        }

        // Híbrido: String Base64 generado por la IA de Hugging Face
        if (req.body?.avatarMascotaIA) {
            const secure_url = await subirBase64Cloudinary(req.body.avatarMascotaIA)
            // Seteamos el avatar general y el de respaldo por IA
            nuevoPaciente.avatarMascota = secure_url 
            nuevoPaciente.avatarMascotaIA = secure_url
        }

        await nuevoPaciente.save()
        await sendMailToOwner(emailPropietario, "VET" + password)
        
        res.status(201).json({ msg: "Registro exitoso de la mascota y correo enviado al propietario" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` })
    }
}

// ==========================================
// 2. LEER: Listar todos los Pacientes Activos
// ==========================================
const listarPacientes = async (req, res) => {
    try {
        // Filtra solo los que pertenecen al veterinario logueado y están activos
        const pacientes = await Paciente.find({ estadoMascota: true, veterinario: req.veterinarioHeader._id })
            .select("-salidaMascota -createdAt -updatedAt -__v") 
        
        res.status(200).json(pacientes)
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Error en el servidor al listar pacientes" })
    }
}

// ==========================================
// 3. LEER DETALLE: Obtener un solo Paciente por ID
// ==========================================
const obtenerPaciente = async (req, res) => {
    const { id } = req.params

    // Validar que el ID de MongoDB sea estructuralmente correcto
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ msg: "Formato de ID no válido" })
    }

    try {
        const paciente = await Paciente.findById(id).select("-createdAt -updatedAt -__v")
        
        if (!paciente || !paciente.estadoMascota) {
            return res.status(404).json({ msg: "Paciente no encontrado o dado de baja" })
        }

        // Seguridad perimetral: Validar que el paciente pertenezca al veterinario que consulta
        if (paciente.veterinario.toString() !== req.veterinarioHeader._id.toString()) {
            return res.status(403).json({ msg: "Acción no autorizada para tu usuario" })
        }

        res.status(200).json(paciente)
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Error al obtener los detalles del paciente" })
    }
}

// ==========================================
// 4. ACTUALIZAR: Modificar Datos del Paciente
// ==========================================
const actualizarPaciente = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ msg: "Formato de ID no válido" })
    }

    try {
        const paciente = await Paciente.findById(id)

        if (!paciente || !paciente.estadoMascota) {
            return res.status(404).json({ msg: "Paciente no encontrado" })
        }

        if (paciente.veterinario.toString() !== req.veterinarioHeader._id.toString()) {
            return res.status(403).json({ msg: "Acción no autorizada" })
        }

        // Actualizamos los campos de texto usando cortocircuitos por si vienen vacíos algunos campos en la edición
        paciente.nombreMascota = req.body.nombreMascota || paciente.nombreMascota
        paciente.tipoMascota = req.body.tipoMascota || paciente.tipoMascota
        paciente.fechaNacimientoMascota = req.body.fechaNacimientoMascota || paciente.fechaNacimientoMascota
        paciente.detalleMascota = req.body.detalleMascota || paciente.detalleMascota
        paciente.nombrePropietario = req.body.nombrePropietario || paciente.nombrePropietario
        paciente.celularPropietario = req.body.celularPropietario || paciente.celularPropietario
        paciente.emailPropietario = req.body.emailPropietario || paciente.emailPropietario

        // Manejo híbrido de imágenes por si deciden actualizar la foto en la edición
        if (req.files?.imagen) {
            const { secure_url, public_id } = await subirImagenCloudinary(req.files.imagen.tempFilePath)
            paciente.avatarMascota = secure_url
            paciente.avatarMascotaID = public_id
        } else if (req.body?.avatarMascotaIA) {
            const secure_url = await subirBase64Cloudinary(req.body.avatarMascotaIA)
            paciente.avatarMascota = secure_url
            paciente.avatarMascotaIA = secure_url
        }

        const pacienteActualizado = await paciente.save()
        res.status(200).json({ msg: "Datos de la mascota actualizados con éxito", pacienteActualizado })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Error en el servidor al actualizar el paciente" })
    }
}

// ==========================================
// 5. ELIMINAR: Borrado Lógico (Inactivación)
// ==========================================
const eliminarPaciente = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ msg: "Formato de ID no válido" })
    }

    try {
        const paciente = await Paciente.findById(id)

        if (!paciente || !paciente.estadoMascota) {
            return res.status(404).json({ msg: "Paciente no encontrado" })
        }

        if (paciente.veterinario.toString() !== req.veterinarioHeader._id.toString()) {
            return res.status(403).json({ msg: "Acción no autorizada" })
        }

        // Cambiamos el estado para no destruir el historial clínico de la base de datos
        paciente.estadoMascota = false
        // Registramos opcionalmente la fecha de salida de la veterinaria
        paciente.salidaMascota = new Date() 

        await paciente.save()
        res.status(200).json({ msg: "El paciente ha sido dado de baja correctamente" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Error en el servidor al eliminar el paciente" })
    }
}

export {
    registrarPaciente,
    listarPacientes,
    obtenerPaciente,
    actualizarPaciente,
    eliminarPaciente
}