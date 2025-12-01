/**
 * Gera URL de imagem do Cloudinary otimizada
 * Em modo de desenvolvimento/teste, pode usar URLs diretas sem transformações
 * para reduzir chamadas à API do Cloudinary
 */

const IS_DEV = process.env.NODE_ENV === 'development'
const USE_DIRECT_URLS = process.env.NEXT_PUBLIC_USE_DIRECT_IMAGE_URLS === 'true'

/**
 * Gera URL de imagem do Cloudinary
 * @param public_id - ID público da imagem no Cloudinary
 * @param format - Formato da imagem (jpg, png, etc)
 * @param transformations - Transformações opcionais (ex: 'c_scale,w_720')
 * @returns URL completa da imagem
 */
export function getImageUrl(
  public_id: string,
  format: string,
  transformations?: string
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  
  if (!cloudName) {
    console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME não configurado')
    return ''
  }

  // Em modo de desenvolvimento/teste, se configurado, usar URLs diretas sem transformações
  // Isso reduz chamadas à API do Cloudinary
  if (IS_DEV && USE_DIRECT_URLS && !transformations) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${public_id}.${format}`
  }

  // Usar transformações normalmente
  const transformStr = transformations ? `${transformations}/` : ''
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}${public_id}.${format}`
}

/**
 * Gera URL de imagem para thumbnail (pequena)
 */
export function getThumbnailUrl(public_id: string, format: string): string {
  return getImageUrl(public_id, format, 'c_scale,w_100,q_auto')
}

/**
 * Gera URL de imagem para visualização (média qualidade)
 */
export function getViewUrl(public_id: string, format: string): string {
  return getImageUrl(public_id, format, 'c_scale,w_720')
}

/**
 * Gera URL de imagem para download (alta qualidade/original)
 */
export function getDownloadUrl(public_id: string, format: string): string {
  // Para download, sempre usar a imagem original sem transformações
  return getImageUrl(public_id, format)
}

