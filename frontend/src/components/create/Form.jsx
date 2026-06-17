import { useState } from "react"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import storeAuth from "../../context/storeAuth"
import generateAvatar from "../../helpers/consultarIA" // Asegúrate de que la ruta sea la correcta

export const Form = () => {
    // 1. Estado para los campos de texto requeridos por el modelo Paciente de Mongoose
    const [formData, setFormData] = useState({
        cedulaPropietario: "",
        nombrePropietario: "",
        emailPropietario: "",
        celularPropietario: "",
        nombreMascota: "",
        tipoMascota: "",
        fechaNacimientoMascota: "",
        detalleMascota: ""
    })

    // 2. Estado para el control del Avatar generado por Inteligencia Artificial
    const [stateAvatar, setStateAvatar] = useState({
        generatedImage: "https://cdn-icons-png.flaticon.com/512/2138/2138440.png", // URL para el <img /> local
        base64String: "", // Cadena de texto base64 pura para enviar al Backend
        prompt: "",
        loading: false
    })

    // 3. Estados de control de la interfaz (Híbrido IA vs Subida Manual)
    const [selectedOption, setSelectedOption] = useState("ia")
    const [fileImage, setFileImage] = useState(null) // Archivo físico para req.files.imagen
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    // Extraemos el token del store de Zustand para autorizar la petición
    const token = storeAuth((state) => state.token)

    // Manejador de cambios en los inputs generales
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Cambiar entre el modo Inteligencia Artificial y la subida de un archivo tradicional
    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value)
    }

    // Capturar el archivo cuando el usuario selecciona una imagen de su dispositivo
    const handleFileChange = (e) => {
        setFileImage(e.target.files[0])
    }

    // 🤖 Llamada al helper real de Hugging Face
    const handleGenerarIA = async () => {
        if (!stateAvatar.prompt.trim()) {
            return toast.warn("¡Por favor ingresa una descripción (prompt) primero!")
        }
        
        setStateAvatar(prev => ({ ...prev, loading: true }))
        
        try {
            // Invocamos tu helper
            const { base64Full, localImageUrl } = await generateAvatar(stateAvatar.prompt)

            setStateAvatar(prev => ({
                ...prev,
                base64String: base64Full,   // Va al req.body.avatarMascotaIA del backend
                generatedImage: localImageUrl, // Render visual instantáneo en el navegador
                loading: false
            }))
            
            toast.success("¡Avatar de la mascota generado con éxito!")

        } catch (error) {
            console.error(error)
            toast.error("Error al conectar con Hugging Face. Revisa tu API Key.")
            setStateAvatar(prev => ({ ...prev, loading: false }))
        }
    }

    // 🚀 Envío de los datos al servidor (Backend)
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validación básica en Frontend para asegurar que los campos no vayan vacíos
        if (Object.values(formData).includes("")) {
            return toast.error("Debes llenar todos los campos obligatorios del formulario")
        }

        setLoadingSubmit(true)
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/paciente/registro`

            // Usamos FormData debido a que el backend procesa archivos tradicionales mediante req.files
            const dataToSend = new FormData()

            // Adjuntamos los campos generales del formulario
            Object.entries(formData).forEach(([key, value]) => {
                dataToSend.append(key, value)
            })

            // Adjuntamos la imagen de forma condicional basándonos en la opción activa
            if (selectedOption === "upload" && fileImage) {
                // Coincide con req.files.imagen en tu backend
                dataToSend.append("imagen", fileImage) 
            } else if (selectedOption === "ia" && stateAvatar.base64String) {
                // Coincide con req.body.avatarMascotaIA en tu backend
                dataToSend.append("avatarMascotaIA", stateAvatar.base64String) 
            }

            // Petición HTTP POST hacia la API con las cabeceras multipart y token Bearer
            const respuesta = await axios.post(url, dataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            })

            toast.success(respuesta.data.msg || "Mascota registrada y correo enviado")
            
            // Limpieza integral del formulario tras un registro exitoso
            setFormData({
                cedulaPropietario: "", nombrePropietario: "", emailPropietario: "",
                celularPropietario: "", nombreMascota: "", tipoMascota: "",
                fechaNacimientoMascota: "", detalleMascota: ""
            })
            setFileImage(null)
            setStateAvatar({
                generatedImage: "https://cdn-icons-png.flaticon.com/512/2138/2138440.png",
                base64String: "",
                prompt: "",
                loading: false
            })

        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.msg || "Error al procesar el registro en el servidor")
        } finally {
            setLoadingSubmit(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <ToastContainer />
            
            <form onSubmit={handleSubmit}>
                
                {/* Sección: Información del propietario */}
                <fieldset className="border-2 border-gray-500 p-6 rounded-lg shadow-lg">
                    <legend className="text-xl font-bold text-gray-700 bg-gray-200 px-4 py-1 rounded-md">
                        Información del propietario
                    </legend>

                    {/* Campo Cédula */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold">Cédula</label>
                        <div className="flex items-center gap-10 mb-5">
                            <input
                                type="text"
                                name="cedulaPropietario"
                                value={formData.cedulaPropietario}
                                onChange={handleChange}
                                placeholder="Ingresa la cédula"
                                className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                            />
                            <button type="button" className="py-1 px-8 bg-gray-600 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-white sm:w-80">
                                Consultar
                            </button>
                        </div>
                    </div>

                    {/* Campo Nombres Completos */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold">Nombres completos</label>
                        <input
                            type="text"
                            name="nombrePropietario"
                            value={formData.nombrePropietario}
                            onChange={handleChange}
                            placeholder="Ingresa nombre y apellido"
                            className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                        />
                    </div>

                    {/* Campo Correo Electrónico */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                        <input
                            type="email"
                            name="emailPropietario"
                            value={formData.emailPropietario}
                            onChange={handleChange}
                            placeholder="Ingresa el correo electrónico"
                            className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                        />
                    </div>

                    {/* Campo Celular */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold">Celular</label>
                        <input
                            type="text"
                            name="celularPropietario"
                            value={formData.celularPropietario}
                            onChange={handleChange}
                            placeholder="Ingresa el celular"
                            className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                        />
                    </div>
                </fieldset>

                {/* Sección: Información del paciente */}
                <fieldset className="border-2 border-gray-500 p-6 rounded-lg shadow-lg mt-10">
                    <legend className="text-xl font-bold text-gray-700 bg-gray-200 px-4 py-1 rounded-md">
                        Información de la mascota
                    </legend>

                    {/* Campo Nombre Mascota */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold">Nombre</label>
                        <input
                            type="text"
                            name="nombreMascota"
                            value={formData.nombreMascota}
                            onChange={handleChange}
                            placeholder="Ingresar nombre"
                            className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                        />
                    </div>

                    {/* Selector de tipo de imagen */}
                    <label className="mb-2 block text-sm font-semibold">Imagen de la mascota</label>
                    <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="ia"
                                checked={selectedOption === "ia"}
                                onChange={handleOptionChange}
                            />
                            Generar con IA
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="upload"
                                checked={selectedOption === "upload"}
                                onChange={handleOptionChange}
                            />
                            Subir Imagen
                        </label>
                    </div>

                    {/* Render condicional: Generador de Imágenes AI */}
                    {selectedOption === "ia" && (
                        <div className="mt-5 p-4 bg-gray-50 rounded-lg border mb-5">
                            <label className="mb-2 block text-sm font-semibold text-gray-600">Prompt de Generación (Hugging Face)</label>
                            <div className="flex items-center gap-4 mb-5">
                                <input
                                    type="text"
                                    placeholder="Ej: Un gato persa gris con ojos azules en estilo caricatura 3D"
                                    className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                                    value={stateAvatar.prompt}
                                    onChange={(e) => setStateAvatar(prev => ({ ...prev, prompt: e.target.value }))}
                                />
                                <button
                                    type="button"
                                    onClick={handleGenerarIA}
                                    className="py-1 px-6 bg-indigo-600 text-white border rounded-xl hover:bg-indigo-800 transition-all text-sm font-medium whitespace-nowrap"
                                    disabled={stateAvatar.loading}
                                >
                                    {stateAvatar.loading ? "Generando..." : "Generar con IA"}
                                </button>
                            </div>
                            {stateAvatar.generatedImage && (
                                <div className="flex justify-center border p-2 bg-white rounded-md w-28 h-28 shadow-sm">
                                    <img src={stateAvatar.generatedImage} alt="Avatar IA de la mascota" className="object-cover w-full h-full rounded" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Render condicional: Subida local de Archivos */}
                    {selectedOption === "upload" && (
                        <div className="mt-5 p-4 bg-gray-50 rounded-lg border mb-5">
                            <label className="mb-2 block text-sm font-semibold text-gray-600">Subir imagen desde el ordenador</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                            />
                        </div>
                    )}

                    {/* Campos Tipo y Fecha de Nacimiento combinados */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                        <div>
                            <label htmlFor="tipoMascota" className="mb-2 block text-sm font-semibold">Tipo</label>
                            <select
                                id="tipoMascota"
                                name="tipoMascota"
                                value={formData.tipoMascota}
                                onChange={handleChange}
                                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700"
                            >
                                <option value="">--- Seleccionar ---</option>
                                <option value="gato">Gato</option>
                                <option value="perro">Perro</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="fechaNacimientoMascota" className="mb-2 block text-sm font-semibold">Fecha de nacimiento</label>
                            <input
                                id="fechaNacimientoMascota"
                                name="fechaNacimientoMascota"
                                type="date"
                                value={formData.fechaNacimientoMascota}
                                onChange={handleChange}
                                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700"
                            />
                        </div>
                    </div>
                    
                    {/* Campo Observación */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold">Observación</label>
                        <textarea
                            name="detalleMascota"
                            value={formData.detalleMascota}
                            onChange={handleChange}
                            placeholder="Ingresa el síntoma u observación de forma general"
                            className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5 h-24"
                        />
                    </div>

                </fieldset>

                {/* Botón de envío principal */}
                <button
                    type="submit"
                    className="bg-gray-800 w-full p-2 mt-5 text-slate-300 uppercase font-bold rounded-lg hover:bg-gray-600 transition-all cursor-pointer disabled:opacity-50"
                    disabled={loadingSubmit}
                >
                    {loadingSubmit ? "Registrando..." : "Registrar"}
                </button>

            </form>
        </div>
    )
}