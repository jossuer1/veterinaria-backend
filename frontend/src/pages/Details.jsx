/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useFetch } from "../hooks/useFetch"
import TableTreatments from "../components/treatments/Table"
import ModalTreatments from "../components/treatments/Modal"

const Details = () => {
    const { id } = useParams() // Captura el ID de la mascota desde la URL del Dashboard
    const navigate = useNavigate()
    const { fetchDataBackend } = useFetch()
    
    const [patient, setPatient] = useState(null)
    const [treatments, setTreatments] = useState(["demo"]) // Estado base para tratamientos

    // Función para consultar los datos completos del paciente en el Backend
    const getPatientDetails = async () => {
        // http://localhost:8000/api/paciente/:id
        const url = `${import.meta.env.VITE_BACKEND_URL}/paciente/${id}`
        const storedUser = JSON.parse(localStorage.getItem("auth-token"))
        
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
        }

        try {
            const response = await fetchDataBackend(url, null, "GET", headers)
            if (response && response._id) {
                setPatient(response)
            }
        } catch (error) {
            console.error("Error al obtener el detalle del paciente:", error)
        }
    }

    useEffect(() => {
        if (id) getPatientDetails()
    }, [id])

    // Guardaespalda: Renderizado de carga por si el backend tarda un milisegundo en responder
    if (!patient) {
        return (
            <div className="flex justify-center items-center h-60">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800 mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium animate-pulse text-lg">Cargando historial clínico...</p>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Cabecera del Módulo */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className='font-black text-4xl text-gray-500'>Visualizar Historial</h1>
                    <hr className='my-4 border-t-2 border-gray-300 w-full' />
                    <p className='mb-8 text-gray-600'>Este módulo te permite visualizar todos los datos registrados de la mascota y su propietario.</p>
                </div>
                <button 
                    onClick={() => navigate(-1)} 
                    className="px-5 py-2.5 text-sm bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 shadow-md transition-all duration-200"
                >
                    Volver al Listado
                </button>
            </div>

            {/* Contenedor Principal de Datos */}
            <div>
                <div className='m-5 flex flex-col lg:flex-row justify-between gap-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100'>

                    {/* Bloque de Información de Texto */}
                    <div className="flex-1">
                        <ul className="space-y-6">
                            
                            {/* Sección del Propietario */}
                            <li>
                                <h3 className="text-xl font-bold text-gray-800 mb-3 border-b pb-1 border-gray-200 uppercase tracking-wide text-sm text-gray-500">
                                    Datos del propietario
                                </h3>
                                <ul className="pl-2 space-y-2.5 text-md text-gray-700">
                                    <li><span className="text-gray-500 font-bold">Cédula:</span> {patient.cedulaPropietario || "No registrada"}</li>
                                    <li><span className="text-gray-500 font-bold">Nombres completos:</span> {patient.nombrePropietario}</li>
                                    <li><span className="text-gray-500 font-bold">Correo electrónico:</span> {patient.emailPropietario}</li>
                                    <li><span className="text-gray-500 font-bold">Celular:</span> {patient.celularPropietario}</li>
                                </ul>
                            </li>

                            {/* Sección de la Mascota */}
                            <li>
                                <h3 className="text-xl font-bold text-gray-800 mb-3 border-b pb-1 border-gray-200 uppercase tracking-wide text-sm text-gray-500">
                                    Datos de la mascota
                                </h3>
                                <ul className="pl-2 space-y-2.5 text-md text-gray-700">
                                    <li><span className="text-gray-500 font-bold">Nombre de la Mascota:</span> {patient.nombreMascota}</li>
                                    <li><span className="text-gray-500 font-bold">Tipo de Especie:</span> <span className="capitalize bg-gray-100 px-2 py-0.5 rounded text-sm font-semibold text-gray-600">{patient.tipoMascota}</span></li>
                                    <li><span className="text-gray-500 font-bold">Fecha de nacimiento:</span> {new Date(patient.fechaNacimientoMascota).toLocaleDateString('es-EC')}</li>
                                    <li>
                                        <span className="text-gray-500 font-bold">Estado en Sistema:</span>
                                        <span className="bg-green-100 text-green-700 text-xs font-bold ml-2 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                            {patient.estadoMascota ? "Activo" : "Inactivo"}
                                        </span>
                                    </li>
                                    <li>
                                        <span className="text-gray-500 font-bold block mb-1">Observaciones / Detalles clínicos:</span> 
                                        <p className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-600 italic">
                                            "{patient.detalleMascota || "Sin observaciones registradas al ingresar."}"
                                        </p>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Sección Lateral: Imagen Dinámica de Cloudinary / IA */}
                    {/* Sección Lateral: Imagen Dinámica de Cloudinary / IA */}
<div className="flex flex-col justify-center items-center bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-inner">
    <img 
        // Corregido: Primero busca 'avatarMascotaIA' que es el campo real en tu BD
        src={patient.avatarMascotaIA || patient.avatarMascota || "https://cdn-icons-png.flaticon.com/512/2138/2138440.png"} 
        alt={`Fotografía de ${patient.nombreMascota}`} 
        className='h-80 w-80 object-cover rounded-xl shadow-md border-4 border-white transition-transform duration-300 hover:scale-105' 
    />
    <span className="text-xs text-gray-400 mt-3 font-medium">
        {patient.avatarMascotaIA ? "✨ Avatar generado por Inteligencia Artificial" : "📸 Fotografía cargada localmente"}
    </span>
</div> 
                </div>

                <hr className='my-6 border-t-2 border-gray-300' />

                {/* Sección de Tratamientos Médicos */}
                <div className='flex justify-between items-center my-4 px-2'>
                    <p className="text-gray-600 font-medium">Historial de tratamientos clínicos aplicados a esta mascota</p>
                    <button className="px-5 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md transform hover:-translate-y-0.5 transition-all duration-150">
                        Registrar Tratamiento
                    </button>
                    {false && (<ModalTreatments/>)}
                </div>
                
                {/* Renderizado de Tratamientos de la Mascota */}
                {
                    treatments.length === 0
                        ?
                        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 shadow-sm" role="alert">
                            <span className="font-medium">Esta mascota no posee tratamientos registrados aún.</span>
                        </div>
                        :
                        <TableTreatments treatments={treatments} />
                }
            </div>
        </>
    )
}

export default Details