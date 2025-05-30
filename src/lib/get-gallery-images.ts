import { v2 as cloudinary } from 'cloudinary'
import getBase64ImageUrl from '../utils/generateBlurPlaceholder'
import type { ImageProps } from '../utils/types'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export interface Image {
  id: number
  public_id: string
  format: string
  blurDataUrl: string
}

export interface GalleryFolder {
  slug: string
  thumbnail?: {
    public_id: string
    format: string
    blurDataUrl: string
  }
}

export async function getGalleryPaths(): Promise<GalleryFolder[]> {
  try {
    const { folders } = await cloudinary.api.sub_folders('galeries')

    const foldersWithThumbnails = await Promise.all(
      folders.map(async (folder: any) => {
        try {
          // Busca a primeira imagem da pasta
          const { resources } = await cloudinary.search
            .expression(`folder:galeries/${folder.name}/*`)
            .sort_by('public_id', 'desc')
            .max_results(1)
            .execute()

          if (resources && resources.length > 0) {
            const thumbnail = {
              public_id: resources[0].public_id,
              format: resources[0].format,
              blurDataUrl: await getBase64ImageUrl(resources[0])
            }
            return { slug: folder.name, thumbnail }
          }

          return { slug: folder.name }
        } catch (error) {
          console.error(`Erro ao buscar thumbnail para ${folder.name}:`, error)
          return { slug: folder.name }
        }
      })
    )

    return foldersWithThumbnails
  } catch (error) {
    console.error('Erro ao buscar pastas:', error)
    return []
  }
}

export async function getGalleryImages(slug: string): Promise<{ images: ImageProps[] }> {
  try {
    const { resources } = await cloudinary.search
      .expression(`folder:galeries/${slug}/*`)
      .sort_by('public_id', 'desc')
      .max_results(400)
      .execute()

    const images: ImageProps[] = await Promise.all(
      resources.map(async (resource: any, index: number) => ({
        id: index,
        height: resource.height,
        width: resource.width,
        public_id: resource.public_id,
        format: resource.format,
        blurDataUrl: await getBase64ImageUrl(resource)
      }))
    )

    return { images }
  } catch (error) {
    console.error('Erro ao buscar imagens:', error)
    return { images: [] }
  }
}
