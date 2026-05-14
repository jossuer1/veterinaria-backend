import connection from './database.js'
import app from './server.js'
import veterinariaRoutes from './routers/veterinaria_route.js'

connection()

// Middleware de rutas
app.use("/api", veterinariaRoutes)

app.listen(app.get('port'), () => {
    console.log(`Server ok on http://localhost:${app.get('port')}`)
})