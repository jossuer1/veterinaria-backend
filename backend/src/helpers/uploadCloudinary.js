import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"

// Subir archivos locales a Cloudinary (Fotos desde dispositivo)
const subirImagenCloudinary = async (filePath, folder = "Pacientes") => {
    const { secure_url, public_id } = await cloudinary.uploader.upload(filePath, { folder })
    await fs.unlink(filePath)
    return { secure_url, public_id }
}

// Subir Base64 a Cloudinary (Avatares de IA)
const subirBase64Cloudinary = async (base64, folder = "Pacientes") => {
    try {
        // 1. Limpieza radical: Si viene con el prefijo "data:image/...", lo removemos limpiamente buscando la coma
        let limpiandoBase64 = base64;
        if (base64.includes(',')) {
            limpiandoBase64 = base64.split(',')[1];
        }

        // 2. Quitamos saltos de línea o espacios en blanco que dañen la decodificación
        limpiandoBase64 = limpiandoBase64.replace(/\s/g, '');

        // 3. Convertimos a Buffer binario nativo de Node.js
        const buffer = Buffer.from(limpiandoBase64, 'base64');

        // 4. Subida mediante Stream (Evita limitaciones de tamaño de string en el SDK)
        const secure_url = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { 
                    folder: folder, 
                    resource_type: 'image',
                    format: 'png' // Forzamos un formato de salida limpio para Cloudinary
                }, 
                (err, res) => {
                    if (err) reject(err);
                    else resolve(res.secure_url);
                }
            );

            stream.end(buffer);
        });

        return secure_url;

    } catch (error) {
        console.error("Error al subir Base64 a Cloudinary:", error);
        throw new Error("No se pudo procesar la imagen de la IA en el servidor");
    }
}

export {
    subirImagenCloudinary,
    subirBase64Cloudinary
}