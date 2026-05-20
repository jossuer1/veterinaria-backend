import logoDog from '../assets/dog-hand.webp'
import { useState, useEffect } from 'react'
import { useFetch } from '../hooks/useFetch'
import { ToastContainer } from 'react-toastify'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'

const Reset = () => {
    const navigate = useNavigate()
    const { token } = useParams()
    const { fetchDataBackend, loading } = useFetch()
    const [tokenBack, setTokenBack] = useState(false)

    // CORREGIDO: Se agregó 'watch' para poder comparar las contraseñas en tiempo real
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm()

    // Cambiar contraseña
    const changePassword = async (dataForm) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/nuevopassword/${token}`
        const response = await fetchDataBackend(url, dataForm, 'POST')

        // Si el backend responde con éxito, redirige al Login
        if (response) {
            setTimeout(() => {
                navigate('/login')
            }, 2000)
        }
    }

    // Verificar token al cargar el componente
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/reset/${token}`
                // CORREGIDO: Cambiado de 'POST' a 'GET' para consumir el validador del backend
                await fetchDataBackend(url, undefined, 'GET')
                setTokenBack(true)
            } catch (error) {
                setTokenBack(false)
            }
        }
        verifyToken()
    }, [token])

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <ToastContainer />

            <h1 className="text-3xl font-semibold mb-2 text-center text-gray-500">
                Bienvenido nuevamente
            </h1>

            <small className="text-gray-400 block my-4 text-sm">
                Por favor, ingrese los siguientes datos
            </small>

            <img
                className="object-cover h-80 w-80 rounded-full border-4 border-solid border-slate-600"
                src={logoDog}
                alt="logo dog"
            />

            {tokenBack ? (
                <form
                    className="w-80 mt-5"
                    onSubmit={handleSubmit(changePassword)}
                >
                    <div className="mb-4">
                        {/* Nueva contraseña */}
                        <label className="mb-2 block text-sm font-semibold">
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Ingresa tu nueva contraseña"
                            className="block w-full rounded-md border border-gray-300 py-2 px-2 text-gray-500"
                            {...register("password", {
                                required: "La contraseña es obligatoria"
                            })}
                        />
                        {errors.password && (
                            <p className="text-red-800 text-sm">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        {/* Confirmar contraseña */}
                        <label className="mb-2 block text-sm font-semibold">
                            Confirmar contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Repite tu contraseña"
                            className="block w-full rounded-md border border-gray-300 py-2 px-2 text-gray-500"
                            {...register("confirmpassword", {
                                required: "Debes confirmar la contraseña",
                                // CORREGIDO: Ahora 'watch' funciona perfectamente en el cliente
                                validate: (value) => value === watch("password") || "Las contraseñas no coinciden"
                            })}
                        />
                        {errors.confirmpassword && (
                            <p className="text-red-800 text-sm">
                                {errors.confirmpassword.message}
                            </p>
                        )}
                    </div>

                    <div className="mb-3">
                        <button
                            className="bg-gray-600 text-slate-300 border py-2 w-full rounded-xl hover:scale-105 duration-300 hover:bg-gray-900 hover:text-white"
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Guardar contraseña'}
                        </button>
                    </div>
                </form>
            ) : (
                <p className="text-red-600 mt-5 text-sm font-semibold">Token inválido o expirado. Solicita un nuevo enlace.</p>
            )}
        </div>
    )
}

export default Reset