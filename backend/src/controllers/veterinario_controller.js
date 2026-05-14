import { sendMailToRecoveryPassword, sendMailToRegister } from "../helpers/sendMail.js"
import Veterinario from "../models/Veterinario.js"

const registro = async (req, res) => {

    try {

        const { email, password } = req.body

        // validar campos vacíos
        if (Object.values(req.body).includes("")) {return res.status(400).json({msg: "Lo sentimos, debes llenar todos los campos" })}
        // normalizar email
        const emailNormalizado = email.toLowerCase().trim()
        // verificar email
        const verificarEmailBDD = await Veterinario.findOne({email: emailNormalizado})
        if (verificarEmailBDD) {return res.status(400).json({msg: "Lo sentimos, el email ya se encuentra registrado"})}
        // crear veterinario
        const nuevoVeterinario = new Veterinario({...req.body,email: emailNormalizado })
        // encriptar password
        nuevoVeterinario.password = await nuevoVeterinario.encryptPassword(password)
        // token
        const token = nuevoVeterinario.createToken()
        // guardar
        await nuevoVeterinario.save()
        // enviar email
        await sendMailToRegister(emailNormalizado, token)
        // respuesta
        return res.status(200).json({ msg: "Revisa tu correo electrónico para confirmar tu cuenta" })

    } catch (error) {console.log(error); 
        return res.status(500).json({msg: "❌ Error en el servidor"})}
}

const confirmarMail = async (req,res)=>{
    try{
        // paso 1
        const {token} = req.params
        //paso 2
        const veterinarioBDD = await Veterinario.findOne({token})
        if(!veterinarioBDD)  return res.status(404).json({msg:"token invalido o cuenta ya confirmada"})
        // paso 3
        veterinarioBDD.token = null
        veterinarioBDD.confirmEmail = true
        await veterinarioBDD.save()
        //paso 4 
        res.status(200).json({ msg: "cuenta confirmada ya puedes inciar sesion" })

    }catch(error){console.log(error);
        return res.status(500).json({msg: "❌ Error en el servidor"})
    }
}

const recuperarPassword= async(req,res)=> {
    try{
        //Paso 1
        const {email} = req.body
        //Paso 2
        if(Object.values(req.body).includes(""))return res.status(400).json({msg: "todos los campos son obligatorios"})

        const veterinarioBDD = await Veterinario.findOne({email})
        if(!veterinarioBDD) return res.status(404).json({msg:"el usuario no se encuentra registrado"})
        //paso 3
        const token = veterinarioBDD.createToken()
        veterinarioBDD.token =token 
        await sendMailToRecoveryPassword(email,token)
        await veterinarioBDD.save()
        //paso 4
        res.status(200).json({msg:"Revisa tu correo electronico para restableces tu cuenta"})
    }catch(error){
        res.status(500).json({msg: "❌ Error en el servidor"})
    }
}

const comprobarTokenPassword= async(req,res)=> {
     try{

    }catch(error){
        res.status(500).json({msg: "❌ Error en el servidor"})
    }
}

const crearNuevoPassword= async(req,res)=> {
     try{

    }catch(error){
        res.status(500).json({msg: "❌ Error en el servidor"})
    }
}




export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword
}