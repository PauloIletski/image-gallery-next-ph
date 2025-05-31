import { v2 as cloudinary } from 'cloudinary'
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
  createdAt?: string
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
  created_at: string
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries === 0) {
      throw error
    }
    console.log(`Tentando novamente em ${delay}ms... (${retries} tentativas restantes)`)
    await new Promise(resolve => setTimeout(resolve, delay))
    return retryOperation(operation, retries - 1, delay * 2)
  }
}

export async function getGalleryPaths(): Promise<GalleryFolder[]> {
  try {
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME não configurado')
    }

    const { folders } = await retryOperation(() => cloudinary.api.sub_folders('galeries'))

    if (!folders || !Array.isArray(folders)) {
      console.error('Nenhuma pasta encontrada ou resposta inválida do Cloudinary')
      return []
    }

    const foldersWithDetails = await Promise.all(
      folders.map(async (folder: any) => {
        try {
          // Busca a primeira imagem de cada pasta com retry
          const { resources } = await retryOperation(() =>
            cloudinary.search
              .expression(`folder:galeries/${folder.name}/*`)
              .sort_by('created_at', 'asc')
              .max_results(1)
              .execute()
          )

          if (resources && resources.length > 0) {
            const now = new Date().toISOString()
            return {
              slug: folder.name,
              createdAt: now,
              thumbnail: {
                public_id: resources[0].public_id,
                format: resources[0].format,
                blurDataUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
              }
            }
          }

          return {
            slug: folder.name,
            createdAt: new Date().toISOString()
          }
        } catch (error) {
          console.error(`Erro ao buscar detalhes para ${folder.name}:`, error)
          return {
            slug: folder.name,
            createdAt: new Date().toISOString()
          }
        }
      })
    )

    // Ordena os álbuns pelo nome da pasta (ordem alfabética inversa)
    return foldersWithDetails.sort((a, b) => b.slug.localeCompare(a.slug))
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
      throw new Error('Ops: não foi possível carregar as imagens no momento, tente novamente mais tarde')
    }

    const images: ImageProps[] = resources.map((resource: CloudinaryResource, index: number) => ({
      id: index,
      height: resource.height,
      width: resource.width,
      public_id: resource.public_id,
      format: resource.format,
      blurDataUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      isPortrait: resource.height > resource.width,
      tags: []
    }))

    return { images }
  } catch (error) {
    console.error('Erro ao buscar imagens:', error)
    throw new Error('Ops: não foi possível carregar as imagens no momento, tente novamente mais tarde')
  }
}
