import { Link } from 'react-router-dom'; // Asegúrate de que sea react-router-dom
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import { useFetch } from '../hooks/useFetch';

export const Forgot = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { fetchDataBackend, loading } = useFetch();

    const sendMail = async (dataForm) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/recuperarpassword`;
            const response = await fetchDataBackend(url, dataForm, 'POST');
            
            // Si tu useFetch no lanza error automáticamente, verifica la respuesta aquí
            toast.success("Si el correo existe, se enviará un enlace de recuperación.");
        } catch (error) {
            toast.error("Hubo un error al procesar la solicitud.");
        }
    };

    return (
        <div className="flex flex-col sm:flex-row h-screen">
            <ToastContainer />

            <div className="w-full sm:w-1/2 h-screen bg-white flex justify-center items-center">
                <div className="md:w-4/5 sm:w-full px-10">
                    <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-gray-500">
                        ¡Olvidaste tu contraseña!
                    </h1>
                    <small className="text-gray-400 block my-4 text-sm text-center">
                        No te preocupes, dinos tu correo.
                    </small>

                    <form onSubmit={handleSubmit(sendMail)}>
                        <div className="mb-1">
                            <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                            <input 
                                type="email" 
                                placeholder="ejemplo@correo.com" 
                                className="block w-full rounded-md border border-gray-300 py-1 px-1.5 text-gray-500 focus:outline-none focus:border-gray-600"
                                {...register("email", { 
                                    required: "El correo electrónico es obligatorio",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Correo inválido"
                                    }
                                })}
                            />
                            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div className="mb-3">
                            <button 
                                className="bg-gray-600 text-slate-300 border py-2 w-full rounded-xl mt-5 hover:scale-105 duration-300 hover:bg-gray-900 hover:text-white disabled:opacity-50" 
                                disabled={loading}
                            >
                                {loading ? 'Enviando...' : 'Enviar correo'} 
                            </button>
                        </div>
                    </form>

                    <div className="mt-5 text-xs border-b-2 py-4 "/>

                    <div className="mt-3 text-sm flex justify-between items-center">
                        <p>¿Ya posees una cuenta?</p>
                        <Link to="/login" className="py-2 px-5 bg-gray-600 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-white">
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </div>

            {/* Imagen lateral */}
            <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/public/images/catforgot.jpg')] bg-no-repeat bg-cover bg-center sm:block hidden">
            </div>
        </div>
    );
};