import { MdDeleteForever, MdInfo, MdPublishedWithChanges } from "react-icons/md"
import { useFetch } from "../../hooks/useFetch"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

const Table = () => {
    const navigate = useNavigate()
    const { fetchDataBackend } = useFetch()
    const [patients, setPatients] = useState([])

    // 1. Obtener la lista de pacientes desde el Servidor
    const listPatients = async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/paciente/listar`
        const storedUser = JSON.parse(localStorage.getItem("auth-token"))
        
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
        }
        
        try {
            const response = await fetchDataBackend(url, null, "GET", headers)
            if (Array.isArray(response)) {
                setPatients(response)
            }
        } catch (error) {
            console.error("Error al obtener los pacientes:", error)
        }
    }

    // 2. Ejecutar la baja/inactivación lógica de una mascota
    const handleDelete = async (id, nombre) => {
        const confirmar = window.confirm(`¿Estás seguro de que deseas dar de baja a ${nombre}?`)
        if (!confirmar) return

        const url = `${import.meta.env.VITE_BACKEND_URL}/paciente/${id}`
        const storedUser = JSON.parse(localStorage.getItem("auth-token"))
        
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
        }

        try {
            await fetchDataBackend(url, null, "DELETE", headers)
            toast.success(`¡${nombre} ha sido dado de baja de forma exitosa!`)
            setPatients(prev => prev.filter(patient => patient._id !== id))
        } catch (error) {
            console.error(error)
            toast.error("Ocurrió un error al intentar eliminar el paciente")
        }
    }

    useEffect(() => {
        listPatients()
    }, [])

    // Vista de renderizado condicional si no hay datos en MongoDB
    if (patients.length === 0) {
        return (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 mt-5" role="alert">
                <span className="font-medium">No existen registros de mascotas activas en este momento.</span>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full mt-5 table-auto shadow-lg bg-white rounded-lg overflow-hidden">

                {/* Encabezado */}
                <thead className="bg-gray-800 text-slate-400">
                    <tr>
                        {["N°", "Foto", "Nombre mascota", "Nombre propietario", "Email", "Celular", "Estado", "Acciones"].map((header) => (
                            <th key={header} className="p-3 text-sm font-semibold tracking-wide">{header}</th>
                        ))}
                    </tr>
                </thead>

                {/* Cuerpo de la tabla */}
                <tbody className="divide-y divide-gray-200">
                    {patients.map((patient, index) => (
                        <tr className="hover:bg-gray-100 text-center transition-colors" key={patient._id}>
                            <td className="p-3 text-sm text-gray-700 font-medium">{index + 1}</td>
                            
                            {/* Celda del Avatar Corregida con prioridad 'avatarMascotaIA' */}
                            <td className="p-2 flex justify-center items-center">
                                <img 
                                    src={patient.avatarMascotaIA || patient.avatarMascota || "https://cdn-icons-png.flaticon.com/512/2138/2138440.png"} 
                                    alt={`Avatar de ${patient.nombreMascota}`}
                                    className="w-10 h-10 object-cover rounded-full border border-gray-300 shadow-sm"
                                />
                            </td>
                            
                            <td className="p-3 text-sm text-gray-700 font-semibold">{patient.nombreMascota}</td>
                            <td className="p-3 text-sm text-gray-600">{patient.nombrePropietario}</td>
                            <td className="p-3 text-sm text-gray-600">{patient.emailPropietario}</td>
                            <td className="p-3 text-sm text-gray-600">{patient.celularPropietario}</td>

                            <td className="p-3 text-sm">
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                    {patient.estadoMascota ? "activo" : "inactivo"}
                                </span>
                            </td>

                            <td className="p-3 text-center">
                                <MdPublishedWithChanges
                                    title="Actualizar"
                                    onClick={() => navigate(`/dashboard/update/${patient._id}`)}
                                    className="h-6 w-6 text-slate-700 cursor-pointer inline-block mr-3 hover:text-blue-600 transform hover:scale-110 duration-200"
                                />

                                <MdInfo
                                    title="Más información"
                                    onClick={() => navigate(`/dashboard/details/${patient._id}`)}
                                    className="h-6 w-6 text-slate-700 cursor-pointer inline-block mr-3 hover:text-green-600 transform hover:scale-110 duration-200"
                                />

                                <MdDeleteForever
                                    title="Eliminar"
                                    onClick={() => handleDelete(patient._id, patient.nombreMascota)}
                                    className="h-6 w-6 text-red-700 cursor-pointer inline-block hover:text-red-500 transform hover:scale-110 duration-200"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    )
}

export default Table