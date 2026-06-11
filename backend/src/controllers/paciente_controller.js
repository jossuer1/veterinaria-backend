import { sendMailToOwner } from "../helpers/sendMail.js"
import { subirBase64Cloudinary, subirImagenCloudinary } from "../helpers/uploadCloudinary.js"
import Paciente from "../models/Paciente.js"

const registrarPaciente = async(req,res)=>{
    try {
        const { emailPropietario } = req.body

        // Validación simple de campos vacíos
        if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Debes llenar todos los campos"})

        const emailExistente = await Paciente.findOne({emailPropietario})
        if(emailExistente) return res.status(400).json({msg:"El email ya se encuentra registrado"})

        const password = Math.random().toString(36).toUpperCase().slice(2, 5)

        // Creamos la instancia primero
        const nuevoPaciente = new Paciente({
            ...req.body,
            veterinario: req.veterinarioHeader._id
        })

        // Encriptamos usando el método de la instancia
        nuevoPaciente.passwordPropietario = await nuevoPaciente.encryptPassword("VET" + password)

        if (req.files?.imagen) {
            const { secure_url, public_id } = await subirImagenCloudinary(req.files.imagen.tempFilePath)
            nuevoPaciente.avatarMascota = secure_url
            nuevoPaciente.avatarMascotaID = public_id
        }

        if (req.body?.avatarMascotaIA) {
            const secure_url = await subirBase64Cloudinary(req.body.avatarMascotaIA)
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

const listarPacientes = async (req,res) =>{
    try {
        // Corregido el .select() para excluir campos correctamente usando '-'
        const pacientes = await Paciente.find({ estadoMascota: true, veterinario: req.veterinarioHeader._id })
            .select("-salidaMascota -createdAt -updatedAt -__v") 
        
        res.status(200).json(pacientes)
    } catch(error) {
        console.error(error)
        res.status(500).json({ msg: "Error en el servidor al listar pacientes" })
    }
}

export {
    registrarPaciente,
    listarPacientes
}