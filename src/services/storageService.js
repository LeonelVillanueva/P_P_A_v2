import { supabase } from '../config/supabase'
import { validateImageFile, validateId } from '../utils/validators'
import { generateSafeFileName, isValidImageOrigin } from '../utils/security'

const BUCKET_NAME = 'Imgs'
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

/**
 * Servicio para operaciones de almacenamiento con validación de seguridad
 */
export const storageService = {
  /**
   * Subir una imagen al storage con validación
   * @param {File} file - Archivo de imagen
   * @param {string} animeId - ID del anime
   * @returns {Promise<string>} URL pública de la imagen
   */
  async uploadImage(file, animeId) {
    // Validar ID
    const idValidation = validateId(animeId)
    if (!idValidation.valid) {
      throw new Error(idValidation.error)
    }
    
    // Validar archivo
    const fileValidation = validateImageFile(file)
    if (!fileValidation.valid) {
      throw new Error(fileValidation.error)
    }
    
    // Validar tamaño adicional
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('El archivo excede el tamaño máximo permitido (2MB)')
    }
    
    // Generar nombre de archivo seguro
    const safeFileName = generateSafeFileName(file.name, idValidation.value)
    const filePath = `animes/${safeFileName}`

    // Subir con opciones de seguridad
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // No permitir sobrescribir archivos
      })

    if (uploadError) {
      // No exponer detalles del error al cliente
      throw new Error('Error al subir la imagen. Intenta de nuevo.')
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return data.publicUrl
  },

  /**
   * Eliminar una imagen del storage con validación
   * @param {string} filePath - Ruta del archivo
   */
  async deleteImage(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Ruta de archivo inválida')
    }
    
    // Validar que la ruta no contenga caracteres peligrosos
    if (filePath.includes('..') || filePath.includes('/') && !filePath.startsWith('animes/')) {
      throw new Error('Ruta de archivo no permitida')
    }
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      // No exponer detalles del error
      throw new Error('Error al eliminar la imagen')
    }
  }
}

