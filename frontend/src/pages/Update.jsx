import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useFetch } from "../hooks/useFetch"
import { toast } from "react-toastify"

const Update = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { fetchDataBackend } = useFetch()

    // Estado inicial unificado para coincidir exactamente con el esquema de MongoDB
    const [form, setForm] = useState({
        nombreMascota: "",
        tipoMascota: "",
        fechaNacimientoMascota: "",
        detalleMascota: "",
        nombrePropietario: "",
        celularPropietario: "",
        emailPropietario: "",
    })

    const [loading, setLoading] = useState(true)

    // 1. Cargar la data original del paciente al montar el componente
    const obtenerPaciente = async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/paciente/${id}`
        const storedUser = JSON.parse(localStorage.getItem("auth-token"))
        
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
        }

        try {
            const response = await fetchDataBackend(url, null, "GET", headers)
            if (response && response._id) {
                // Formateamos la fecha si viene completa (para el input type="date")
                let fechaFormateada = ""
                if (response.fechaNacimientoMascota) {
                    fechaFormateada = response.fechaNacimientoMascota.split("T")[0]
                }

                setForm({
                    nombreMascota: response.nombreMascota || "",
                    tipoMascota: response.tipoMascota || "",
                    fechaNacimientoMascota: fechaFormateada,
                    detalleMascota: response.detalleMascota || "",
                    nombrePropietario: response.nombrePropietario || "",
                    celularPropietario: response.celularPropietario || "",
                    emailPropietario: response.emailPropietario || "",
                })
            }
        } catch (error) {
            console.error(error)
            toast.error("No se pudo cargar la información del paciente")
            navigate("/dashboard/listar")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        obtenerPaciente()
    }, [id])

    // Manejador genérico de cambios en inputs
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    // 2. Enviar los datos actualizados mediante PUT
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validación de campos vacíos en el Frontend
        if (Object.values(form).includes("")) {
            toast.warning("Por favor, llena todos los campos del formulario")
            return
        }

        const url = `${import.meta.env.VITE_BACKEND_URL}/paciente/actualizar/${id}`
        const storedUser = JSON.parse(localStorage.getItem("auth-token"))
        
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
        }

        try {
            const response = await fetchDataBackend(url, form, "PUT", headers)
            
            if (response) {
                toast.success("¡Registro actualizado exitosamente!")
                navigate("/dashboard/listar")
            }
        } catch (error) {
            console.error(error)
            toast.error("Ocurrió un error al actualizar los datos")
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <p className="text-gray-500 font-semibold animate-pulse text-xl">Cargando datos del paciente...</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-5">
            <h1 className='font-black text-4xl text-gray-500'>Actualizar Historial</h1>
            <hr className='my-4 border-t-2 border-gray-300' />
            <p className='mb-8 text-gray-600'>Modifica los campos necesarios para mantener al día el expediente clínico de la mascota.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* SECCIÓN: DATOS DE LA MASCOTA */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
                    <h2 className="text-lg font-bold text-gray-700 uppercase tracking-wider">🐾 Datos de la Mascota</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase">Nombre de la Mascota:</label>
                            <input 
                                type="text"
                                name="nombreMascota"
                                value={form.nombreMascota}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ej: Firulais"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase">Tipo de Especie:</label>
                            <input 
                                type="text"
                                name="tipoMascota"
                                value={form.tipoMascota}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ej: Perro, Gato, Ave"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase">Fecha de Nacimiento:</label>
                            <input 
                                type="date"
                                name="fechaNacimientoMascota"
                                value={form.fechaNacimientoMascota}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase">Observaciones / Detalles Clínicos:</label>
                        <textarea 
                            name="detalleMascota"
                            value={form.detalleMascota}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describa síntomas, alergias o motivos de consulta..."
                        />
                    </div>
                </div>

                {/* SECCIÓN: DATOS DEL PROPIETARIO */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
                    <h2 className="text-lg font-bold text-gray-700 uppercase tracking-wider">👤 Datos del Propietario</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase">Nombre del Propietario:</label>
                            <input 
                                type="text"
                                name="nombrePropietario"
                                value={form.nombrePropietario}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase">Celular de Contacto:</label>
                            <input 
                                type="tel"
                                name="celularPropietario"
                                value={form.celularPropietario}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ej: 0987654321"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 uppercase">Correo Electrónico:</label>
                        <input 
                            type="email"
                            name="emailPropietario"
                            value={form.emailPropietario}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="propietario@correo.com"
                        />
                    </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/list")}
                        className="bg-gray-500 text-white px-6 py-2.5 rounded-md font-bold uppercase hover:bg-gray-600 transition-colors shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-700 text-white px-6 py-2.5 rounded-md font-bold uppercase hover:bg-blue-800 transition-colors shadow-sm"
                    >
                        Guardar Cambios
                    </button>
                </div>

            </form>
        </div>
    )
}

export default Update