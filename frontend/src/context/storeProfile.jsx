import { create } from "zustand"
import axios from "axios"
import { toast } from "react-toastify"
import storeAuth from "./storeAuth" // Verifica que la ruta a tu storeAuth sea correcta

const getAuthHeaders = () => {
    // 1. Intentamos obtener el token directamente del estado de Zustand
    let token = storeAuth.getState().token;

    // 2. Si Zustand aún está rehidratando (asíncrono), lo rescatamos directo del LocalStorage
    if (!token) {
        const localData = JSON.parse(localStorage.getItem("auth-token"));
        token = localData?.state?.token;
    }

    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
        },
    }
}

const storeProfile = create((set) => ({
    user: null,
    clearUser: () => set({ user: null }),
    profile: async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/perfil`
            
            // Pasamos las cabeceras actualizadas en tiempo real
            const respuesta = await axios.get(url, getAuthHeaders())
            set({ user: respuesta.data })
        } catch (error) {
            console.error("Error en profile():", error)
        }
    },

    updateProfile: async (url, data) => {
        try {
            const respuesta = await axios.put(url, data, getAuthHeaders())
            set({ user: respuesta.data })
            toast.success("Perfil actualizado correctamente")
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.msg)
        }
    },
     
    updatePasswordProfile: async (url, data) => {
        try {
            const respuesta = await axios.put(url, data, getAuthHeaders())
            return respuesta
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.msg)
        }
    }
}))

export default storeProfile