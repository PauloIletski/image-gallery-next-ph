import sharp from 'sharp'
import cloudinary from './cloudinary'

export default async function getBase64ImageUrl(image: { public_id: string; format: string }) {
  try {
    const result = await cloudinary.v2.api.resource(image.public_id, {
      transformation: [
        { width: 10, crop: 'scale' },
        { fetch_format: 'auto' },
      ],
    })

    const response = await fetch(result.secure_url)
    const buffer = await response.arrayBuffer()

    const base64 = await sharp(Buffer.from(buffer))
      .resize(10)
      .blur()
      .toBuffer()

    return `data:image/${image.format};base64,${base64.toString('base64')}`
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erro ao gerar blurDataURL:', error)
    }
    // Fallback base64 vazio transparente (1x1 px)
    return `data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==`
  }
}
