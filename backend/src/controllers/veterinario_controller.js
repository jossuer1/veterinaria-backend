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

const comprobarTokenPassword = async (req, res) => {
  try {

    const { token } = req.params

    const veterinarioBDD =
      await Veterinario.findOne({ token })

    if (!veterinarioBDD) {
      return res.status(404).json({
        msg: "Lo sentimos, no se puede recuperar la contraseña"
      })
    }

    res.status(200).json({
      msg: "Token confirmado"
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      msg: "❌ Error en el servidor"
    })
  }
}
const crearNuevoPassword = async (req, res) => {
  try {

    const { token } = req.params
    const { password, confirmpassword } = req.body

    const veterinarioBDD = await Veterinario.findOne({ token })
    if (!veterinarioBDD) {
      return res.status(404).json({
        msg: "No se puede validar la cuenta"
      })
    }

    if (password !== confirmpassword) {
      return res.status(400).json({
        msg: "Las contraseñas no coinciden"
      })
    }

    veterinarioBDD.token = null
    veterinarioBDD.password = await veterinarioBDD.encryptPassword(password)

    await veterinarioBDD.save()

    res.status(200).json({
      msg: "Contraseña actualizada correctamente"
    })

  } catch (error) {
    console.log("ERROR COMPLETO:", error)

    res.status(500).json({
      msg: "❌ Error en el servidor"
    })
  }
}

const login = async(req,res)=>{

    try {
        // Paso 1
        const {email,password} = req.body
        // Paso 2
        if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Debes llenar todos los campos"})
        const veterinarioBDD = await Veterinario.findOne({email}).select("-status -__v -token -updatedAt -createdAt")
        if(!veterinarioBDD) return res.status(404).json({msg:"El usuario no se encuentra registrado"})
        if(!veterinarioBDD.confirmEmail) return res.status(403).json({msg:"Debes verificar tu cuenta antes de iniciar sesión"})
        const verificarPassword = await veterinarioBDD.matchPassword(password)
        if(!verificarPassword) return res.status(401).json({msg:"El password no es correcto"})
        // Paso 3
        const {nombre,apellido,direccion,telefono,_id,rol} = veterinarioBDD
        // Paso 4
        res.status(200).json({
            rol,
            nombre,
            apellido,
            direccion,
            telefono,
            _id,
            email:veterinarioBDD.email
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword,
    login
}