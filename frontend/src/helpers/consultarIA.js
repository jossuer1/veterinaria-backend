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
            prompt: promptFormUser,
            
            // 🛠️ AGREGA ESTOS PARÁMETROS CRUCIALES DE CONFIGURACIÓN:
            width: 1024,         // Ancho nativo requerido por SDXL
            height: 1024,        // Alto nativo requerido por SDXL
            steps: 25,           // Fija los pasos para asegurar que complete el renderizado
            response_format: "b64_json"
        }),
    })

    const data = await response.json()

    if (!data?.data?.[0]?.b64_json) {
        console.error("API ERROR:", data)
        throw new Error("No se pudo obtener la imagen de la API de Hugging Face")
    }

    // 1. Extraemos el string Base64 puro
    const base64Raw = data.data[0].b64_json
    const base64Full = `data:image/png;base64,${base64Raw}`

    // 2. Conversión limpia a Blob para la vista previa local en tiempo real
    const resBlob = await fetch(base64Full)
    const blob = await resBlob.blob()
    
    // 3. URL temporal para pintar en el <img src="..." />
    const localImageUrl = URL.createObjectURL(blob)

    return {
        base64Full,
        localImageUrl
    }
}

export default generateAvatar