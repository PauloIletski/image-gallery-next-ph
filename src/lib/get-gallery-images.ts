import { cloudinaryService } from '../utils/cloudinaryService'
import type { ImageProps } from '../utils/types'

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

export async function getGalleryPaths(): Promise<GalleryFolder[]> {
  try {
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME não configurado')
    }

    console.log('[getGalleryPaths] Iniciando busca de pastas...')
    const { folders } = await cloudinaryService.getGalleryFolders()

    if (!folders || !Array.isArray(folders)) {
      console.error('[getGalleryPaths] Nenhuma pasta encontrada ou resposta inválida do Cloudinary')
      return []
    }

    console.log(`[getGalleryPaths] ${folders.length} pastas encontradas: ${folders.map(f => f.name).join(', ')}`)

    const foldersWithDetails = await Promise.all(
      folders.map(async (folder: any) => {
        try {
          // Busca a primeira imagem de cada pasta
          const { resources } = await cloudinaryService.getGalleryImages(folder.name)

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
      console.error('[getGalleryImages] Slug não fornecido. Type:', typeof slug, 'Value:', slug)
      throw new Error('Slug não fornecido')
    }

    console.log(`[getGalleryImages] Iniciando busca para slug: "${slug}"`)

    // Buscar imagens (com cache e retry automático)
    const { resources } = await cloudinaryService.getGalleryImages(slug)

    // Verificar estado atual do rate limit
    const rateLimitInfo = cloudinaryService.getRateLimitInfo()

    // Limpar cache se necessário
    cloudinaryService.clearCache('gallery_key')

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
