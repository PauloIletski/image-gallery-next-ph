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

interface CloudinaryResource {
  public_id: string
  format: string
  height: number
  width: number
}

const generateBlurPlaceholder = async (resource: any) => {
  try {
    return await getBase64ImageUrl(resource)
  } catch (error) {
    console.error('Erro ao gerar blur placeholder:', error)
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  }
}

export async function getGalleryPaths(): Promise<GalleryFolder[]> {
  try {
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME não configurado')
    }

    const { folders } = await cloudinary.api.sub_folders('galeries')

    if (!folders || !Array.isArray(folders)) {
      console.error('Nenhuma pasta encontrada ou resposta inválida do Cloudinary')
      return []
    }

    const foldersWithThumbnails = await Promise.all(
      folders.map(async (folder: any) => {
        try {
          const { resources } = await cloudinary.search
            .expression(`folder:galeries/${folder.name}/*`)
            .sort_by('public_id', 'desc')
            .with_field('context')
            .max_results(1)
            .execute()

          if (resources && resources.length > 0) {
            const blurDataUrl = await generateBlurPlaceholder(resources[0])
            return {
              slug: folder.name,
              thumbnail: {
                public_id: resources[0].public_id,
                format: resources[0].format,
                blurDataUrl
              }
            }
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
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME não configurado')
    }

    if (!slug) {
      throw new Error('Slug não fornecido')
    }

    const { resources } = await cloudinary.search
      .expression(`folder:galeries/${slug}/*`)
      .sort_by('public_id', 'desc')
      .with_field('context')
      .max_results(400)
      .execute()

    if (!resources || !Array.isArray(resources)) {
      console.error(`Nenhuma imagem encontrada para o álbum: ${slug}`)
      return { images: [] }
    }

    // Processa as imagens em lotes para evitar sobrecarga
    const batchSize = 5
    const images: ImageProps[] = []

    for (let i = 0; i < resources.length; i += batchSize) {
      const batch = resources.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(async (resource: CloudinaryResource, batchIndex: number) => {
          try {
            const index = i + batchIndex
            const blurDataUrl = await generateBlurPlaceholder(resource)

            return {
              id: index,
              height: resource.height,
              width: resource.width,
              public_id: resource.public_id,
              format: resource.format,
              blurDataUrl,
              isPortrait: resource.height > resource.width,
              tags: []
            } as ImageProps
          } catch (error) {
            console.error(`Erro ao processar imagem ${resource.public_id}:`, error)
            return null
          }
        })
      )

      // Filtra resultados nulos (imagens que falharam)
      const validResults = batchResults.filter((result): result is ImageProps => result !== null)
      images.push(...validResults)
    }

    if (images.length === 0) {
      console.error(`Nenhuma imagem válida processada para o álbum: ${slug}`)
    }

    return { images }
  } catch (error) {
    console.error('Erro ao buscar imagens:', error)
    throw error // Propaga o erro para ser tratado na página
  }
}
