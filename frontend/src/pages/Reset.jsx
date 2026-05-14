import logoDog from "../assets/dog-hand.webp";
import { useState, useEffect } from "react";
import { useFetch } from "../hooks/useFetch";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";

const Reset = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const { fetchDataBackend, loading } = useFetch();

    // Estados para la validación del token
    const [tokenValido, setTokenValido] = useState(false);
    const [verificando, setVerificando] = useState(true);

    const { register, handleSubmit, formState: { errors }, watch } = useForm();

    // Verificar si el token es válido al cargar el componente
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/recuperarpassword/${token}`;
                // Si fetchDataBackend falla, debería lanzar un error que capture el catch
                await fetchDataBackend(url, "GET");
                setTokenValido(true);
            } catch (error) {
                setTokenValido(false);
                toast.error("Token inválido o expirado");
            } finally {
                setVerificando(false);
            }
        };
        if (token) verifyToken();
    }, [token]);

    const changePassword = async (dataForm) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/nuevopassword/${token}`;
            await fetchDataBackend(url, dataForm, "POST");
            toast.success("Contraseña actualizada correctamente");
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            toast.error("No se pudo actualizar la contraseña");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            <ToastContainer />

            <img
                className={`object-cover h-60 w-60 rounded-full border-4 border-solid ${verificando ? 'border-gray-200' : tokenValido ? 'border-slate-600' : 'border-red-400'} mb-6`}
                src={logoDog}
                alt="logo"
            />

            {verificando ? (
                <p className="text-xl text-gray-500 animate-pulse">Verificando enlace...</p>
            ) : tokenValido ? (
                <div className="w-full max-w-md">
                    <h1 className="text-3xl font-semibold mb-2 text-center text-gray-500">
                        Bienvenido nuevamente
                    </h1>
                    <p className="text-gray-400 text-center mb-6 text-sm">
                        Por favor, ingrese su nueva contraseña
                    </p>

                    <form className="bg-white p-8 shadow-lg rounded-2xl" onSubmit={handleSubmit(changePassword)}>
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-semibold">Nueva contraseña</label>
                            <input
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-600 focus:outline-none focus:border-blue-500"
                                {...register("password", {
                                    required: "La contraseña es obligatoria",
                                    minLength: { value: 6, message: "Mínimo 6 caracteres" },
                                })}
                            />
                            {errors.password && <p className="text-red-700 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-semibold">Confirmar contraseña</label>
                            <input
                                type="password"
                                placeholder="Repite tu contraseña"
                                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-600 focus:outline-none focus:border-blue-500"
                                {...register("confirmpassword", {
                                    required: "Debes confirmar la contraseña",
                                    validate: (value) => value === watch('password') || "Las contraseñas no coinciden"
                                })}
                            />
                            {errors.confirmpassword && <p className="text-red-700 text-xs mt-1">{errors.confirmpassword.message}</p>}
                        </div>

                        <button
                            className="bg-gray-700 text-white py-2 w-full rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Actualizando..." : "Cambiar Contraseña"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Enlace no válido</h2>
                    <p className="text-gray-500 mb-6">El enlace ha expirado o ya fue utilizado.</p>
                    <Link to="/forgot-password" size="sm" className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                        Solicitar nuevo enlace
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Reset;