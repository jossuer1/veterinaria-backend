const API_URL = "https://router.huggingface.co/nscale/v1/images/generations"
const API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY

async function generateAvatar(promptFormUser) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "stabilityai/stable-diffusion-xl-base-1.0",
            prompt: promptFormUser
        }),
    })

    const data = await response.json()

    if (!data?.data?.[0]?.b64_json) {
        console.error("API ERROR:", data)
        throw new Error("No se pudo obtener la imagen de la API de Hugging Face")
    }

    // 1. Extraemos el string Base64 puro
    const base64Raw = data.data[0].b64_json
    // Le añadimos el prefijo de datos data:image/png;base64 para que sea una URI válida
    const base64Full = `data:image/png;base64,${base64Raw}`

    // 2. Procesión tradicional a Blob para visualización local óptima
    const byteCharacters = atob(base64Raw)
    const byteArray = Uint8Array.from(byteCharacters, c => c.charCodeAt(0))
    const blob = new Blob([byteArray], { type: "image/png" })
    
    // 3. Creamos la URL temporal para el <img src="..." />
    const localImageUrl = URL.createObjectURL(blob)

    // Retornamos ambos valores: el base64 estructurado para el backend y la url para la vista
    return {
        base64Full,
        localImageUrl
    }
}

export default generateAvatar