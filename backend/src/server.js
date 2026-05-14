// Requerir módulos
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';

import router from './routers/veterinaria_route.js'



// Inicializaciones
const app = express()
dotenv.config()


// Configuraciones 



// Middlewares -C

app.use(express.json())
app.use(cors())



// Variables globales y de entorno
//usar el puerto 3000 si no usar la variable de entorno 

app.set('port',process.env.PORT || 3000)



// Rutas 
app.get('/',(req,res)=> res.send("Server on"))



// Exportar la instancia de express por medio de app
export default  app