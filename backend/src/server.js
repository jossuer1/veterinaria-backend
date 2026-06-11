import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

import cloudinary from 'cloudinary'
import fileUpload from "express-fileupload"

import routerVeterinario from './routers/veterinaria_route.js'
import routerPacientes from './routers/paciente_route.js'

dotenv.config()

const app = express()

// Middlewares
app.use(express.json())
app.use(cors())

// Puerto
app.set('port', process.env.PORT || 8000)

// Ruta principal
app.get('/', (req, res) => {
    res.send('Server on')
})


// Configuraciones
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


// Middlewares
app.use(express.json())
app.use(cors())

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './uploads'
}))


// Rutas API
app.use('/api', routerVeterinario)
app.use('/api', routerPacientes)

export default app